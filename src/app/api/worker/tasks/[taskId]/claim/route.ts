import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { logIpEvent, getClientIp } from "@/lib/ip-logger";
import { SUBMIT_WINDOW_SECONDS } from "@/lib/utils";

const WORKER_ID = "cmokektv0002srgywx6xnim0j";

export async function POST(req: NextRequest, { params }: { params: Promise<{ taskId: string }> }) {
  const workerId = WORKER_ID;
  const { taskId } = await params;
  const ip = getClientIp(req);

  const worker = await prisma.worker.findUnique({ where: { id: workerId } });
  if (!worker) return NextResponse.json({ error: "Worker not found" }, { status: 404 });

  if (worker.status !== "active") {
    return NextResponse.json({ error: "Your account is not active." }, { status: 403 });
  }

  try {
    const result = await prisma.$transaction(async (tx) => {
      const task = await tx.task.findUnique({ where: { id: taskId }, select: { id: true, status: true, brandId: true, minTier: true, creditValue: true, targetSubreddit: true, brief: true } });
      if (!task || task.status !== "available") throw new Error("TASK_UNAVAILABLE");

      if (task.minTier === "tier_2" && worker.tier !== "tier_2") throw new Error("TIER_INSUFFICIENT");

      if (task.brandId) {
        const cooldown = await tx.workerCooldown.findUnique({ where: { workerId_brandId: { workerId, brandId: task.brandId } } });
        if (cooldown && cooldown.expiresAt > new Date()) throw new Error("BRAND_COOLDOWN");
      }

      await tx.task.update({ where: { id: taskId }, data: { status: "claimed" } });

      const submitDeadline = new Date(Date.now() + SUBMIT_WINDOW_SECONDS * 1000);
      const assignment = await tx.taskAssignment.create({
        data: { taskId, workerId, status: "claimed", claimedAt: new Date(), submitDeadline },
      });

      return { assignment, task };
    });

    logIpEvent(workerId, ip, "claim", req.headers.get("user-agent") ?? undefined);

    return NextResponse.json({
      assignmentId: result.assignment.id,
      submitDeadline: result.assignment.submitDeadline,
      task: result.task,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "";
    if (msg === "TASK_UNAVAILABLE") return NextResponse.json({ error: "This task is no longer available." }, { status: 409 });
    if (msg === "TIER_INSUFFICIENT") return NextResponse.json({ error: "Your tier does not meet this task's requirement." }, { status: 403 });
    if (msg === "BRAND_COOLDOWN") return NextResponse.json({ error: "You are in a cooldown period for this brand." }, { status: 403 });
    return NextResponse.json({ error: "Claim failed." }, { status: 500 });
  }
}
