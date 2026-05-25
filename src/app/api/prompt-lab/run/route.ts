import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface RunBody {
  prompt: string;
  variables: Record<string, string>;
  promptKey?: string;
  model?: string;
  maxTokens?: number;
  temperature?: number;
}

function interpolate(template: string, vars: Record<string, string>): string {
  return template.replace(/\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g, (_, key) => vars[key] ?? "");
}

export async function POST(req: NextRequest) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "ANTHROPIC_API_KEY is not set in .env.local" }, { status: 500 });
  }

  let body: RunBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { prompt, variables, promptKey } = body;
  if (typeof prompt !== "string") {
    return NextResponse.json({ error: "prompt must be a string" }, { status: 400 });
  }

  const rendered = interpolate(prompt, variables ?? {});
  const client = new Anthropic({ apiKey });
  const model = body.model || "claude-sonnet-4-6";
  const maxTokens = body.maxTokens ?? 2048;
  const temperature = body.temperature ?? 0.8;
  const useWebSearch = promptKey === "subreddits";

  const started = Date.now();
  try {
    const requestParams: Anthropic.MessageCreateParamsNonStreaming = {
      model,
      max_tokens: maxTokens,
      temperature,
      system: rendered,
      messages: [{ role: "user", content: "Generate now." }],
    };

    if (useWebSearch) {
      requestParams.tools = [{ type: "web_search_20250305", name: "web_search" } as never];
    }

    const resp = await client.messages.create(requestParams);

    const text = resp.content
      .filter((b): b is Anthropic.TextBlock => b.type === "text")
      .map((b) => b.text)
      .join("\n");

    return NextResponse.json({
      output: text,
      rendered,
      usage: resp.usage,
      model: resp.model,
      durationMs: Date.now() - started,
      webSearchUsed: useWebSearch,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
