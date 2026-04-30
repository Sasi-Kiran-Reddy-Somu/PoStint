import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const WORKER_ID = "cmokektv0002srgywx6xnim0j";

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
  const worker = await prisma.worker.findUnique({
    where: { id: WORKER_ID },
    select: SELECT_FIELDS,
  });
  return NextResponse.json(worker);
}

export async function PATCH(req: NextRequest) {
  const body = await req.json();

  const allowed = Object.keys(SELECT_FIELDS) as (keyof typeof SELECT_FIELDS)[];
  const data: Record<string, unknown> = {};
  for (const k of allowed) {
    if (k === "redditUsername" || k === "country") continue;
    if (k in body) data[k] = body[k];
  }

  await prisma.worker.update({
    where: { id: WORKER_ID },
    data,
  });

  return NextResponse.json({ success: true });
}
