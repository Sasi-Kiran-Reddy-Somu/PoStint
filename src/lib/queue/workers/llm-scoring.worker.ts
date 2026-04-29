import { Worker, Job } from "bullmq";
import { redis } from "@/lib/redis";
import { prisma } from "@/lib/prisma";
import { anthropic, SCORING_MODEL } from "@/lib/anthropic";

const RUBRIC = `Score this Reddit comment from 1-10 on four dimensions:
1. Substantiveness (40%): Does it add real information, opinion, or insight? (vs filler)
2. Naturalness (30%): Does it read like a genuine person? (vs generic/AI-generated)
3. Topical knowledge (20%): Does the commenter show familiarity with the subreddit topic?
4. Grammar and tone (10%): Is it well-formed and contextually appropriate?

Reply with valid JSON only:
{"score": <1-10 float>, "s": <1-10>, "n": <1-10>, "t": <1-10>, "g": <1-10>, "reason": "<one sentence>"}`;

async function scoreComment(comment: string, subreddit: string): Promise<{
  score: number; s: number; n: number; t: number; g: number; reason: string;
}> {
  const msg = await anthropic.messages.create({
    model: SCORING_MODEL,
    max_tokens: 200,
    messages: [{
      role: "user",
      content: `Subreddit: r/${subreddit}\nComment: ${comment.slice(0, 500)}\n\n${RUBRIC}`,
    }],
  });
  const text = (msg.content[0] as { type: string; text: string }).text;
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error("No JSON in LLM response");
  return JSON.parse(jsonMatch[0]);
}

export const llmScoringWorker = new Worker(
  "llm-scoring",
  async (job: Job) => {
    const { applicationId } = job.data;
    const application = await prisma.application.findUnique({ where: { id: applicationId } });
    if (!application) return;

    const ua = process.env.REDDIT_USER_AGENT ?? "WorkerMarketplace/1.0";
    const res = await fetch(
      `https://www.reddit.com/user/${application.redditUsername}/comments.json?limit=30`,
      { headers: { "User-Agent": ua } }
    );
    if (!res.ok) {
      await prisma.application.update({
        where: { id: applicationId },
        data: { llmScoreDetails: { error: "reddit_api_failure" } },
      });
      return;
    }

    const data = await res.json();
    const comments: { body: string; subreddit: string }[] = (data?.data?.children ?? [])
      .map((c: { data: { body: string; subreddit: string } }) => c.data)
      .filter((c: { body: string }) => c.body && c.body.length >= 20 && c.body !== "[deleted]");

    if (comments.length < 10) {
      await prisma.application.update({
        where: { id: applicationId },
        data: {
          llmScore: null,
          llmScoreCategory: "insufficient_history",
          llmScoreDetails: { reason: "insufficient_comment_history", count: comments.length },
        },
      });
      return;
    }

    const sample = comments.slice(0, 20);
    const scores: Array<{ comment: string; subreddit: string; score: number; reason: string; details: object }> = [];

    for (const c of sample) {
      try {
        const result = await scoreComment(c.body, c.subreddit);
        scores.push({ comment: c.body.slice(0, 200), subreddit: c.subreddit, score: result.score, reason: result.reason, details: result });
        await new Promise((r) => setTimeout(r, 500)); // rate limit
      } catch {
        // skip failed individual scores
      }
    }

    if (scores.length === 0) {
      await prisma.application.update({
        where: { id: applicationId },
        data: { llmScoreDetails: { error: "all_scores_failed" } },
      });
      return;
    }

    const scoreValues = scores.map((s) => s.score);
    const avg = scoreValues.reduce((a, b) => a + b, 0) / scoreValues.length;
    const sorted = [...scoreValues].sort((a, b) => a - b);
    const median = sorted[Math.floor(sorted.length / 2)];
    const min = sorted[0];
    const max = sorted[sorted.length - 1];

    let category = "medium";
    if (avg >= 8.0) category = "high";
    else if (avg < 6.0) category = "low";

    await prisma.application.update({
      where: { id: applicationId },
      data: {
        llmScore: avg,
        llmScoreCategory: category,
        llmScoreDetails: {
          avg,
          median,
          min,
          max,
          count: scores.length,
          scores: scores.sort((a, b) => b.score - a.score),
        },
      },
    });
  },
  { connection: redis, concurrency: 2 }
);
