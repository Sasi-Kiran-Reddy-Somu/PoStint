import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session || session.user.role !== "worker") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const assignments = await prisma.taskAssignment.findMany({
    where: { workerId: session.user.id },
    include: { task: { select: { targetSubreddit: true, creditValue: true } } },
    orderBy: { claimedAt: "desc" },
    take: 100,
  });

  return NextResponse.json({ assignments });
}
