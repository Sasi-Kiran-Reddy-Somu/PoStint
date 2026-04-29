import {
  karmaSyncQueue,
  inactivityQueue,
  ipOverlapQueue,
  tierPromotionQueue,
  retentionBonusQueue,
  revetQueue,
  taxDocQueue,
  taskExpiryQueue,
  shadowbanQueue,
} from "@/lib/queue/queues";

// Idempotent — safe to call on every server start.
// BullMQ deduplicates repeatable jobs by their key.
export async function scheduleRecurringJobs() {
  // Every 30 seconds: scan for expired claimed tasks
  await taskExpiryQueue.add(
    "scan",
    {},
    {
      repeat: { every: 30_000 },
      jobId: "task-expiry-scan",
      removeOnComplete: 100,
      removeOnFail: 50,
    }
  );

  // Daily 02:00 UTC: karma sync + shadowban check
  await karmaSyncQueue.add(
    "daily",
    {},
    {
      repeat: { pattern: "0 2 * * *" },
      jobId: "karma-sync-daily",
      removeOnComplete: 7,
      removeOnFail: 7,
    }
  );

  await shadowbanQueue.add(
    "daily",
    {},
    {
      repeat: { pattern: "0 2 * * *" },
      jobId: "shadowban-daily",
      removeOnComplete: 7,
      removeOnFail: 7,
    }
  );

  // Daily 03:00 UTC: inactivity detection
  await inactivityQueue.add(
    "daily",
    {},
    {
      repeat: { pattern: "0 3 * * *" },
      jobId: "inactivity-daily",
      removeOnComplete: 7,
      removeOnFail: 7,
    }
  );

  // Daily 04:00 UTC: IP overlap analysis
  await ipOverlapQueue.add(
    "daily",
    {},
    {
      repeat: { pattern: "0 4 * * *" },
      jobId: "ip-overlap-daily",
      removeOnComplete: 7,
      removeOnFail: 7,
    }
  );

  // Daily 05:00 UTC: tier promotion evaluation
  await tierPromotionQueue.add(
    "daily",
    {},
    {
      repeat: { pattern: "0 5 * * *" },
      jobId: "tier-promotion-daily",
      removeOnComplete: 7,
      removeOnFail: 7,
    }
  );

  // Daily 06:00 UTC: retention bonus check (2-month milestones)
  await retentionBonusQueue.add(
    "daily",
    {},
    {
      repeat: { pattern: "0 6 * * *" },
      jobId: "retention-bonus-daily",
      removeOnComplete: 7,
      removeOnFail: 7,
    }
  );

  // Weekly Sunday 01:00 UTC: re-vet active workers
  await revetQueue.add(
    "weekly",
    {},
    {
      repeat: { pattern: "0 1 * * 0" },
      jobId: "revet-weekly",
      removeOnComplete: 4,
      removeOnFail: 4,
    }
  );

  // Annual Jan 31 00:00 UTC: generate tax documents
  await taxDocQueue.add(
    "annual",
    { taxYear: new Date().getFullYear() - 1 },
    {
      repeat: { pattern: "0 0 31 1 *" },
      jobId: "tax-documents-annual",
      removeOnComplete: 2,
      removeOnFail: 2,
    }
  );

  console.log("[scheduler] Recurring jobs registered.");
}
