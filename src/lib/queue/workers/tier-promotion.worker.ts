import { Worker, Job } from "bullmq";
import { redis } from "@/lib/redis";
import { prisma } from "@/lib/prisma";
import { emailQueue } from "@/lib/queue/queues";

export const tierPromotionWorker = new Worker(
  "tier-promotion",
  async (_job: Job) => {
    const threshold = await prisma.platformConfig.findUnique({
      where: { key: "tier_2_karma_threshold" },
    });
    const t2Threshold = threshold ? parseInt(threshold.value) : 5000;

    const tier1Workers = await prisma.worker.findMany({
      where: { tier: "tier_1", status: "active" },
      include: { karmaHistory: { orderBy: { snapshotAt: "desc" }, take: 1 } },
    });

    for (const worker of tier1Workers) {
      const latestKarma = worker.karmaHistory[0]?.totalKarma ?? 0;
      const accountAgeMs = Date.now() - worker.createdAt.getTime();
      const accountAgeDays = accountAgeMs / 86_400_000;

      if (
        latestKarma >= t2Threshold &&
        accountAgeDays >= 14 &&
        worker.accountHealthScore >= 60
      ) {
        await prisma.$transaction([
          prisma.worker.update({ where: { id: worker.id }, data: { tier: "tier_2" } }),
          prisma.workerTierChange.create({
            data: {
              workerId: worker.id,
              oldTier: "tier_1",
              newTier: "tier_2",
              triggeredBy: "auto_karma",
              karmaAt: latestKarma,
            },
          }),
          prisma.notification.create({
            data: {
              workerId: worker.id,
              channel: "in_app",
              type: "tier_promotion",
              title: "Promoted to Tier 2!",
              body: "You've been promoted to Tier 2. You now have 2 daily comments, post access, and higher pay rates.",
            },
          }),
        ]);

        await emailQueue.add("tier-promotion", { workerId: worker.id });
      }
    }
  },
  { connection: redis, concurrency: 1 }
);
