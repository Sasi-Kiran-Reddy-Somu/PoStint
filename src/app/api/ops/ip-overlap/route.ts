import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session || session.user.role !== "ops") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get("page") ?? "1");

  const flags = await prisma.ipOverlapFlag.findMany({
    where: { resolution: null },
    orderBy: [{ severity: "desc" }, { createdAt: "desc" }],
    skip: (page - 1) * 25,
    take: 25,
  });

  return NextResponse.json({ flags });
}

export async function PATCH(req: NextRequest) {
  const session = await auth();
  if (!session || session.user.role !== "ops") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json() as {
    flagId: string;
    resolution: "false_positive" | "confirmed_multi_account" | "trusted_shared";
    reason?: string;
    workerIds?: string[];
  };

  await prisma.ipOverlapFlag.update({
    where: { id: body.flagId },
    data: {
      resolution: body.resolution,
      resolvedBy: session.user.id,
      resolveReason: body.reason,
      resolvedAt: new Date(),
    },
  });

  // If confirmed multi-account, trigger penalty workflow
  if (body.resolution === "confirmed_multi_account" && body.workerIds?.length) {
    for (const workerId of body.workerIds) {
      // Void pending credits
      await prisma.creditTransaction.updateMany({
        where: { workerId, state: "pending" },
        data: { state: "voided", voidedAt: new Date(), voidedBy: "ops", reason: "multi_accounting_confirmed" },
      });

      await prisma.worker.update({
        where: { id: workerId },
        data: { status: "suspended", permanentBan: true },
      });

      await prisma.opsAction.create({
        data: {
          workerId,
          reviewerId: session.user.id,
          actionType: "confirm_multi_account",
          reason: "confirmed_multi_accounting",
          metadata: { flagId: body.flagId },
        },
      });

      await prisma.notification.create({
        data: {
          workerId,
          channel: "in_app",
          type: "account_suspended",
          title: "Account suspended due to terms of service violation",
          body: "Your account has been suspended for policy violations. You can still withdraw your available credits. This decision is final.",
        },
      });

      // Add IPs to banned list
      const ipEvents = await prisma.workerIpEvent.findMany({
        where: { workerId, createdAt: { gte: new Date(Date.now() - 90 * 86_400_000) } },
        select: { ipAddress: true },
      });
      const uniqueIps = [...new Set(ipEvents.map((e) => e.ipAddress))];
      for (const ip of uniqueIps) {
        await prisma.bannedIp.upsert({
          where: { ipAddress: ip },
          create: { ipAddress: ip, reason: "multi_accounting", addedBy: session.user.id },
          update: {},
        });
      }
    }
  }

  return NextResponse.json({ success: true });
}
