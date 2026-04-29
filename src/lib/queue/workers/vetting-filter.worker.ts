import { Worker, Job } from "bullmq";
import { redis } from "@/lib/redis";
import { prisma } from "@/lib/prisma";
import { llmScoringQueue } from "@/lib/queue/queues";

const RATE_LIMIT_MS = 6000; // 10 req/min

async function fetchRedditProfile(username: string) {
  const ua = process.env.REDDIT_USER_AGENT ?? "WorkerMarketplace/1.0";
  const res = await fetch(`https://www.reddit.com/user/${username}/about.json`, {
    headers: { "User-Agent": ua },
  });
  if (!res.ok) throw new Error(`Reddit profile fetch failed: ${res.status}`);
  return res.json();
}

async function fetchRedditActivity(username: string) {
  const ua = process.env.REDDIT_USER_AGENT ?? "WorkerMarketplace/1.0";
  const res = await fetch(`https://www.reddit.com/user/${username}/.json?limit=100`, {
    headers: { "User-Agent": ua },
  });
  if (!res.ok) throw new Error(`Reddit activity fetch failed: ${res.status}`);
  return res.json();
}

async function getThreshold(key: string, fallback: number): Promise<number> {
  const row = await prisma.vettingThreshold.findUnique({ where: { key } });
  return row ? row.value : fallback;
}

export const vettingFilterWorker = new Worker(
  "vetting-filter",
  async (job: Job) => {
    const { applicationId } = job.data;
    await new Promise((r) => setTimeout(r, RATE_LIMIT_MS));

    const application = await prisma.application.findUnique({ where: { id: applicationId } });
    if (!application) return;

    const checkValues: Record<string, unknown> = {};
    let outcome: "passed" | "failed" | "error" = "passed";

    try {
      const profileData = await fetchRedditProfile(application.redditUsername);
      const activityData = await fetchRedditActivity(application.redditUsername);

      const profile = profileData?.data;
      if (!profile) throw new Error("No profile data");

      // Check 1: Account age >= 12 months
      const ageMonthsRequired = await getThreshold("account_age_months", 12);
      const createdUtc = profile.created_utc as number;
      const accountAgeDays = (Date.now() / 1000 - createdUtc) / 86400;
      const accountAgeMonths = accountAgeDays / 30;
      checkValues.accountAge = { value: accountAgeMonths, required: ageMonthsRequired, passed: accountAgeMonths >= ageMonthsRequired };
      if (accountAgeMonths < ageMonthsRequired) outcome = "failed";

      // Check 2: Total karma >= 1000
      const minKarma = await getThreshold("min_total_karma", 1000);
      const totalKarma = (profile.link_karma ?? 0) + (profile.comment_karma ?? 0);
      checkValues.totalKarma = { value: totalKarma, required: minKarma, passed: totalKarma >= minKarma };
      if (totalKarma < minKarma) outcome = "failed";

      // Check 3: Comment karma >= 30% of total
      const minCommentPercent = await getThreshold("min_comment_karma_percent", 0.3);
      const commentPercent = totalKarma > 0 ? (profile.comment_karma ?? 0) / totalKarma : 0;
      checkValues.commentKarmaPercent = { value: commentPercent, required: minCommentPercent, passed: commentPercent >= minCommentPercent };
      if (commentPercent < minCommentPercent) outcome = "failed";

      // Check 4: Active in >= 5 distinct subreddits (last 100 items)
      const minSubreddits = await getThreshold("min_subreddit_diversity", 5);
      const items = activityData?.data?.children ?? [];
      const subreddits = new Set(items.map((i: { data: { subreddit: string } }) => i.data?.subreddit).filter(Boolean));
      checkValues.subredditDiversity = { value: subreddits.size, required: minSubreddits, passed: subreddits.size >= minSubreddits };
      if (subreddits.size < minSubreddits) outcome = "failed";

      // Check 5: Recent activity (post or comment in last 30 days)
      const recentCutoff = Date.now() / 1000 - 30 * 86400;
      const hasRecent = items.some((i: { data: { created_utc: number } }) => (i.data?.created_utc ?? 0) > recentCutoff);
      checkValues.recentActivity = { value: hasRecent, required: true, passed: hasRecent };
      if (!hasRecent) outcome = "failed";

      // Check 6: Not suspended or shadowbanned
      const isSuspended = profile.is_suspended === true;
      checkValues.notSuspended = { value: !isSuspended, required: true, passed: !isSuspended };
      if (isSuspended) outcome = "failed";

    } catch (err) {
      outcome = "error";
      checkValues.error = String(err);
    }

    const newStatus = outcome === "passed" ? "pending_review_passed" : "pending_review_failed";

    await prisma.$transaction([
      prisma.application.update({
        where: { id: applicationId },
        data: {
          status: newStatus as never,
          filterPassed: outcome === "passed",
          filterResults: checkValues as object,
        },
      }),
      prisma.vettingFilterRun.create({
        data: {
          applicationId,
          outcome,
          checkValues: checkValues as object,
        },
      }),
    ]);

    // Always enqueue LLM scoring regardless of filter result
    await llmScoringQueue.add("score-comments", { applicationId }, { delay: 1000 });
  },
  { connection: redis, concurrency: 3 }
);
