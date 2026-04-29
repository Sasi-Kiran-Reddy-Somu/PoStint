import { Worker, Job } from "bullmq";
import { redis } from "@/lib/redis";
import { prisma } from "@/lib/prisma";
import { resend, FROM_EMAIL, APP_NAME } from "@/lib/resend";

export const emailWorker = new Worker(
  "email",
  async (job: Job) => {
    const { type } = job.data;

    switch (type) {
      case "application-approved": {
        const { email, redditUsername, onboardingUrl } = job.data;
        await resend.emails.send({
          from: FROM_EMAIL,
          to: email,
          subject: "You're in. Let's get you set up.",
          html: approvalEmailHtml(redditUsername, onboardingUrl),
        });
        break;
      }

      case "application-rejected": {
        const { email } = job.data;
        await resend.emails.send({
          from: FROM_EMAIL,
          to: email,
          subject: "Update on your application",
          html: rejectionEmailHtml(),
        });
        break;
      }

      case "send-verification-result": {
        const { workerId, outcome, subreddit } = job.data;
        const worker = await prisma.worker.findUnique({ where: { id: workerId } });
        if (!worker || !worker.notifWithdrawEmail) break;
        const subject = outcome === "success" ? "Task verified — credits released" : "Task verification failed";
        const body = outcome === "success"
          ? `Your task in r/${subreddit} passed the 3-day verification. Credits have been released to your available balance.`
          : `Your task in r/${subreddit} did not pass verification. No credits were paid for this task.`;
        await resend.emails.send({
          from: FROM_EMAIL,
          to: worker.email,
          subject,
          html: simpleEmailHtml(worker.displayName ?? worker.redditUsername, subject, body),
        });
        break;
      }

      case "withdrawal-confirmation": {
        const { workerId, amountDollars, bankLast4, withdrawalId } = job.data;
        const worker = await prisma.worker.findUnique({ where: { id: workerId } });
        if (!worker) break;
        await resend.emails.send({
          from: FROM_EMAIL,
          to: worker.email,
          subject: `Your withdrawal of $${amountDollars.toFixed(2)} has arrived`,
          html: withdrawalConfirmHtml(worker.displayName ?? worker.redditUsername, amountDollars, bankLast4, withdrawalId),
        });
        break;
      }

      case "withdrawal-failed": {
        const { workerId, failureReason } = job.data;
        const worker = await prisma.worker.findUnique({ where: { id: workerId } });
        if (!worker) break;
        const readableReason = failureReason?.replace(/_/g, " ") ?? "unknown reason";
        await resend.emails.send({
          from: FROM_EMAIL,
          to: worker.email,
          subject: "Withdrawal failed — credits returned",
          html: simpleEmailHtml(
            worker.displayName ?? worker.redditUsername,
            "Withdrawal failed — credits returned",
            `Your withdrawal failed because: ${readableReason}. Your credits have been returned to your available balance. Update your bank account in Settings and try again.`
          ),
        });
        break;
      }

      case "tier-promotion": {
        const { workerId } = job.data;
        const worker = await prisma.worker.findUnique({ where: { id: workerId } });
        if (!worker) break;
        await resend.emails.send({
          from: FROM_EMAIL,
          to: worker.email,
          subject: "You've been promoted to Tier 2!",
          html: simpleEmailHtml(
            worker.displayName ?? worker.redditUsername,
            "Promoted to Tier 2",
            "Congratulations! You now have access to 2 daily comments, post tasks ($1.50 each), and higher pay rates."
          ),
        });
        break;
      }

      case "account-paused": {
        const { workerId } = job.data;
        const worker = await prisma.worker.findUnique({ where: { id: workerId } });
        if (!worker) break;
        await resend.emails.send({
          from: FROM_EMAIL,
          to: worker.email,
          subject: "Your account is temporarily paused",
          html: simpleEmailHtml(
            worker.displayName ?? worker.redditUsername,
            "Account temporarily paused",
            "Your account health dropped below the required threshold. Your account is paused for 7 days. Existing pending credits will still process normally."
          ),
        });
        break;
      }

      case "account-suspended": {
        const { workerId } = job.data;
        const worker = await prisma.worker.findUnique({ where: { id: workerId } });
        if (!worker) break;
        await resend.emails.send({
          from: FROM_EMAIL,
          to: worker.email,
          subject: "Account suspended",
          html: simpleEmailHtml(
            worker.displayName ?? worker.redditUsername,
            "Account suspended",
            "Your account has been suspended. You can still withdraw your available credits. Contact support if you wish to appeal."
          ),
        });
        break;
      }

      case "inactivity-reminder": {
        const { workerId, stage } = job.data;
        const worker = await prisma.worker.findUnique({ where: { id: workerId } });
        if (!worker) break;
        const subject = stage === 2 ? "It's been 2 weeks. Tasks are waiting." : "We miss you. Your account stays active for one more week.";
        await resend.emails.send({
          from: FROM_EMAIL,
          to: worker.email,
          subject,
          html: simpleEmailHtml(worker.displayName ?? worker.redditUsername, subject,
            "Come back and complete tasks to maintain your account status and keep earning."),
        });
        break;
      }

      case "weekly-digest": {
        const { workerId } = job.data;
        const worker = await prisma.worker.findUnique({
          where: { id: workerId },
          include: {
            taskAssignments: {
              where: { status: "verified", verifiedAt: { gte: new Date(Date.now() - 7 * 86_400_000) } },
            },
          },
        });
        if (!worker || !worker.notifWeeklyEmail) break;
        const weeklyCredits = worker.taskAssignments.reduce((sum, a) => sum + 75, 0);
        await resend.emails.send({
          from: FROM_EMAIL,
          to: worker.email,
          subject: `Your week on ${APP_NAME} — ${worker.taskAssignments.length} tasks completed`,
          html: simpleEmailHtml(
            worker.displayName ?? worker.redditUsername,
            `Your week in review`,
            `Tasks completed: ${worker.taskAssignments.length}\nCredits earned this week: ${weeklyCredits}\nCurrent tier: ${worker.tier.replace("_", " ").toUpperCase()}`
          ),
        });
        break;
      }
    }
  },
  { connection: redis, concurrency: 10 }
);

// ─── Email HTML Templates ─────────────────────────────────────────────────────

function approvalEmailHtml(username: string, onboardingUrl: string): string {
  return `<!DOCTYPE html>
<html><body style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:40px 20px">
<h1 style="color:#1a1a1a">You're in. Let's get you set up.</h1>
<p>Hi ${username},</p>
<p>Your application has been approved. Complete your account setup to start earning:</p>
<ol>
  <li>Verify your identity (Stripe handles this)</li>
  <li>Add a bank account for payouts</li>
  <li>Receive your first task within 24 hours</li>
</ol>
<p>Estimated time: 5–10 minutes.</p>
<a href="${onboardingUrl}" style="display:inline-block;background:#4f46e5;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600">Complete Onboarding</a>
<p style="font-size:12px;color:#666;margin-top:40px">This link expires in 14 days.</p>
</body></html>`;
}

function rejectionEmailHtml(): string {
  return `<!DOCTYPE html>
<html><body style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:40px 20px">
<h1 style="color:#1a1a1a">Update on your application</h1>
<p>Thank you for applying. Unfortunately, your application was not accepted at this time.</p>
<p>You're welcome to reapply in 6 months. If you have questions about our general policy, contact support.</p>
</body></html>`;
}

function withdrawalConfirmHtml(name: string, amount: number, bankLast4: string, withdrawalId: string): string {
  return `<!DOCTYPE html>
<html><body style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:40px 20px">
<h1 style="color:#1a1a1a">Your withdrawal of $${amount.toFixed(2)} has arrived</h1>
<p>Hi ${name},</p>
<p><strong>Amount:</strong> $${amount.toFixed(2)}<br>
<strong>Sent to:</strong> ****${bankLast4}<br>
<strong>Reference:</strong> ${withdrawalId}</p>
<p>Funds typically arrive within 1–3 business days.</p>
</body></html>`;
}

function simpleEmailHtml(name: string, title: string, body: string): string {
  return `<!DOCTYPE html>
<html><body style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:40px 20px">
<h2 style="color:#1a1a1a">${title}</h2>
<p>Hi ${name},</p>
<p>${body.replace(/\n/g, "<br>")}</p>
</body></html>`;
}
