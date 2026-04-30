import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const WORKER_ID = "cmokektv0002srgywx6xnim0j";

export async function GET() {
  const documents = await prisma.taxDocument.findMany({
    where: { workerId: WORKER_ID },
    orderBy: { year: "desc" },
  });

  return NextResponse.json({ documents });
}
