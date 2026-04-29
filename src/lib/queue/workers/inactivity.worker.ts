import { Worker, Job } from "bullmq";
import { redis } from "@/lib/redis";
import { prisma } from "@/lib/prisma";
import { emailQueue } from "@/lib/queue/queues";

export const inactivityWorker = new Worker(
  "inactivity-check",
  async (_job: Job) => {
    const activeWorkers = await prisma.worker.findMany({
      where: { status: "active" },
      include: {
        taskAssignments: {
          where: { status: "verified" },
          orderBy: { verifiedAt: "desc" },
          take: 1,
        },
      },
    });

    for (const worker of activeWorkers) {
      const lastVerified = worker.taskAssignments[0]?.verifiedAt ?? worker.createdAt;
      const daysSince = (Date.now() - lastVerified.getTime()) / 86_400_000;

      let newStage = "none";
      if (daysSince >= 30) newStage = "stage_4";
      else if (daysSince >= 21) newStage = "stage_3";
      else if (daysSince >= 14) newStage = "stage_2";
      else if (daysSince >= 7) newStage = "stage_1";

      if (newStage === worker.inactivityStage) continue;

      await prisma.worker.update({
        where: { id: worker.id },
        data: { inactivityStage: newStage as never },
      });

      await prisma.workerLifecycleEvent.create({
        data: {
          workerId: worker.id,
          eventType: "inactivity_stage_change",
          stage: newStage,
          metadata: { daysSince },
        },
      });

      if (newStage === "stage_1") {
        await prisma.notification.create({
          data: {
            workerId: worker.id,
            channel: "in_app",
            type: "inactivity_reminder",
            title: "You haven't completed a task in a week",
            body: "New tasks are waiting for you. Check the dashboard to claim one.",
          },
        });
      }

      if (newStage === "stage_2") {
        await emailQueue.add("inactivity-reminder", { workerId: worker.id, stage: 2, daysSince });
      }

      if (newStage === "stage_3") {
        await emailQueue.add("inactivity-reminder", { workerId: worker.id, stage: 3, daysSince });
      }

      if (newStage === "stage_4") {
        const isHighQuality = worker.tier === "tier_2" && worker.accountHealthScore > 70;
        if (isHighQuality) {
          await prisma.workerLifecycleEvent.create({
            data: { workerId: worker.id, eventType: "ops_outreach_queued", stage: "stage_4" },
          });
        } else {
          await prisma.worker.update({
            where: { id: worker.id },
            data: { status: "dormant" },
          });
        }
      }
    }
  },
  { connection: redis, concurrency: 1 }
);
