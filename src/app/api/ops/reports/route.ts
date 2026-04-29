import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session || session.user.role !== "ops") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const days = parseInt(searchParams.get("days") ?? "30");
  const since = new Date(Date.now() - days * 86_400_000);

  const [
    activeWorkers,
    taskThroughput,
    verificationStats,
    avgFirstEarning,
    pendingWithdrawals,
    healthDistribution,
  ] = await Promise.all([
    prisma.worker.count({ where: { status: "active" } }),

    prisma.taskAssignment.count({
      where: { status: { in: ["verified", "failed"] }, createdAt: { gte: since } },
    }),

    prisma.taskAssignment.groupBy({
      by: ["verificationState"],
      where: { verifiedAt: { gte: since } },
      _count: true,
    }),

    prisma.$queryRaw<[{ avg_days: number }]>`
      SELECT AVG(EXTRACT(epoch FROM (ta.verified_at - w.created_at)) / 86400) as avg_days
      FROM task_assignments ta
      JOIN workers w ON ta.worker_id = w.id
      WHERE ta.status = 'verified'
      AND ta.verified_at = (
        SELECT MIN(ta2.verified_at) FROM task_assignments ta2
        WHERE ta2.worker_id = ta.worker_id AND ta2.status = 'verified'
      )
      AND w.created_at >= ${since}
    `,

    prisma.withdrawal.aggregate({
      where: { status: "processing" },
      _sum: { amountDollars: true, amountCredits: true },
      _count: true,
    }),

    prisma.worker.groupBy({
      by: ["status"],
      _count: true,
    }),
  ]);

  const successCount = verificationStats.find((s) => s.verificationState === "success")?._count ?? 0;
  const totalVerified = verificationStats.reduce((sum, s) => sum + s._count, 0);
  const survivalRate = totalVerified > 0 ? (successCount / totalVerified) * 100 : 0;

  return NextResponse.json({
    activeWorkers,
    taskThroughput,
    t3SurvivalRate: survivalRate.toFixed(1),
    avgFirstEarningDays: (avgFirstEarning[0]?.avg_days ?? 0).toFixed(1),
    pendingWithdrawals: {
      count: pendingWithdrawals._count,
      totalDollars: pendingWithdrawals._sum.amountDollars ?? 0,
    },
    workerStatusDistribution: healthDistribution,
    verificationBreakdown: verificationStats,
  });
}
