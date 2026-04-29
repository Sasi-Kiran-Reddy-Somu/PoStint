import { Worker, Job } from "bullmq";
import { redis } from "@/lib/redis";
import { prisma } from "@/lib/prisma";
import { logHealthEvent } from "@/lib/account-health";

export const shadowbanWorker = new Worker(
  "shadowban-check",
  async (job: Job) => {
    const { workerId } = job.data;
    const worker = await prisma.worker.findUnique({ where: { id: workerId } });
    if (!worker || worker.status !== "active") return;

    const ua = process.env.REDDIT_USER_AGENT ?? "WorkerMarketplace/1.0";
    const res = await fetch(`https://www.reddit.com/user/${worker.redditUsername}/about.json`, {
      headers: { "User-Agent": ua },
    });

    if (res.status === 404 || res.status === 403) {
      // Suspected shadowban — do follow-up check
      await logHealthEvent(workerId, "shadowban_detected", { status: res.status });
    }
  },
  { connection: redis, concurrency: 5 }
);
