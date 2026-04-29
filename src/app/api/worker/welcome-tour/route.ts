import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function POST() {
  const session = await auth();
  if (!session || session.user.role !== "worker") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  await prisma.worker.update({
    where: { id: session.user.id },
    data: { hasSeenWelcomeTour: true },
  });
  return NextResponse.json({ success: true });
}
