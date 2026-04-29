import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const subreddits = [
  "personalfinance", "investing", "frugal", "povertyfinance", "financialindependence",
  "fitness", "loseit", "running", "xxfitness", "bodyweightfitness",
  "technology", "programming", "webdev", "learnprogramming", "cscareerquestions",
  "explainlikeimfive", "askscience", "todayilearned", "science", "space",
  "mentalhealth", "anxiety", "depression", "selfimprovement", "productivity",
  "cooking", "mealprep", "veganrecipes", "food", "nutrition",
  "parenting", "relationship_advice", "dating_advice", "socialskills", "college",
  "entrepreneur", "smallbusiness", "freelance", "digitalnomad", "remotework",
  "travel", "solotravel", "backpacking", "roadtrips", "camping",
];

const threadTitles = [
  "What's the single best financial decision you've ever made?",
  "How do you stay motivated to work out consistently?",
  "What programming language should beginners start with in 2026?",
  "ELI5: How does inflation actually affect everyday people?",
  "What's your go-to meal prep strategy for the week?",
  "Best advice you'd give your 20-year-old self?",
  "How did you overcome social anxiety?",
  "What's the most underrated travel destination you've visited?",
  "Tips for someone starting their first business?",
  "How do you balance work and personal life when working remotely?",
  "What's a frugal habit that actually makes a big difference?",
  "Share your running progress — any milestone this week?",
  "What's the best way to learn a new skill from scratch?",
  "Honest question: how do people actually stick to a budget?",
  "What's your biggest investment regret?",
  "Daily check-in: How's everyone doing today?",
  "What workout routine finally worked for you after years of failure?",
  "Best free resources for learning to code?",
  "How do you deal with burnout?",
  "What's a simple recipe that everyone should know?",
];

const commentTexts = [
  "Honestly, the biggest game-changer for me was automating my savings. I set up an automatic transfer the day after payday and never see the money — works incredibly well.",
  "Consistency over intensity, every time. I started with just 15 minutes a day and built from there. Two years later I haven't missed a week.",
  "Python is genuinely the best starting point. The syntax is readable, the community is huge, and you can build real things quickly without getting bogged down in complexity.",
  "Inflation hits hardest on essentials — food, housing, energy. People with fixed incomes feel it most acutely because those costs don't wait for wages to catch up.",
  "Sunday meal prep changed my life. I cook a big batch of protein, roast two trays of veg, and make a grain. Mix and match all week. Takes about 90 minutes total.",
  "Start an emergency fund before anything else. Having 3 months of expenses saved removed so much anxiety that I actually became better at everything else.",
  "The compound effect of small habits is real. I started making my bed every morning and it genuinely set the tone for more discipline throughout the day.",
  "Southeast Asia is criminally underrated for solo travel. Vietnam in particular — the food, the people, the cost, the scenery. It has everything.",
  "Start before you're ready. The perfectionism trap kills more businesses than bad ideas ever will. Ship something imperfect and iterate.",
  "Time-blocking transformed my remote work productivity. I treat focus blocks like meetings I can't reschedule. No notifications, door closed.",
  "Cooking at home instead of eating out saved me over $400 a month. Sounds obvious but actually tracking it was the wake-up call I needed.",
  "The hardest part of running is the first 5 minutes. I tell myself I only have to make it past those and 9 times out of 10 I keep going.",
  "Spaced repetition with Anki is probably the single most effective learning technique I've found. Slow to set up, but the retention is incredible.",
  "The envelope method felt outdated but it works. Physically separating cash into categories makes spending feel more real than swiping a card.",
  "I switched from stock picking to index funds after losing a chunk trying to time the market. Best financial decision I made in my 30s.",
  "What helped me most with burnout was actually doing less, not more. I removed two commitments from my schedule and everything else improved.",
  "Progressive overload is the secret nobody tells beginners. Adding a tiny bit of weight or reps each week compounds into massive gains over months.",
  "freeCodeCamp got me from zero to my first job. Pair it with building actual projects and you'll learn faster than any bootcamp.",
  "Taking a complete digital detox every Sunday helped my burnout more than any productivity hack. One day without screens reset something fundamental.",
  "A 3-ingredient pasta sauce: olive oil, garlic, tinned tomatoes. Season well, cook low and slow. Better than most restaurant versions.",
];

const postTitles = [
  "I paid off $30k in debt in 18 months — here's the exact strategy",
  "After 5 years of trying, I finally found a workout routine that stuck",
  "Switched careers to tech at 34 — honest timeline and what I wish I knew",
  "I've visited 47 countries solo — the most practical packing list I've built",
  "Built a side business to $5k/month while working full time — AMA",
  "I tracked every dollar for a year — the results surprised me",
  "Mental health update: 6 months of therapy and what actually changed",
  "Tried every meal prep strategy — here's what actually saved the most time",
  "Went remote 3 years ago — the honest pros and cons nobody talks about",
  "From couch to half marathon in 6 months — week by week breakdown",
  "I quit social media for 90 days — unexpected things that happened",
  "First-time investor at 28 — mistakes I made and what I'd do differently",
  "Learning Spanish from zero to conversational in 8 months — my exact method",
  "6 months of minimalism — what I kept, what I got rid of, what I regret",
  "Started a small cooking channel — what I learned about consistency",
  "How I negotiate bills and save $200/month without cancelling anything",
  "Tried cold showers every morning for 30 days — actual results",
  "Built an emergency fund on a low income — the unglamorous reality",
  "One year of bullet journaling — honest review from a chronic procrastinator",
  "Moved to a new city alone at 30 — how I built a social life from scratch",
];

const postBodies = [
  "I want to share the exact breakdown because I wish someone had done this for me when I started. It wasn't glamorous — it was spreadsheets, meal prep, and saying no to a lot of things. But the framework was simple: track every dollar, attack the highest interest debt first, and find one income stream to add. Happy to answer any questions.",
  "The key for me was removing friction. I laid out my workout clothes the night before, kept my gym bag by the door, and never gave myself the option to deliberate in the morning. Discipline is overrated — environment design is underrated.",
  "The honest answer is that it took longer than the bootcamp told me it would, but less time than people on forums claimed. I spent 18 months learning, built 4 projects, applied to 60 jobs, and got 3 offers. The biggest factor wasn't the tech — it was learning to communicate clearly in interviews.",
  "After 5 years of travelling carry-on only, this is what I actually bring. I'll link the exact products I use because I spent way too long researching and want to save someone else the time. The short answer: less than you think, and merino wool for everything.",
  "I want to be honest about what it actually takes because most income reports skip the hard parts. Year 1 I made $200. Year 2 I broke even. It wasn't until I niched down hard and stopped trying to serve everyone that revenue finally started growing consistently.",
  "The biggest shock wasn't how much I was spending on food — it was subscriptions. I had 14 active subscriptions I'd forgotten about. I kept 4. That one change alone freed up $180 a month.",
  "I won't pretend therapy fixed everything overnight. The first 8 weeks felt like I was just talking and nothing was happening. The shift came around week 10 when I noticed I was reacting differently to things that used to spiral me. Slow, quiet progress is still progress.",
  "The strategy that won for me: cook once, eat differently. Same protein base, different sauces and spices each day. Your brain gets variety, your prep time stays under an hour. Game changer.",
  "The thing nobody warned me about with remote work is that loneliness hits differently than expected. It's not that you're alone — you have calls all day. It's the absence of accidental conversations that slowly erodes something. I started a co-working membership and it made a real difference.",
  "Week 1-4: learn to run without stopping for 20 minutes. Weeks 5-10: build base mileage slowly. Weeks 11-20: add one longer run each week. The full breakdown with exact paces and rest days is in the comments.",
];

async function main() {
  console.log("Seeding mock tasks...");

  // Delete existing sample tasks to avoid duplicates
  await prisma.task.deleteMany({ where: { source: "mock" } });

  const now = new Date();
  const tasks = [];

  // 50 comment tasks (tier_1)
  for (let i = 0; i < 50; i++) {
    const sub = subreddits[i % subreddits.length];
    const title = threadTitles[i % threadTitles.length];
    const comment = commentTexts[i % commentTexts.length];
    const threadId = `abc${i.toString().padStart(4, "0")}`;
    tasks.push({
      source: "mock",
      type: "comment" as const,
      targetSubreddit: sub,
      threadTitle: title,
      targetThreadUrl: `https://www.reddit.com/r/${sub}/comments/${threadId}/`,
      brief: {
        subreddit: sub,
        threadTitle: title,
        threadUrl: `https://www.reddit.com/r/${sub}/comments/${threadId}/`,
        commentText: comment,
      },
      creditValue: 250,
      minTier: "tier_1" as const,
      status: "available" as const,
      expiresAt: new Date(now.getTime() + 72 * 3600_000),
    });
  }

  // 30 upvote tasks (tier_1)
  for (let i = 0; i < 30; i++) {
    const sub = subreddits[(i + 10) % subreddits.length];
    const title = threadTitles[(i + 5) % threadTitles.length];
    const threadId = `upv${i.toString().padStart(4, "0")}`;
    tasks.push({
      source: "mock",
      type: "upvote" as const,
      targetSubreddit: sub,
      threadTitle: title,
      targetThreadUrl: `https://www.reddit.com/r/${sub}/comments/${threadId}/`,
      brief: {
        subreddit: sub,
        threadTitle: title,
        threadUrl: `https://www.reddit.com/r/${sub}/comments/${threadId}/`,
      },
      creditValue: 20,
      minTier: "tier_1" as const,
      status: "available" as const,
      expiresAt: new Date(now.getTime() + 72 * 3600_000),
    });
  }

  // 20 post tasks (tier_2)
  for (let i = 0; i < 20; i++) {
    const sub = subreddits[(i + 20) % subreddits.length];
    tasks.push({
      source: "mock",
      type: "post" as const,
      targetSubreddit: sub,
      threadTitle: postTitles[i % postTitles.length],
      brief: {
        subreddit: sub,
        subredditUrl: `https://www.reddit.com/r/${sub}/submit`,
        postTitle: postTitles[i % postTitles.length],
        postBody: postBodies[i % postBodies.length],
      },
      creditValue: 400,
      minTier: "tier_2" as const,
      status: "available" as const,
      expiresAt: new Date(now.getTime() + 72 * 3600_000),
    });
  }

  await prisma.task.createMany({ data: tasks });
  console.log(`Created ${tasks.length} mock tasks (50 comment, 30 upvote, 20 post).`);

  // Create david@gmail.com as tier2 worker
  const hash = await bcrypt.hash("12345", 10);
  await prisma.worker.upsert({
    where: { email: "david@gmail.com" },
    update: { tier: "tier_2", passwordHash: hash, status: "active" },
    create: {
      email: "david@gmail.com",
      passwordHash: hash,
      redditUsername: "david_reddit",
      displayName: "David",
      status: "active",
      tier: "tier_2",
      kycStatus: "verified",
      payoutsEnabled: true,
      accountHealthScore: 100,
      hasSeenWelcomeTour: true,
    },
  });
  console.log("Created david@gmail.com (tier2) — password: 12345");

  await prisma.$disconnect();
}

main().catch((e) => { console.error(e); process.exit(1); });
