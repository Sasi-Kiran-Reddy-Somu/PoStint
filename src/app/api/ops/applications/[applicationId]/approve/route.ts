import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { emailQueue } from "@/lib/queue";
import bcrypt from "bcryptjs";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

export async function POST(req: NextRequest, { params }: { params: { applicationId: string } }) {
  const session = await auth();
  if (!session || session.user.role !== "ops") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { applicationId } = params;
  const body = await req.json() as { notes?: string };

  const application = await prisma.application.findUnique({ where: { id: applicationId } });
  if (!application) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (application.status === "approved") return NextResponse.json({ error: "Already approved" }, { status: 409 });

  // Create temporary password (worker will set their own on first login)
  const tempPassword = Math.random().toString(36).slice(-12);
  const passwordHash = await bcrypt.hash(tempPassword, 12);

  const worker = await prisma.$transaction(async (tx) => {
    const w = await tx.worker.create({
      data: {
        redditUsername: application.redditUsername,
        email: application.email,
        passwordHash,
        displayName: application.redditUsername,
        country: application.country,
        referralCode: application.referralCode ?? undefined,
        status: "pending_stripe",
        tier: "tier_1",
        accountHealthScore: 80,
      },
    });

    await tx.application.update({
      where: { id: applicationId },
      data: {
        status: "approved",
        workerId: w.id,
        reviewedBy: session.user.id,
        reviewedAt: new Date(),
        reviewerNotes: body.notes,
      },
    });

    await tx.opsAction.create({
      data: {
        workerId: w.id,
        reviewerId: session.user.id,
        actionType: "approve_application",
        reason: "Manual approval",
        notes: body.notes,
      },
    });

    return w;
  });

  // Send approval email with onboarding link
  const onboardingUrl = `${APP_URL}/api/worker/stripe/onboarding?token=${Buffer.from(worker.id).toString("base64url")}`;
  await emailQueue.add("email", {
    type: "application-approved",
    email: worker.email,
    redditUsername: worker.redditUsername,
    onboardingUrl,
  });

  return NextResponse.json({ success: true, workerId: worker.id });
}
