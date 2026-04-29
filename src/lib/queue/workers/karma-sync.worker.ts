import { Worker, Job } from "bullmq";
import { redis } from "@/lib/redis";
import { prisma } from "@/lib/prisma";

export const karmaSyncWorker = new Worker(
  "karma-sync",
  async (job: Job) => {
    const { workerId } = job.data;
    const worker = await prisma.worker.findUnique({ where: { id: workerId } });
    if (!worker || worker.status === "suspended" || worker.status === "closed") return;

    const ua = process.env.REDDIT_USER_AGENT ?? "WorkerMarketplace/1.0";
    const res = await fetch(`https://www.reddit.com/user/${worker.redditUsername}/about.json`, {
      headers: { "User-Agent": ua },
    });
    if (!res.ok) return;

    const data = await res.json();
    const profile = data?.data;
    if (!profile) return;

    const totalKarma = (profile.link_karma ?? 0) + (profile.comment_karma ?? 0);

    await prisma.$transaction([
      prisma.workerKarmaHistory.create({
        data: {
          workerId,
          totalKarma,
          commentKarma: profile.comment_karma ?? 0,
          linkKarma: profile.link_karma ?? 0,
        },
      }),
      prisma.worker.update({
        where: { id: workerId },
        data: { karmaSnapshot: { total: totalKarma, comment: profile.comment_karma, link: profile.link_karma } },
      }),
    ]);
  },
  { connection: redis, concurrency: 5 }
);
