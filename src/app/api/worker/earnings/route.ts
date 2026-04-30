import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const WORKER_ID = "cmokektv0002srgywx6xnim0j";

export async function GET() {
  const workerId = WORKER_ID;

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
