import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

const SELECT_FIELDS = {
  displayName: true, email: true, redditUsername: true, country: true,
  theme: true, compactMode: true,
  notifTaskInApp: true, notifVerifyInApp: true, notifCreditsInApp: true,
  notifHealthInApp: true, notifTierInApp: true, notifWithdrawInApp: true, notifBonusInApp: true,
  notifWeeklyEmail: true, notifMonthlyEmail: true, notifHighValueEmail: true,
  notifTierEmail: true, notifHealthEmail: true, notifWithdrawEmail: true, notifTaxEmail: true,
  twoFactorEnabled: true, loginAlertsEnabled: true,
} as const;

export async function GET() {
  const session = await auth();
  if (!session || session.user.role !== "worker") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const worker = await prisma.worker.findUnique({
    where: { id: session.user.id },
    select: SELECT_FIELDS,
  });
  return NextResponse.json(worker);
}

export async function PATCH(req: NextRequest) {
  const session = await auth();
  if (!session || session.user.role !== "worker") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();

  // Sanitize: only allow specific fields
  const allowed = Object.keys(SELECT_FIELDS) as (keyof typeof SELECT_FIELDS)[];
  const data: Record<string, unknown> = {};
  for (const k of allowed) {
    if (k === "redditUsername" || k === "country") continue; // immutable
    if (k in body) data[k] = body[k];
  }

  await prisma.worker.update({
    where: { id: session.user.id },
    data,
  });

  return NextResponse.json({ success: true });
}
