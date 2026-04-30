import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const WORKER_ID = "cmokektv0002srgywx6xnim0j";

export async function POST() {
  await prisma.worker.update({
    where: { id: WORKER_ID },
    data: { hasSeenWelcomeTour: true },
  });
  return NextResponse.json({ success: true });
}
