import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET(_req: Request, { params }: { params: { applicationId: string } }) {
  const session = await auth();
  if (!session || session.user.role !== "ops") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const app = await prisma.application.findUnique({ where: { id: params.applicationId } });
  if (!app) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(app);
}
