import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";
import { isBannedIp, getClientIp, logIpEvent } from "@/lib/ip-logger";
import { WITHDRAWAL_THRESHOLD_CREDITS, CREDITS_PER_DOLLAR } from "@/lib/utils";
import { z } from "zod";

const withdrawSchema = z.object({
  amountCredits: z.number().int().min(WITHDRAWAL_THRESHOLD_CREDITS),
});

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session || session.user.role !== "worker") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const workerId = session.user.id;
  const ip = getClientIp(req);

  // IP fraud check (real-time)
  if (await isBannedIp(ip)) {
    return NextResponse.json({ error: "Unable to process withdrawal at this time. Please contact support." }, { status: 403 });
  }

  let body: unknown;
  try { body = await req.json(); } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = withdrawSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: `Minimum withdrawal is ${WITHDRAWAL_THRESHOLD_CREDITS} credits ($${WITHDRAWAL_THRESHOLD_CREDITS / CREDITS_PER_DOLLAR}).` }, { status: 400 });
  }

  const { amountCredits } = parsed.data;

  const worker = await prisma.worker.findUnique({ where: { id: workerId } });
  if (!worker) return NextResponse.json({ error: "Worker not found" }, { status: 404 });

  if (worker.status === "suspended") return NextResponse.json({ error: "Account is suspended." }, { status: 403 });
  if (worker.withdrawalsLocked) return NextResponse.json({ error: "Withdrawals are locked on this account." }, { status: 403 });
  if (!worker.payoutsEnabled || !worker.stripeAccountId) {
    return NextResponse.json({ error: "Complete Stripe onboarding to withdraw." }, { status: 403 });
  }

  // Check no active withdrawal
  const activeWithdrawal = await prisma.withdrawal.findFirst({
    where: { workerId, status: "processing" },
  });
  if (activeWithdrawal) {
    return NextResponse.json({ error: "You have a withdrawal in progress. Please wait for it to complete." }, { status: 409 });
  }

  // Check available balance
  const balanceResult = await prisma.creditTransaction.aggregate({
    where: { workerId, state: "available" },
    _sum: { amountCredits: true },
  });
  const available = balanceResult._sum.amountCredits ?? 0;

  if (amountCredits > available) {
    return NextResponse.json({ error: "Insufficient available balance." }, { status: 400 });
  }

  const amountDollars = amountCredits / CREDITS_PER_DOLLAR;
  const amountCents = Math.round(amountDollars * 100);

  // Check for pending first-10-tasks bonus and add it
  const pendingBonus = await prisma.workerBonus.findFirst({
    where: { workerId, bonusType: "first_10_tasks", appliedAt: null },
  });

  try {
    const withdrawal = await prisma.$transaction(async (tx) => {
      // Decrement available balance
      const w = await tx.withdrawal.create({
        data: { workerId, amountCredits, amountDollars, status: "processing" },
      });

      await tx.creditTransaction.create({
        data: {
          workerId,
          amountCredits: -amountCredits,
          direction: "withdraw",
          state: "withdrawn",
          withdrawalId: w.id,
          reason: "withdrawal",
        },
      });

      // Apply pending bonus if exists
      if (pendingBonus) {
        await tx.workerBonus.update({
          where: { id: pendingBonus.id },
          data: { appliedAt: new Date() },
        });
        await tx.creditTransaction.create({
          data: {
            workerId,
            amountCredits: pendingBonus.amount,
            direction: "earn",
            state: "available",
            reason: "first_10_tasks_bonus",
          },
        });
      }

      return w;
    });

    // Initiate Stripe payout
    const transfer = await stripe.transfers.create({
      amount: amountCents,
      currency: "usd",
      destination: worker.stripeAccountId!,
      metadata: { withdrawalId: withdrawal.id, workerId },
    });

    await prisma.withdrawal.update({
      where: { id: withdrawal.id },
      data: { stripePayoutId: transfer.id },
    });

    // Log IP event
    logIpEvent(workerId, ip, "withdrawal", req.headers.get("user-agent") ?? undefined);

    if (pendingBonus) {
      await prisma.notification.create({
        data: {
          workerId,
          channel: "in_app",
          type: "bonus_applied",
          title: "Welcome bonus applied",
          body: `${pendingBonus.amount} credits welcome bonus added to this withdrawal.`,
        },
      });
    }

    return NextResponse.json({
      success: true,
      withdrawalId: withdrawal.id,
      message: "Withdrawal initiated. Funds expected in 1 to 3 business days.",
      bonusApplied: pendingBonus ? pendingBonus.amount : 0,
    });
  } catch (err) {
    console.error("Withdrawal error:", err);
    return NextResponse.json({ error: "Withdrawal failed. Please try again." }, { status: 500 });
  }
}
