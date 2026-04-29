import { Worker } from "bullmq";
import { redis } from "@/lib/redis";
import { prisma } from "@/lib/prisma";

const DATACENTER_RANGES = ["10.", "172.16.", "192.168.", "127."];

function isDatacenter(ip: string): boolean {
  return DATACENTER_RANGES.some((range) => ip.startsWith(range));
}

function severity(workerCount: number, hasWithdrawal: boolean): "low" | "medium" | "high" | "critical" {
  if (hasWithdrawal && workerCount >= 3) return "critical";
  if (hasWithdrawal) return "high";
  if (workerCount >= 3) return "medium";
  return "low";
}

export const ipOverlapWorker = new Worker(
  "ip-overlap",
  async () => {
    const cutoff = new Date(Date.now() - 24 * 3600_000);

    const events = await prisma.workerIpEvent.findMany({
      where: { createdAt: { gte: cutoff } },
    });

    // Group by IP
    const ipMap = new Map<string, { workerIds: Set<string>; events: typeof events }>();
    for (const event of events) {
      if (isDatacenter(event.ipAddress)) continue;
      if (!ipMap.has(event.ipAddress)) {
        ipMap.set(event.ipAddress, { workerIds: new Set(), events: [] });
      }
      const entry = ipMap.get(event.ipAddress)!;
      entry.workerIds.add(event.workerId);
      entry.events.push(event);
    }

    for (const [ip, { workerIds, events: ipEvents }] of ipMap) {
      if (workerIds.size < 2) continue;

      const workerIdArray = [...workerIds];
      const eventCounts: Record<string, number> = {};
      for (const wid of workerIdArray) {
        eventCounts[wid] = ipEvents.filter((e: typeof events[0]) => e.workerId === wid).length;
      }

      const hasWithdrawal = ipEvents.some((e: typeof events[0]) => e.eventType === "withdrawal");
      const sev = severity(workerIdArray.length, hasWithdrawal);

      await prisma.ipOverlapFlag.create({
        data: {
          ipAddress: ip,
          workerIds: workerIdArray,
          eventCounts,
          severity: sev,
        },
      });
    }
  },
  { connection: redis, concurrency: 1 }
);
