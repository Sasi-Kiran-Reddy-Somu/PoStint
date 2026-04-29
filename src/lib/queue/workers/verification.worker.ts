import { Worker, Job } from "bullmq";
import { redis } from "@/lib/redis";
import { prisma } from "@/lib/prisma";
import { emailQueue } from "@/lib/queue/queues";
import { recalcHealthScore } from "@/lib/account-health";

async function fetchCommentJson(url: string) {
  const cleanUrl = url.replace(/\/$/, "");
  const ua = process.env.REDDIT_USER_AGENT ?? "WorkerMarketplace/1.0";
  const res = await fetch(`${cleanUrl}.json`, {
    headers: { "User-Agent": ua },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

export const verificationWorker = new Worker(
  "t3-verification",
  async (job: Job) => {
    const { assignmentId } = job.data;

    const assignment = await prisma.taskAssignment.findUnique({
      where: { id: assignmentId },
      include: { worker: true, task: true },
    });
    if (!assignment || !assignment.postedUrl) return;

    // Check: only run at T+72h
    const submittedAt = assignment.submittedAt;
    if (!submittedAt) return;
    const elapsed = Date.now() - submittedAt.getTime();
    if (elapsed < 72 * 3600 * 1000) {
      // Re-schedule if too early (system delay)
      throw new Error("Too early for verification");
    }

    let rawResponse: unknown = null;
    let outcome: "success" | "failed" | "hostile" | "deferred" = "deferred";
    let existenceCheck = false;
    let removalCheck = false;
    let deletionCheck = false;
    let authorMatch = false;
    let engagementScore = 0;
    let controversiality = 0;
    let replyCount = 0;
    let failureReason = "";

    try {
      rawResponse = await fetchCommentJson(assignment.postedUrl);
      const data = rawResponse as unknown[];

      // Find the comment in Reddit JSON response
      // Reddit returns [postData, commentsData]
      let comment: Record<string, unknown> | null = null;
      for (const section of data) {
        const s = section as { data?: { children?: Array<{ kind: string; data: Record<string, unknown> }> } };
        const children = s?.data?.children ?? [];
        for (const child of children) {
          if (child.kind === "t1" || child.kind === "t3") {
            comment = child.data;
            break;
          }
        }
        if (comment) break;
      }

      if (!comment) {
        outcome = "failed";
        failureReason = "comment_not_found";
      } else {
        existenceCheck = true;
        removalCheck = !comment.removed_by_category;
        deletionCheck = comment.body !== "[deleted]" && comment.author !== "[deleted]";
        authorMatch = comment.author === assignment.worker.redditUsername;
        engagementScore = (comment.score as number) ?? 0;
        controversiality = (comment.controversiality as number) ?? 0;
        replyCount = (comment.num_comments as number) ?? 0;

        if (!removalCheck) { outcome = "failed"; failureReason = "removed_by_moderators"; }
        else if (!deletionCheck) { outcome = "failed"; failureReason = "comment_deleted"; }
        else if (!authorMatch) { outcome = "failed"; failureReason = "author_mismatch"; }
        else if (engagementScore < 0) { outcome = "hostile"; }
        else { outcome = "success"; }
      }
    } catch (err) {
      // Retry up to 3 times, then defer
      const deferCount = (job.data.deferCount ?? 0) + 1;
      if (deferCount >= 3) {
        outcome = "deferred";
      } else {
        throw err; // BullMQ will retry
      }
    }

    await prisma.$transaction(async (tx) => {
      // Save verification record
      await tx.taskVerification.upsert({
        where: { assignmentId },
        create: {
          assignmentId,
          outcome,
          rawApiResponse: rawResponse as object,
          existenceCheck,
          removalCheck,
          deletionCheck,
          authorMatch,
          engagementScore,
          controversiality,
          replyCount,
        },
        update: {
          outcome,
          rawApiResponse: rawResponse as object,
          existenceCheck,
          removalCheck,
          deletionCheck,
          authorMatch,
          engagementScore,
          controversiality,
          replyCount,
          verifiedAt: new Date(),
        },
      });

      // Update assignment status
      await tx.taskAssignment.update({
        where: { id: assignmentId },
        data: {
          status: outcome === "success" || outcome === "hostile" ? "verified" : "failed",
          verificationState: outcome,
          verifiedAt: new Date(),
          paidAt: outcome === "success" || outcome === "hostile" ? new Date() : undefined,
        },
      });

      if (outcome === "success" || outcome === "hostile") {
        // Release pending credits to available
        await tx.creditTransaction.updateMany({
          where: { taskAssignmentId: assignmentId, state: "pending" },
          data: { state: "available" },
        });
      } else if (outcome === "failed") {
        // Void pending credits
        await tx.creditTransaction.updateMany({
          where: { taskAssignmentId: assignmentId, state: "pending" },
          data: { state: "voided", voidedAt: new Date(), voidedBy: "system", reason: failureReason },
        });
      }
    });

    // Trigger health score recalculation
    await recalcHealthScore(assignment.workerId);

    // Send notification to worker
    const notifTitle = outcome === "success"
      ? "Task verified — credits released"
      : outcome === "hostile"
      ? "Task verified — low engagement flagged"
      : "Task verification failed";

    const notifBody = outcome === "success"
      ? `Your task in r/${assignment.task.targetSubreddit} passed verification. Credits released.`
      : outcome === "hostile"
      ? `Your task completed but received negative engagement. Credits released but noted.`
      : `Your task in r/${assignment.task.targetSubreddit} failed: ${failureReason.replace(/_/g, " ")}.`;

    await prisma.notification.create({
      data: {
        workerId: assignment.workerId,
        channel: "in_app",
        type: "verification_result",
        title: notifTitle,
        body: notifBody,
        payload: { assignmentId, outcome, failureReason },
      },
    });

    await emailQueue.add("send-verification-result", {
      workerId: assignment.workerId,
      assignmentId,
      outcome,
      failureReason,
      subreddit: assignment.task.targetSubreddit,
    });
  },
  { connection: redis, concurrency: 5 }
);
