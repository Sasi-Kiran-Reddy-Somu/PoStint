import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { emailQueue } from "@/lib/queue";

export async function POST(req: NextRequest, { params }: { params: { workerId: string } }) {
  const session = await auth();
  if (!session || session.user.role !== "ops") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { workerId } = params;
  const body = await req.json() as { reason: string; notes?: string };

  // Void all pending credits
  await prisma.creditTransaction.updateMany({
    where: { workerId, state: "pending" },
    data: { state: "voided", voidedAt: new Date(), voidedBy: "ops", reason: "worker_suspended" },
  });

  await prisma.$transaction([
    prisma.worker.update({ where: { id: workerId }, data: { status: "suspended" } }),
    prisma.opsAction.create({
      data: {
        workerId,
        reviewerId: session.user.id,
        actionType: "suspend",
        reason: body.reason,
        notes: body.notes,
      },
    }),
    prisma.notification.create({
      data: {
        workerId,
        channel: "in_app",
        type: "account_suspended",
        title: "Account suspended",
        body: "Your account has been suspended. You can still withdraw your available credits. Contact support for appeal.",
      },
    }),
  ]);

  await emailQueue.add("email", { type: "account-suspended", workerId });

  return NextResponse.json({ success: true });
}
