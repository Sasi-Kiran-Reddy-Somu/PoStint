import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest, { params }: { params: { workerId: string } }) {
  const session = await auth();
  if (!session || session.user.role !== "ops") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { workerId } = params;
  const body = await req.json() as { amount: number; reason: string };

  await prisma.$transaction([
    prisma.creditTransaction.create({
      data: {
        workerId,
        amountCredits: body.amount,
        direction: body.amount > 0 ? "earn" : "spend",
        state: "available",
        reason: `ops_adjustment: ${body.reason}`,
      },
    }),
    prisma.opsAction.create({
      data: {
        workerId, reviewerId: session.user.id,
        actionType: "adjust_credits",
        reason: body.reason,
        metadata: { amount: body.amount },
      },
    }),
  ]);

  return NextResponse.json({ success: true });
}
