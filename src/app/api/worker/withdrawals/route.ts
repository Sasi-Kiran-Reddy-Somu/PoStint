import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const WORKER_ID = "cmokektv0002srgywx6xnim0j";

export async function GET() {
  const withdrawals = await prisma.withdrawal.findMany({
    where: { workerId: WORKER_ID },
    orderBy: { initiatedAt: "desc" },
    take: 50,
  });

  return NextResponse.json({ withdrawals });
}
