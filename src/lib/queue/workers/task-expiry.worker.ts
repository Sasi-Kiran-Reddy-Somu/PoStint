import { Worker } from "bullmq";
import { redis } from "@/lib/redis";
import { prisma } from "@/lib/prisma";
import { recalcHealthScore } from "@/lib/account-health";
import { emailQueue } from "@/lib/queue/queues";

export function startTaskExpiryWorker() {
  const worker = new Worker(
    "task-expiry",
    async () => {
      const now = new Date();

      const expired = await prisma.taskAssignment.findMany({
        where: { status: "claimed", submitDeadline: { lt: now } },
      });

      for (const assignment of expired) {
        const [task, workerRecord] = await Promise.all([
          prisma.task.findUnique({ where: { id: assignment.taskId }, select: { targetSubreddit: true } }),
          prisma.worker.findUnique({ where: { id: assignment.workerId }, select: { email: true, redditUsername: true } }),
        ]);

        await prisma.$transaction(async (tx) => {
          await tx.taskAssignment.update({
            where: { id: assignment.id },
            data: { status: "expired" },
          });

          await tx.task.update({
            where: { id: assignment.taskId },
            data: { status: "available" },
          });

          const existingEvent = await tx.taskLifecycleEvent.findFirst({
            where: { assignmentId: assignment.id },
          });
          if (!existingEvent) {
            await tx.taskLifecycleEvent.create({
              data: {
                assignmentId: assignment.id,
                taskId: assignment.taskId,
                workerId: assignment.workerId,
                claimedAt: assignment.claimedAt,
                expiredAt: now,
                disposition: "expired",
              },
            });
          }
        });

        await recalcHealthScore(assignment.workerId);

        await prisma.notification.create({
          data: {
            workerId: assignment.workerId,
            channel: "in_app",
            type: "task_expired",
            title: "Task expired",
            body: task
              ? `Your r/${task.targetSubreddit} task expired before submission. A health score penalty was applied.`
              : "A task expired before submission. A health score penalty was applied.",
          },
        });

        if (workerRecord) {
          await emailQueue.add("task-expired", {
            to: workerRecord.email,
            subject: "Task expired",
            template: "task-expired",
            data: {
              username: workerRecord.redditUsername,
              subreddit: task?.targetSubreddit ?? "",
            },
          });
        }
      }

      return { processed: expired.length };
    },
    { connection: redis }
  );

  worker.on("failed", (job, err) => {
    console.error(`[task-expiry] job ${job?.id} failed:`, err.message);
  });

  return worker;
}
