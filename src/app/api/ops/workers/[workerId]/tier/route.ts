import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ workerId: string }> }) {
  const session = await auth();
  if (!session || session.user.role !== "ops") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { workerId } = await params;
  const body = await req.json() as { tier: "tier_1" | "tier_2"; reason: string };

  const worker = await prisma.worker.findUnique({ where: { id: workerId } });
  if (!worker) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await prisma.$transaction([
    prisma.worker.update({ where: { id: workerId }, data: { tier: body.tier } }),
    prisma.workerTierChange.create({
      data: {
        workerId, oldTier: worker.tier, newTier: body.tier,
        triggeredBy: "manual_ops",
      },
    }),
    prisma.opsAction.create({
      data: {
        workerId, reviewerId: session.user.id,
        actionType: body.tier === "tier_2" ? "promote_tier" : "demote_tier",
        reason: body.reason,
      },
    }),
  ]);

  return NextResponse.json({ success: true });
}
