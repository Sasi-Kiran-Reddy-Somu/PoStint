import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // Default ops user (OpsUser has no role field in schema)
  const opsPassword = await bcrypt.hash("ops-admin-2024!", 10);
  await prisma.opsUser.upsert({
    where: { email: "ops@workermarketplace.com" },
    update: {},
    create: {
      email: "ops@workermarketplace.com",
      passwordHash: opsPassword,
      name: "Ops Admin",
    },
  });
  console.log("Created ops user: ops@workermarketplace.com / ops-admin-2024!");

  // Vetting thresholds
  const thresholds = [
    { key: "account_age_months", value: 12, description: "Minimum Reddit account age in months" },
    { key: "min_total_karma", value: 1000, description: "Minimum total karma" },
    { key: "min_comment_karma_pct", value: 30, description: "Minimum comment karma as % of total" },
    { key: "min_subreddit_diversity", value: 5, description: "Minimum distinct subreddits active in" },
    { key: "recent_activity_days", value: 30, description: "Must have posted within this many days" },
  ];

  for (const t of thresholds) {
    await prisma.vettingThreshold.upsert({
      where: { key: t.key },
      update: { value: t.value },
      create: t,
    });
  }
  console.log("Seeded vetting thresholds.");

  // Platform config
  const configs = [
    { key: "tier_2_karma_threshold", value: "5000" },
    { key: "tier_2_verified_tasks_threshold", value: "20" },
    { key: "retention_milestone_months", value: "2" },
    { key: "retention_bonus_credits", value: "500" },
    { key: "first_10_bonus_credits", value: "200" },
    { key: "min_withdrawal_credits", value: "2000" },
    { key: "auto_pause_health_threshold", value: "50" },
    { key: "auto_suspend_health_threshold", value: "30" },
    { key: "claim_timer_minutes", value: "5" },
    { key: "brand_cooldown_days", value: "3" },
    { key: "t3_verification_hours", value: "72" },
  ];

  for (const c of configs) {
    await prisma.platformConfig.upsert({
      where: { key: c.key },
      update: { value: c.value },
      create: c,
    });
  }
  console.log("Seeded platform config.");

  // Health score weights (signalKey is the unique field)
  const weights = [
    { signalKey: "verification_success", weight: 5, description: "Task verified successfully" },
    { signalKey: "verification_failed", weight: -10, description: "T+3 verification failed" },
    { signalKey: "task_expired", weight: -5, description: "Claimed task not submitted in time" },
    { signalKey: "dispute_upheld", weight: 0, description: "Dispute resolved in platform's favor" },
    { signalKey: "dispute_reversed", weight: 3, description: "Dispute resolved in worker's favor" },
    { signalKey: "shadowban_detected", weight: -15, description: "Reddit shadowban detected" },
    { signalKey: "ip_overlap_flagged", weight: -20, description: "IP overlap with another worker flagged" },
  ];

  for (const w of weights) {
    await prisma.healthScoreWeight.upsert({
      where: { signalKey: w.signalKey },
      update: { weight: w.weight },
      create: w,
    });
  }
  console.log("Seeded health score weights.");

  // Sample tasks (brief is Json, type is TaskType enum, status is TaskStatus enum)
  const sampleTasks = [
    {
      type: "comment" as const,
      targetSubreddit: "personalfinance",
      brief: { text: "Share a genuine tip about budgeting for beginners. Keep it personal and practical." },
      creditValue: 250,
      minTier: "tier_1" as const,
      status: "available" as const,
    },
    {
      type: "comment" as const,
      targetSubreddit: "explainlikeimfive",
      brief: { text: "Explain how compound interest works to someone who has never heard of it. Use an analogy." },
      creditValue: 250,
      minTier: "tier_1" as const,
      status: "available" as const,
    },
    {
      type: "comment" as const,
      targetSubreddit: "fitness",
      brief: { text: "Share your experience with a workout routine that worked well for you. Be specific about results." },
      creditValue: 250,
      minTier: "tier_1" as const,
      status: "available" as const,
    },
    {
      type: "comment" as const,
      targetSubreddit: "technology",
      brief: { text: "Comment on a recent tech news thread sharing your perspective on privacy implications." },
      creditValue: 250,
      minTier: "tier_2" as const,
      status: "available" as const,
    },
    {
      type: "comment" as const,
      targetSubreddit: "investing",
      brief: { text: "Engage in a thread about index funds with a thoughtful, balanced perspective." },
      creditValue: 250,
      minTier: "tier_2" as const,
      status: "available" as const,
    },
  ];

  for (const t of sampleTasks) {
    await prisma.task.create({ data: t });
  }
  console.log(`Seeded ${sampleTasks.length} sample tasks.`);

  // TaskCreditValue — unique on taskType (one entry per type)
  const creditValues = [
    { taskType: "comment" as const, credits: 250, description: "Standard comment task" },
    { taskType: "post" as const, credits: 400, description: "Post task (Tier 2 only)" },
    { taskType: "upvote" as const, credits: 20, description: "Upvote task" },
  ];

  for (const cv of creditValues) {
    await prisma.taskCreditValue.upsert({
      where: { taskType: cv.taskType },
      update: { credits: cv.credits },
      create: cv,
    });
  }
  console.log("Seeded task credit values.");

  console.log("Seed complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
