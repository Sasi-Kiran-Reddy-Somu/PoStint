import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";

const WORKER_ID = "cmokektv0002srgywx6xnim0j";
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

export async function POST() {
  const workerId = WORKER_ID;
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
