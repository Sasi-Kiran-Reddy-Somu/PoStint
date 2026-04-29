import { prisma } from "@/lib/prisma";

const DEFAULT_WEIGHTS = {
  removal_rate: -3.0,
  downvote_ratio: -1.5,
  shadowban: -40,
  karma_drop_10pct: -5,
  cap_underuse: -0.5,
  task_expired: -2,
  task_verified: 1,
};

export async function recalcHealthScore(workerId: string): Promise<number> {
  const worker = await prisma.worker.findUnique({
    where: { id: workerId },
    include: {
      taskAssignments: {
        where: { createdAt: { gte: new Date(Date.now() - 30 * 86400_000) } },
      },
      healthEvents: {
        where: { recordedAt: { gte: new Date(Date.now() - 30 * 86400_000) } },
      },
      karmaHistory: { orderBy: { snapshotAt: "desc" }, take: 2 },
    },
  });
  if (!worker) return 80;

  let score = worker.accountHealthScore;

  // Removal rate
  const assignments = worker.taskAssignments;
  if (assignments.length > 0) {
    const failed = assignments.filter((a) => a.status === "failed").length;
    const total = assignments.filter((a) => ["verified", "failed"].includes(a.status)).length;
    if (total > 0) {
      const removalRate = failed / total;
      score += Math.round(removalRate * DEFAULT_WEIGHTS.removal_rate * 10);
    }
  }

  // Karma trajectory
  if (worker.karmaHistory.length >= 2) {
    const latest = worker.karmaHistory[0].totalKarma;
    const prev = worker.karmaHistory[1].totalKarma;
    if (prev > 0 && latest < prev * 0.9) {
      score += DEFAULT_WEIGHTS.karma_drop_10pct;
    }
  }

  // Event-based adjustments
  for (const event of worker.healthEvents) {
    if (event.eventType === "shadowban_detected") score += DEFAULT_WEIGHTS.shadowban;
    if (event.eventType === "task_expired") score += DEFAULT_WEIGHTS.task_expired;
    if (event.eventType === "task_verified") score += DEFAULT_WEIGHTS.task_verified;
  }

  // Clamp to 0-100
  score = Math.max(0, Math.min(100, score));

  const oldScore = worker.accountHealthScore;

  await prisma.$transaction([
    prisma.worker.update({
      where: { id: workerId },
      data: { accountHealthScore: score },
    }),
    prisma.workerHealthScoreHistory.create({
      data: {
        workerId,
        oldScore,
        newScore: score,
        triggerEvent: "recalc",
      },
    }),
  ]);

  // Check thresholds
  const pauseThreshold = 50;
  const suspendThreshold = 30;

  if (oldScore >= suspendThreshold && score < suspendThreshold) {
    await autoSuspendWorker(workerId, score);
  } else if (oldScore >= pauseThreshold && score < pauseThreshold) {
    await autoPauseWorker(workerId, score);
  }

  return score;
}

export async function autoPauseWorker(workerId: string, score: number) {
  await prisma.$transaction([
    prisma.worker.update({
      where: { id: workerId },
      data: { status: "paused" },
    }),
    prisma.accountHealthAction.create({
      data: {
        workerId,
        action: "pause",
        triggeringScore: score,
        threshold: 50,
        reason: "auto_pause_health_score",
        actionedBy: "system",
      },
    }),
    prisma.notification.create({
      data: {
        workerId,
        channel: "in_app",
        type: "account_paused",
        title: "Account temporarily paused",
        body: "Your account health dropped below the threshold. Your account is paused for 7 days while you recover. Existing pending credits will still process normally.",
      },
    }),
  ]);
}

export async function autoSuspendWorker(workerId: string, score: number) {
  // Void all pending credits
  await prisma.creditTransaction.updateMany({
    where: { workerId, state: "pending" },
    data: { state: "voided", voidedAt: new Date(), voidedBy: "system", reason: "worker_suspended" },
  });

  await prisma.$transaction([
    prisma.worker.update({
      where: { id: workerId },
      data: { status: "suspended" },
    }),
    prisma.accountHealthAction.create({
      data: {
        workerId,
        action: "suspend",
        triggeringScore: score,
        threshold: 30,
        reason: "auto_suspend_health_score",
        actionedBy: "system",
      },
    }),
    prisma.notification.create({
      data: {
        workerId,
        channel: "in_app",
        type: "account_suspended",
        title: "Account suspended",
        body: "Your account has been suspended due to health score deterioration. You can still withdraw available credits. Contact support for appeal.",
      },
    }),
  ]);
}

export async function logHealthEvent(workerId: string, eventType: string, signalValue: unknown, scoreDelta = 0) {
  await prisma.accountHealthEvent.create({
    data: { workerId, eventType, signalValue: signalValue as object, scoreDelta },
  });
}
