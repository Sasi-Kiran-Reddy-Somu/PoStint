import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session || session.user.role !== "worker") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const workerId = session.user.id;
  const worker = await prisma.worker.findUnique({ where: { id: workerId } });
  if (!worker) return NextResponse.json({ error: "Worker not found" }, { status: 404 });

  let stripeAccountId = worker.stripeAccountId;

  if (!stripeAccountId) {
    const account = await stripe.accounts.create({
      type: "express",
      country: worker.country === "Canada" ? "CA" : "US",
      email: worker.email,
      metadata: { workerId },
    });
    stripeAccountId = account.id;
    await prisma.worker.update({
      where: { id: workerId },
      data: { stripeAccountId },
    });
  }

  const accountLink = await stripe.accountLinks.create({
    account: stripeAccountId,
    refresh_url: `${APP_URL}/settings?stripe=refresh`,
    return_url: `${APP_URL}/api/worker/stripe/onboarding/return?workerId=${workerId}`,
    type: "account_onboarding",
  });

  return NextResponse.json({ url: accountLink.url });
}
