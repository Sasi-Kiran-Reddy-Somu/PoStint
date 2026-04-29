import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest, { params }: { params: { disputeId: string } }) {
  const session = await auth();
  if (!session || session.user.role !== "ops") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json() as {
    resolution: "upheld" | "reversed" | "partial";
    creditsPaid?: number;
    notes: string;
  };

  if (!body.notes) return NextResponse.json({ error: "Notes required" }, { status: 400 });

  const dispute = await prisma.dispute.findUnique({
    where: { id: params.disputeId },
    include: { taskAssignment: { include: { task: true } } },
  });
  if (!dispute) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await prisma.$transaction(async (tx) => {
    await tx.dispute.update({
      where: { id: params.disputeId },
      data: {
        status: "resolved",
        resolution: body.resolution,
        creditsPaid: body.creditsPaid,
        reviewerNotes: body.notes,
        resolvedBy: session.user.id,
        resolvedAt: new Date(),
      },
    });

    if (body.resolution === "reversed" || body.resolution === "partial") {
      const credits = body.creditsPaid ?? dispute.taskAssignment.task.creditValue;
      await tx.creditTransaction.create({
        data: {
          workerId: dispute.workerId,
          amountCredits: credits,
          direction: "earn",
          state: "available",
          reason: "dispute_resolved",
        },
      });
    }

    await tx.opsAction.create({
      data: {
        workerId: dispute.workerId,
        reviewerId: session.user.id,
        actionType: "resolve_dispute",
        reason: body.resolution,
        notes: body.notes,
        metadata: { disputeId: params.disputeId, creditsPaid: body.creditsPaid },
      },
    });

    await tx.notification.create({
      data: {
        workerId: dispute.workerId,
        channel: "in_app",
        type: "dispute_resolved",
        title: `Dispute ${body.resolution}`,
        body: body.resolution === "reversed"
          ? `Your dispute was resolved in your favor. Credits have been added to your balance.`
          : body.resolution === "partial"
          ? `Your dispute was partially resolved. Some credits added.`
          : `Your dispute was reviewed and the original decision stands.`,
      },
    });
  });

  return NextResponse.json({ success: true });
}
