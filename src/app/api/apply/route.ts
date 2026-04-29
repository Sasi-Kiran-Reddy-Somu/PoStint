import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { vettingFilterQueue } from "@/lib/queue";
import { getClientIp } from "@/lib/ip-logger";
import { z } from "zod";

const DISPOSABLE_DOMAINS = ["mailinator.com", "tempmail.com", "guerrillamail.com", "throwam.com", "sharklasers.com"];
const RATE_LIMIT_MAP = new Map<string, number[]>();
const RATE_LIMIT_WINDOW_MS = 3600_000;
const RATE_LIMIT_MAX = 3;

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const times = (RATE_LIMIT_MAP.get(ip) ?? []).filter((t) => now - t < RATE_LIMIT_WINDOW_MS);
  if (times.length >= RATE_LIMIT_MAX) return true;
  RATE_LIMIT_MAP.set(ip, [...times, now]);
  return false;
}

const schema = z.object({
  redditUsername: z
    .string()
    .min(3)
    .max(20)
    .regex(/^[a-zA-Z0-9_-]+$/, "Invalid Reddit username format")
    .transform((v) => v.replace(/^\/?(u\/)?/, "")),
  email: z.string().email(),
  country: z.enum(["US", "Canada"]),
  referralCode: z.string().optional(),
});

export async function POST(req: NextRequest) {
  const ip = getClientIp(req);

  if (isRateLimited(ip)) {
    return NextResponse.json({ error: "Too many submissions. Please try again later." }, { status: 429 });
  }

  let body: unknown;
  try { body = await req.json(); } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.errors[0]?.message ?? "Validation error" }, { status: 400 });
  }

  const { redditUsername, email, country, referralCode } = parsed.data;

  // Check disposable email
  const domain = email.split("@")[1]?.toLowerCase();
  if (domain && DISPOSABLE_DOMAINS.includes(domain)) {
    return NextResponse.json({ error: "Please use a permanent email address." }, { status: 400 });
  }

  // Duplicate check
  const existing = await prisma.application.findFirst({
    where: { OR: [{ redditUsername }, { email }] },
  });
  if (existing) {
    return NextResponse.json(
      { error: "This Reddit account has already applied. Contact support if you believe this is an error." },
      { status: 409 }
    );
  }

  const workerExisting = await prisma.worker.findFirst({
    where: { OR: [{ redditUsername }, { email }] },
  });
  if (workerExisting) {
    return NextResponse.json(
      { error: "This Reddit account has already applied. Contact support if you believe this is an error." },
      { status: 409 }
    );
  }

  const application = await prisma.application.create({
    data: { redditUsername, email, country, referralCode, status: "pending_filter" },
  });

  // Enqueue vetting filter asynchronously
  await vettingFilterQueue.add("filter-application", { applicationId: application.id });

  return NextResponse.json({ success: true, applicationId: application.id }, { status: 201 });
}
