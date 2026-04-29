import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session || session.user.role !== "ops") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const disputes = await prisma.dispute.findMany({
    where: { status: { in: ["open", "in_review"] } },
    include: {
      worker: { select: { redditUsername: true, tier: true, accountHealthScore: true } },
      taskAssignment: { include: { task: { select: { targetSubreddit: true, creditValue: true } } } },
    },
    orderBy: { openedAt: "asc" },
  });

  return NextResponse.json({ disputes });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session || session.user.role !== "worker") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const workerId = session.user.id;
  const body = await req.json() as {
    taskAssignmentId: string;
    reasonCategory: string;
    workerExplanation: string;
    evidenceUrl?: string;
  };

  if (!body.workerExplanation || body.workerExplanation.length < 50) {
    return NextResponse.json({ error: "Explanation must be at least 50 characters." }, { status: 400 });
  }

  // Rate limit: max 3 disputes per 30 days
  const recentDisputes = await prisma.dispute.count({
    where: { workerId, openedAt: { gte: new Date(Date.now() - 30 * 86_400_000) } },
  });
  if (recentDisputes >= 3) {
    return NextResponse.json({ error: "You have reached the maximum disputes for this period." }, { status: 429 });
  }

  // Must be within 30 days of task
  const assignment = await prisma.taskAssignment.findUnique({
    where: { id: body.taskAssignmentId },
  });
  if (!assignment || assignment.workerId !== workerId) {
    return NextResponse.json({ error: "Assignment not found." }, { status: 404 });
  }
  if (assignment.status !== "failed") {
    return NextResponse.json({ error: "You can only dispute failed verifications." }, { status: 400 });
  }
  const ageMs = Date.now() - assignment.claimedAt.getTime();
  if (ageMs > 30 * 86_400_000) {
    return NextResponse.json({ error: "Disputes on tasks older than 30 days are not accepted." }, { status: 400 });
  }

  const dispute = await prisma.dispute.create({
    data: {
      workerId,
      taskAssignmentId: body.taskAssignmentId,
      reasonCategory: body.reasonCategory,
      workerExplanation: body.workerExplanation,
      evidenceUrl: body.evidenceUrl,
    },
  });

  return NextResponse.json({ success: true, disputeId: dispute.id });
}
