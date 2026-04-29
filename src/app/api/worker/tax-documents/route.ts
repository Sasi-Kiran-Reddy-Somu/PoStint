import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session || session.user.role !== "worker") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const documents = await prisma.taxDocument.findMany({
    where: { workerId: session.user.id },
    orderBy: { year: "desc" },
  });

  return NextResponse.json({ documents });
}
