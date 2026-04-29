import { Queue } from "bullmq";
import { redis } from "@/lib/redis";

const connection = { connection: redis };

export const vettingFilterQueue = new Queue("vetting-filter", connection);
export const llmScoringQueue = new Queue("llm-scoring", connection);
export const verificationQueue = new Queue("t3-verification", connection);
export const emailQueue = new Queue("email", connection);
export const karmaSyncQueue = new Queue("karma-sync", connection);
export const shadowbanQueue = new Queue("shadowban-check", connection);
export const inactivityQueue = new Queue("inactivity-check", connection);
export const retentionBonusQueue = new Queue("retention-bonus", connection);
export const tierPromotionQueue = new Queue("tier-promotion", connection);
export const ipOverlapQueue = new Queue("ip-overlap", connection);
export const taxDocQueue = new Queue("tax-documents", connection);
export const revetQueue = new Queue("revet", connection);
export const taskExpiryQueue = new Queue("task-expiry", connection);
