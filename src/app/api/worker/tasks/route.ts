import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const WORKER_ID = "cmokektv0002srgywx6xnim0j";

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export async function GET(req: NextRequest) {
  const workerId = WORKER_ID;
  const worker = await prisma.worker.findUnique({ where: { id: workerId } });
  if (!worker || worker.status !== "active") {
    return NextResponse.json({ tasks: [], capReached: false });
  }

  const cooldowns = await prisma.workerCooldown.findMany({
    where: { workerId, expiresAt: { gt: new Date() } },
  });
  const cooledBrands = new Set(cooldowns.map((c) => c.brandId));

  const isDeprioritized = worker.inactivityStage === "stage_3";
  const url = new URL(req.url);
  const sort = url.searchParams.get("sort") ?? "random";
  const typeFilter = url.searchParams.get("type") ?? "all";

  const whereType = typeFilter !== "all" ? { type: typeFilter as "comment" | "upvote" | "post" } : {};

  const tasks = await prisma.task.findMany({
    where: {
      status: "available",
      minTier: worker.tier === "tier_2" ? { in: ["tier_1", "tier_2"] } : "tier_1",
      expiresAt: { gt: new Date() },
      ...whereType,
    },
    orderBy: sort === "credits" ? { creditValue: "desc" } : sort === "expiring" ? { expiresAt: "asc" } : { createdAt: "desc" },
    take: 200,
  });

  const eligible = tasks.filter((t) => !t.brandId || !cooledBrands.has(t.brandId));
  const sorted = sort === "credits" ? eligible : shuffle(eligible);

  return NextResponse.json({
    tasks: sorted,
    capReached: false,
    deprioritized: isDeprioritized,
    tier: worker.tier,
  });
}
