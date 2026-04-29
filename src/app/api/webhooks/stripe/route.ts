import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import { emailQueue } from "@/lib/queue";
import Stripe from "stripe";

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature");
  if (!sig) return NextResponse.json({ error: "No signature" }, { status: 400 });

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET ?? "");
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  switch (event.type) {
    case "account.updated": {
      const account = event.data.object as Stripe.Account;
      const workerId = account.metadata?.workerId;
      if (!workerId) break;

      if (account.charges_enabled && account.payouts_enabled) {
        await prisma.worker.update({
          where: { id: workerId },
          data: { payoutsEnabled: true, status: "active", kycStatus: "verified" },
        });
      }
      break;
    }

    case "payout.paid": {
      const payout = event.data.object as Stripe.Payout;
      const withdrawal = await prisma.withdrawal.findFirst({
        where: { stripePayoutId: payout.id },
        include: { worker: true },
      });
      if (!withdrawal) break;

      await prisma.withdrawal.update({
        where: { id: withdrawal.id },
        data: { status: "completed", completedAt: new Date() },
      });

      await prisma.notification.create({
        data: {
          workerId: withdrawal.workerId,
          channel: "in_app",
          type: "withdrawal_completed",
          title: `Withdrawal of $${withdrawal.amountDollars.toFixed(2)} completed`,
          body: "Your withdrawal has been processed and funds are on their way to your bank.",
          payload: { withdrawalId: withdrawal.id, amountDollars: withdrawal.amountDollars },
        },
      });

      await emailQueue.add("email", {
        type: "withdrawal-confirmation",
        workerId: withdrawal.workerId,
        amountDollars: withdrawal.amountDollars,
        bankLast4: "****",
        withdrawalId: withdrawal.id,
      });
      break;
    }

    case "payout.failed": {
      const payout = event.data.object as Stripe.Payout;
      const withdrawal = await prisma.withdrawal.findFirst({
        where: { stripePayoutId: payout.id },
        include: { worker: true },
      });
      if (!withdrawal) break;

      const failureReason = payout.failure_code ?? "unknown";

      await prisma.$transaction([
        prisma.withdrawal.update({
          where: { id: withdrawal.id },
          data: { status: "failed", failureReason },
        }),
        // Refund credits
        prisma.creditTransaction.create({
          data: {
            workerId: withdrawal.workerId,
            amountCredits: withdrawal.amountCredits,
            direction: "earn",
            state: "available",
            reason: "withdrawal_failed",
          },
        }),
        prisma.notification.create({
          data: {
            workerId: withdrawal.workerId,
            channel: "in_app",
            type: "withdrawal_failed",
            title: "Withdrawal failed — credits returned",
            body: `Your withdrawal of $${withdrawal.amountDollars.toFixed(2)} failed. Credits have been returned to your balance. Update your bank account and try again.`,
          },
        }),
      ]);

      await emailQueue.add("email", {
        type: "withdrawal-failed",
        workerId: withdrawal.workerId,
        failureReason,
      });
      break;
    }
  }

  return NextResponse.json({ received: true });
}
