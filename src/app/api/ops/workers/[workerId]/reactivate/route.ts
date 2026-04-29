import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest, { params }: { params: Promise<{ workerId: string }> }) {
  const session = await auth();
  if (!session || session.user.role !== "ops") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { workerId } = await params;
  const body = await req.json() as { reason: string };

  await prisma.$transaction([
    prisma.worker.update({ where: { id: workerId }, data: { status: "active" } }),
    prisma.opsAction.create({
      data: { workerId, reviewerId: session.user.id, actionType: "reactivate", reason: body.reason },
    }),
    prisma.notification.create({
      data: {
        workerId, channel: "in_app", type: "account_reactivated",
        title: "Account reactivated", body: "Your account is reactivated. Welcome back.",
      },
    }),
  ]);

  return NextResponse.json({ success: true });
}
