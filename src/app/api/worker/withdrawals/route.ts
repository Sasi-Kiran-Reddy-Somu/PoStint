import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session || session.user.role !== "worker") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const withdrawals = await prisma.withdrawal.findMany({
    where: { workerId: session.user.id },
    orderBy: { initiatedAt: "desc" },
    take: 50,
  });

  return NextResponse.json({ withdrawals });
}
