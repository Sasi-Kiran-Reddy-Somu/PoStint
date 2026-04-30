import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verificationQueue } from "@/lib/queue";
import { logIpEvent, getClientIp } from "@/lib/ip-logger";
import { T3_VERIFICATION_HOURS, BRAND_COOLDOWN_DAYS } from "@/lib/utils";
import { z } from "zod";

const WORKER_ID = "cmokektv0002srgywx6xnim0j";
const GRACE_SECONDS = 5;

const submitSchema = z.object({
  url: z.string().url().refine((u) => {
    return /https?:\/\/(www\.|old\.)?reddit\.com\/.*\/comments\//.test(u);
  }, "Please paste a valid Reddit comment URL."),
  assignmentId: z.string(),
});

export async function POST(req: NextRequest) {
  const workerId = WORKER_ID;
  const ip = getClientIp(req);

  let body: unknown;
  try { body = await req.json(); } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = submitSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.errors[0]?.message }, { status: 400 });
  }

  const { url, assignmentId } = parsed.data;

  const assignment = await prisma.taskAssignment.findUnique({
    where: { id: assignmentId },
    include: { task: true, worker: true },
  });

  if (!assignment || assignment.workerId !== workerId) {
    return NextResponse.json({ error: "Assignment not found." }, { status: 404 });
  }

  if (assignment.status !== "claimed") {
    return NextResponse.json({ error: "This assignment cannot be submitted." }, { status: 400 });
  }

  const now = Date.now();
  const deadline = assignment.submitDeadline.getTime() + GRACE_SECONDS * 1000;
  if (now > deadline) {
    return NextResponse.json({ error: "The submission window has expired." }, { status: 400 });
  }

  const ua = process.env.REDDIT_USER_AGENT ?? "WorkerMarketplace/1.0";
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4000);
    const cleanUrl = url.replace(/\/$/, "");
    const res = await fetch(`${cleanUrl}.json`, {
      headers: { "User-Agent": ua },
      signal: controller.signal,
    });
    clearTimeout(timeout);
    if (res.ok) {
      const data = await res.json();
      let commentData: Record<string, unknown> | null = null;
      for (const section of data) {
        const children = section?.data?.children ?? [];
        for (const child of children) {
          if (child.kind === "t1" || child.kind === "t3") { commentData = child.data; break; }
        }
        if (commentData) break;
      }
      if (commentData?.body === "[deleted]") {
        return NextResponse.json({ error: "This comment has been deleted." }, { status: 400 });
      }
    }
  } catch {
    // Timeout or network error — proceed, T+3 worker will verify
  }

  const submittedAt = new Date();
  const releasesAt = new Date(submittedAt.getTime() + T3_VERIFICATION_HOURS * 3600_000);

  await prisma.$transaction(async (tx) => {
    await tx.taskAssignment.update({
      where: { id: assignmentId },
      data: { status: "submitted", submittedAt, postedUrl: url },
    });

    await tx.creditTransaction.create({
      data: {
        workerId,
        amountCredits: assignment.task.creditValue,
        direction: "earn",
        state: "pending",
        taskAssignmentId: assignmentId,
        releasesAt,
      },
    });

    if (assignment.task.brandId) {
      await tx.workerCooldown.upsert({
        where: { workerId_brandId: { workerId, brandId: assignment.task.brandId } },
        create: {
          workerId,
          brandId: assignment.task.brandId,
          taskId: assignment.taskId,
          expiresAt: new Date(Date.now() + BRAND_COOLDOWN_DAYS * 86_400_000),
        },
        update: {
          lastPaidTaskAt: new Date(),
          expiresAt: new Date(Date.now() + BRAND_COOLDOWN_DAYS * 86_400_000),
        },
      });
    }
  });

  const delay = T3_VERIFICATION_HOURS * 3600_000;
  await verificationQueue.add("verify-submission", { assignmentId }, { delay });

  logIpEvent(workerId, ip, "submit", req.headers.get("user-agent") ?? undefined);

  return NextResponse.json({
    success: true,
    message: "Submitted! Credits will release in 3 days if your comment stays live.",
    releasesAt,
  });
}
