import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session || session.user.role !== "worker") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const workerId = session.user.id;

  const body = await req.json();
  const { taskAssignmentId, reasonCategory, workerExplanation, evidenceUrl } = body;

  if (!taskAssignmentId || !reasonCategory || !workerExplanation?.trim()) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const assignment = await prisma.taskAssignment.findFirst({
    where: { id: taskAssignmentId, workerId },
    include: { task: true },
  });

  if (!assignment) {
    return NextResponse.json({ error: "Assignment not found" }, { status: 404 });
  }

  if (!["failed", "expired"].includes(assignment.status)) {
    return NextResponse.json({ error: "Only failed or expired tasks can be disputed" }, { status: 422 });
  }

  const existing = await prisma.dispute.findFirst({ where: { taskAssignmentId } });
  if (existing) {
    return NextResponse.json({ error: "Dispute already submitted for this task" }, { status: 409 });
  }

  const dispute = await prisma.dispute.create({
    data: {
      workerId,
      taskAssignmentId,
      reasonCategory,
      workerExplanation: workerExplanation.trim(),
      evidenceUrl: evidenceUrl?.trim() || null,
      status: "open",
    },
  });

  await prisma.notification.create({
    data: {
      workerId,
      channel: "in_app",
      type: "dispute_submitted",
      title: "Dispute submitted",
      body: `Your dispute for r/${assignment.task.targetSubreddit} has been received and will be reviewed by our team.`,
    },
  });

  return NextResponse.json({ disputeId: dispute.id });
}
