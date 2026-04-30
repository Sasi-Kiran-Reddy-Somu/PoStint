import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const WORKER_ID = "cmokektv0002srgywx6xnim0j";

export async function GET() {
  const assignments = await prisma.taskAssignment.findMany({
    where: { workerId: WORKER_ID },
    include: { task: { select: { targetSubreddit: true, creditValue: true } } },
    orderBy: { claimedAt: "desc" },
    take: 100,
  });

  return NextResponse.json({ assignments });
}
