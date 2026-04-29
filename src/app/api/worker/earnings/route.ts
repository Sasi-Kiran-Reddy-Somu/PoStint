import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET(_req: NextRequest) {
  const session = await auth();
  if (!session || session.user.role !== "worker") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const workerId = session.user.id;

  const [pendingCredits, availableCredits, lifetimeEarned, pendingBonuses] = await Promise.all([
    prisma.creditTransaction.aggregate({
      where: { workerId, state: "pending", direction: "earn" },
      _sum: { amountCredits: true },
    }),
    prisma.creditTransaction.aggregate({
      where: { workerId, state: "available" },
      _sum: { amountCredits: true },
    }),
    prisma.creditTransaction.aggregate({
      where: { workerId, direction: "earn", state: { in: ["available", "withdrawn"] } },
      _sum: { amountCredits: true },
    }),
    prisma.workerBonus.findMany({
      where: { workerId, appliedAt: null },
    }),
  ]);

  const pending = pendingCredits._sum.amountCredits ?? 0;
  const available = availableCredits._sum.amountCredits ?? 0;
  const lifetime = lifetimeEarned._sum.amountCredits ?? 0;
  const bonusAmount = pendingBonuses.reduce((sum, b) => sum + b.amount, 0);

  return NextResponse.json({
    pendingCredits: pending,
    availableCredits: available,
    lifetimeCredits: lifetime,
    pendingBonusCredits: bonusAmount,
    pendingBonuses,
  });
}
