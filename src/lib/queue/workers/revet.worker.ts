import { Worker } from "bullmq";
import { redis } from "@/lib/redis";
import { prisma } from "@/lib/prisma";

const BATCH_SIZE = 50;
const BATCH_DELAY_MS = 6000;

export const revetWorker = new Worker(
  "revet",
  async () => {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 86_400_000);

    const workers = await prisma.worker.findMany({
      where: {
        status: "active",
        OR: [{ lastVettedAt: null }, { lastVettedAt: { lte: thirtyDaysAgo } }],
      },
      take: BATCH_SIZE,
    });

    const ua = process.env.REDDIT_USER_AGENT ?? "WorkerMarketplace/1.0";

    for (const worker of workers) {
      await new Promise((r) => setTimeout(r, BATCH_DELAY_MS / BATCH_SIZE));

      try {
        const res = await fetch(`https://www.reddit.com/user/${worker.redditUsername}/about.json`, {
          headers: { "User-Agent": ua },
        });

        let outcome: "pass" | "flag" | "auto_pause" = "pass";
        const checkValues: Record<string, unknown> = {};

        if (res.status === 404 || res.status === 403) {
          outcome = "auto_pause";
          checkValues.accountStatus = { value: res.status, passed: false };
        } else if (res.ok) {
          const data = await res.json();
          const profile = data?.data;
          const isSuspended = profile?.is_suspended === true;
          checkValues.notSuspended = { value: !isSuspended, passed: !isSuspended };
          if (isSuspended) outcome = "auto_pause";
        }

        await prisma.workerRevetLog.create({
          data: { workerId: worker.id, checkValues: checkValues as object, outcome },
        });

        if (outcome === "auto_pause") {
          await prisma.worker.update({ where: { id: worker.id }, data: { status: "paused" } });
        }

        await prisma.worker.update({ where: { id: worker.id }, data: { lastVettedAt: new Date() } });
      } catch {
        // Skip failed individual re-vets
      }
    }
  },
  { connection: redis, concurrency: 1 }
);
