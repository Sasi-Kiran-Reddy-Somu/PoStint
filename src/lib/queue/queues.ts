// Only create queues when REDIS_URL is available.
// Without it (e.g. during Next.js build) all add() calls are silent no-ops.

type SafeQueue = {
  add: (jobName: string, data: object, opts?: object) => Promise<void>;
};

const noop: SafeQueue = { async add() {} };

function makeQueue(name: string): SafeQueue {
  if (!process.env.REDIS_URL) return noop;
  // Defer the actual Queue creation until first use to avoid top-level Redis connections.
  let q: import("bullmq").Queue | null = null;
  return {
    async add(jobName, data, opts) {
      try {
        if (!q) {
          const { Queue } = await import("bullmq");
          const { redis } = await import("@/lib/redis");
          q = new Queue(name, { connection: redis });
        }
        await q.add(jobName, data, opts ?? {});
      } catch { /* ignore */ }
    },
  };
}

export const vettingFilterQueue  = makeQueue("vetting-filter");
export const llmScoringQueue     = makeQueue("llm-scoring");
export const verificationQueue   = makeQueue("t3-verification");
export const emailQueue          = makeQueue("email");
export const karmaSyncQueue      = makeQueue("karma-sync");
export const shadowbanQueue      = makeQueue("shadowban-check");
export const inactivityQueue     = makeQueue("inactivity-check");
export const retentionBonusQueue = makeQueue("retention-bonus");
export const tierPromotionQueue  = makeQueue("tier-promotion");
export const ipOverlapQueue      = makeQueue("ip-overlap");
export const taxDocQueue         = makeQueue("tax-documents");
export const revetQueue          = makeQueue("revet");
export const taskExpiryQueue     = makeQueue("task-expiry");
