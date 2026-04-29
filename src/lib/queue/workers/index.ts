// Main worker process — run with: tsx src/lib/queue/workers/index.ts
import { vettingFilterWorker } from "./vetting-filter.worker";
import { llmScoringWorker } from "./llm-scoring.worker";
import { verificationWorker } from "./verification.worker";
import { emailWorker } from "./email.worker";
import { karmaSyncWorker } from "./karma-sync.worker";
import { shadowbanWorker } from "./shadowban.worker";
import { inactivityWorker } from "./inactivity.worker";
import { tierPromotionWorker } from "./tier-promotion.worker";
import { ipOverlapWorker } from "./ip-overlap.worker";
import { retentionBonusWorker } from "./retention-bonus.worker";
import { revetWorker } from "./revet.worker";
import { startTaskExpiryWorker } from "./task-expiry.worker";
import { startTaxDocumentsWorker } from "./tax-documents.worker";
import { scheduleRecurringJobs } from "@/lib/queue/scheduler";

const workers = [
  vettingFilterWorker,
  llmScoringWorker,
  verificationWorker,
  emailWorker,
  karmaSyncWorker,
  shadowbanWorker,
  inactivityWorker,
  tierPromotionWorker,
  ipOverlapWorker,
  retentionBonusWorker,
  revetWorker,
  startTaskExpiryWorker(),
  startTaxDocumentsWorker(),
];

scheduleRecurringJobs().catch(console.error);

console.log(`[jobs] Started ${workers.length} workers`);

process.on("SIGTERM", async () => {
  await Promise.all(workers.map((w) => w.close()));
  process.exit(0);
});
