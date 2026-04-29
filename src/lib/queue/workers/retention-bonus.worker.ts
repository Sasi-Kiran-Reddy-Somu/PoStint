import { Worker, Job } from "bullmq";
import { redis } from "@/lib/redis";
import { prisma } from "@/lib/prisma";

export const retentionBonusWorker = new Worker(
  "retention-bonus",
  async (_job: Job) => {
    const milestoneConfig = await prisma.platformConfig.findUnique({
      where: { key: "retention_milestone_months" },
    });
    const milestoneMonths = milestoneConfig ? parseInt(milestoneConfig.value) : 2;
    const milestoneDays = milestoneMonths * 30;

    const bonusConfig = await prisma.platformConfig.findUnique({ where: { key: "retention_bonus_credits" } });
    const bonusAmount = bonusConfig ? parseInt(bonusConfig.value) : 500;

    const cutoffDate = new Date(Date.now() - milestoneDays * 86_400_000);

    const eligibleWorkers = await prisma.worker.findMany({
      where: {
        status: "active",
        createdAt: { lte: cutoffDate },
        bonuses: { none: { bonusType: "retention_milestone" } },
      },
      include: {
        taskAssignments: {
          where: { status: "verified", verifiedAt: { gte: cutoffDate } },
        },
      },
    });

    for (const worker of eligibleWorkers) {
      // Must have at least 5 verified tasks in period
      if (worker.taskAssignments.length < 5) continue;
      if (worker.accountHealthScore < 50) continue;

      await prisma.$transaction([
        prisma.workerBonus.create({
          data: {
            workerId: worker.id,
            bonusType: "retention_milestone",
            amount: bonusAmount,
            milestone: `${milestoneMonths}_month`,
            appliedAt: new Date(),
          },
        }),
        prisma.creditTransaction.create({
          data: {
            workerId: worker.id,
            amountCredits: bonusAmount,
            direction: "earn",
            state: "available",
            reason: "retention_bonus",
          },
        }),
        prisma.notification.create({
          data: {
            workerId: worker.id,
            channel: "in_app",
            type: "retention_bonus",
            title: "Retention bonus earned!",
            body: `${bonusAmount} credits added to your balance. Thanks for sticking with us.`,
          },
        }),
      ]);
    }
  },
  { connection: redis, concurrency: 1 }
);
