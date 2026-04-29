import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET(_req: Request, { params }: { params: Promise<{ workerId: string }> }) {
  const session = await auth();
  if (!session || session.user.role !== "ops") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { workerId } = await params;
  const w = await prisma.worker.findUnique({
    where: { id: workerId },
    include: {
      taskAssignments: {
        include: { task: { select: { targetSubreddit: true, creditValue: true } } },
        orderBy: { claimedAt: "desc" },
        take: 10,
      },
      ipEvents: { orderBy: { createdAt: "desc" }, take: 10 },
    },
  });

  if (!w) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const [pending, available, lifetime] = await Promise.all([
    prisma.creditTransaction.aggregate({ where: { workerId: w.id, state: "pending" }, _sum: { amountCredits: true } }),
    prisma.creditTransaction.aggregate({ where: { workerId: w.id, state: "available" }, _sum: { amountCredits: true } }),
    prisma.creditTransaction.aggregate({ where: { workerId: w.id, direction: "earn" }, _sum: { amountCredits: true } }),
  ]);

  return NextResponse.json({
    id: w.id,
    redditUsername: w.redditUsername,
    email: w.email,
    tier: w.tier,
    status: w.status,
    accountHealthScore: w.accountHealthScore,
    createdAt: w.createdAt,
    country: w.country,
    payoutsEnabled: w.payoutsEnabled,
    pending: pending._sum.amountCredits ?? 0,
    available: available._sum.amountCredits ?? 0,
    totalEarned: lifetime._sum.amountCredits ?? 0,
    recentAssignments: w.taskAssignments,
    recentIpEvents: w.ipEvents,
  });
}
