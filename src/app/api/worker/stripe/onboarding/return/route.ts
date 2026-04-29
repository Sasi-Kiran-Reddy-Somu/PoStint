import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const workerId = searchParams.get("workerId");
  if (!workerId) return NextResponse.redirect(`${APP_URL}/login`);

  const worker = await prisma.worker.findUnique({ where: { id: workerId } });
  if (!worker?.stripeAccountId) return NextResponse.redirect(`${APP_URL}/login`);

  // Fetch latest account state from Stripe
  const account = await stripe.accounts.retrieve(worker.stripeAccountId);

  if (account.charges_enabled && account.payouts_enabled) {
    await prisma.worker.update({
      where: { id: workerId },
      data: { payoutsEnabled: true, status: "active", kycStatus: "verified" },
    });
  }

  return NextResponse.redirect(`${APP_URL}/dashboard`);
}
