import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { verificationQueue } from "@/lib/queue";
import { logIpEvent, getClientIp } from "@/lib/ip-logger";
import { T3_VERIFICATION_HOURS, BRAND_COOLDOWN_DAYS } from "@/lib/utils";
import { logHealthEvent } from "@/lib/account-health";
import { z } from "zod";

const GRACE_SECONDS = 5;

const submitSchema = z.object({
  url: z.string().url().refine((u) => {
    return /https?:\/\/(www\.|old\.)?reddit\.com\/.*\/comments\//.test(u);
  }, "Please paste a valid Reddit comment URL."),
  assignmentId: z.string(),
});

export async function POST(req: NextRequest, { params }: { params: { taskId: string } }) {
  const session = await auth();
  if (!session || session.user.role !== "worker") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const workerId = session.user.id;
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

  // Check submit window (with grace period)
  const now = Date.now();
  const deadline = assignment.submitDeadline.getTime() + GRACE_SECONDS * 1000;
  if (now > deadline) {
    return NextResponse.json({ error: "The submission window has expired." }, { status: 400 });
  }

  // Backend URL validation — fetch comment from Reddit
  const ua = process.env.REDDIT_USER_AGENT ?? "WorkerMarketplace/1.0";
  let commentData: Record<string, unknown> | null = null;
  try {
    const cleanUrl = url.replace(/\/$/, "");
    const res = await fetch(`${cleanUrl}.json`, { headers: { "User-Agent": ua } });
    if (!res.ok) {
      return NextResponse.json({ error: "We couldn't find that comment. Please check the URL and try again." }, { status: 400 });
    }
    const data = await res.json();
    // Find the comment
    for (const section of data) {
      const children = section?.data?.children ?? [];
      for (const child of children) {
        if (child.kind === "t1" || child.kind === "t3") { commentData = child.data; break; }
      }
      if (commentData) break;
    }
  } catch {
    // Let it proceed — we'll retry at T+3
  }

  if (commentData) {
    if (commentData.body === "[deleted]") {
      return NextResponse.json({ error: "This comment has been deleted. Please post a new one and submit that URL." }, { status: 400 });
    }
    if (commentData.author !== assignment.worker.redditUsername) {
      return NextResponse.json({ error: "This comment isn't from your linked account. Please post from your registered Reddit account." }, { status: 400 });
    }
  }

  const submittedAt = new Date();
  const releasesAt = new Date(submittedAt.getTime() + T3_VERIFICATION_HOURS * 3600_000);

  await prisma.$transaction(async (tx) => {
    await tx.taskAssignment.update({
      where: { id: assignmentId },
      data: { status: "submitted", submittedAt, postedUrl: url },
    });

    // Create pending credit transaction
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

    // Set brand cooldown
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

  // Schedule T+3 verification
  const delay = T3_VERIFICATION_HOURS * 3600_000;
  await verificationQueue.add("verify-submission", { assignmentId }, { delay });

  // Log IP (fire-and-forget)
  logIpEvent(workerId, ip, "submit", req.headers.get("user-agent") ?? undefined);

  return NextResponse.json({
    success: true,
    message: "Submitted! Credits will release in 3 days if your comment stays live.",
    releasesAt,
  });
}
