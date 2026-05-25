"use client";

import { useEffect, useMemo, useState } from "react";
import { PROMPTS, type PromptKey } from "@/lib/prompt-lab/templates";
import { PERSONAS, formatPersonaBlock } from "@/lib/prompt-lab/personalities";

interface RunRecord {
  id: string;
  promptKey: PromptKey;
  timestamp: number;
  variables: Record<string, string>;
  prompt: string;
  output: string;
  durationMs?: number;
  usage?: unknown;
}

const HISTORY_KEY = "prompt-lab:history:v2";
const STATE_KEY = "prompt-lab:state:v2";

function loadHistory(): RunRecord[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    return raw ? (JSON.parse(raw) as RunRecord[]) : [];
  } catch {
    return [];
  }
}

function saveHistory(records: RunRecord[]) {
  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(records.slice(0, 100)));
  } catch {}
}

interface PerPromptState {
  prompt: string;
  variables: Record<string, string>;
}

type LabState = Record<PromptKey, PerPromptState>;

function initialState(): LabState {
  const state = {} as LabState;
  (Object.keys(PROMPTS) as PromptKey[]).forEach((k) => {
    const tpl = PROMPTS[k];
    const vars: Record<string, string> = {};
    tpl.variables.forEach((v) => {
      vars[v.key] = v.defaultValue ?? "";
    });
    // merge systemPrompt + userPrompt into one block
    state[k] = {
      prompt: tpl.systemPrompt + (tpl.userPrompt ? "\n\n---\n\n" + tpl.userPrompt : ""),
      variables: vars,
    };
  });
  return state;
}

export default function PromptLabPage() {
  const [activeKey, setActiveKey] = useState<PromptKey>("brandContext");
  const [state, setState] = useState<LabState>(() => initialState());
  const [history, setHistory] = useState<RunRecord[]>([]);
  const [running, setRunning] = useState(false);
  const [output, setOutput] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [lastMeta, setLastMeta] = useState<{ durationMs?: number; usage?: unknown } | null>(null);

  useEffect(() => {
    setHistory(loadHistory());
    try {
      const raw = localStorage.getItem(STATE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as LabState;
        setState((prev) => ({ ...prev, ...parsed }));
      }
    } catch {}
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(STATE_KEY, JSON.stringify(state));
    } catch {}
  }, [state]);

  const active = PROMPTS[activeKey];
  const current = state[activeKey];

  const renderedPrompt = useMemo(
    () => interpolate(current.prompt, current.variables),
    [current],
  );

  function updateVar(key: string, value: string) {
    setState((s) => ({
      ...s,
      [activeKey]: { ...s[activeKey], variables: { ...s[activeKey].variables, [key]: value } },
    }));
  }

  function updatePrompt(value: string) {
    setState((s) => ({ ...s, [activeKey]: { ...s[activeKey], prompt: value } }));
  }

  function resetToDefault() {
    if (!confirm("Reset this prompt and variables to defaults?")) return;
    const tpl = PROMPTS[activeKey];
    const vars: Record<string, string> = {};
    tpl.variables.forEach((v) => { vars[v.key] = v.defaultValue ?? ""; });
    setState((s) => ({
      ...s,
      [activeKey]: {
        prompt: tpl.systemPrompt + (tpl.userPrompt ? "\n\n---\n\n" + tpl.userPrompt : ""),
        variables: vars,
      },
    }));
  }

  async function run() {
    setRunning(true);
    setError("");
    setOutput("");
    setLastMeta(null);
    try {
      const resp = await fetch("/api/prompt-lab/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: current.prompt, variables: current.variables, promptKey: activeKey }),
      });
      const data = await resp.json();
      if (!resp.ok) { setError(data.error || "Request failed"); return; }
      setOutput(data.output || "");
      setLastMeta({ durationMs: data.durationMs, usage: data.usage });
      const record: RunRecord = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        promptKey: activeKey,
        timestamp: Date.now(),
        variables: { ...current.variables },
        prompt: current.prompt,
        output: data.output || "",
        durationMs: data.durationMs,
        usage: data.usage,
      };
      const next = [record, ...history].slice(0, 100);
      setHistory(next);
      saveHistory(next);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setRunning(false);
    }
  }

  function loadFromHistory(rec: RunRecord) {
    setActiveKey(rec.promptKey);
    setState((s) => ({
      ...s,
      [rec.promptKey]: { prompt: rec.prompt, variables: rec.variables },
    }));
    setOutput(rec.output);
    setError("");
  }

  function useOutputAsBrandContext() {
    (["comment", "post", "subreddits"] as PromptKey[]).forEach((k) => {
      setState((s) => ({
        ...s,
        [k]: { ...s[k], variables: { ...s[k].variables, brand_context: output } },
      }));
    });
    alert("Brand context piped into prompts 2, 3, 4.");
  }

  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900">
      <header className="border-b bg-white">
        <div className="mx-auto max-w-7xl px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold">Prompt Lab</h1>
            <p className="text-sm text-neutral-500">
              Edit the prompt, fill variables, run. Autosaves locally.
            </p>
          </div>
          <div className="text-xs text-neutral-500">claude-sonnet-4-6</div>
        </div>
        <div className="mx-auto max-w-7xl px-6 flex gap-1">
          {(Object.keys(PROMPTS) as PromptKey[]).map((k) => (
            <button
              key={k}
              onClick={() => { setActiveKey(k); setOutput(""); setError(""); setLastMeta(null); }}
              className={`px-3 py-2 text-sm border-b-2 -mb-px ${
                activeKey === k
                  ? "border-orange-500 text-orange-600 font-medium"
                  : "border-transparent text-neutral-600 hover:text-neutral-900"
              }`}
            >
              {PROMPTS[k].title}
            </button>
          ))}
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-6 grid grid-cols-12 gap-6">
        <section className="col-span-7 space-y-5">
          <div className="bg-white border rounded p-4 flex items-start justify-between">
            <div>
              <h2 className="font-semibold">{active.title}</h2>
              <p className="text-sm text-neutral-500 mt-1">{active.description}</p>
            </div>
            <button onClick={resetToDefault} className="text-xs text-neutral-400 hover:text-red-600 shrink-0 ml-4">
              Reset to default
            </button>
          </div>

          <Section title="Variables">
            {(activeKey === "comment" || activeKey === "post") && (
              <div className="mb-4 p-3 bg-orange-50 border border-orange-200 rounded">
                <label className="block text-xs font-medium text-neutral-700 mb-1">
                  Persona picker <span className="text-neutral-400 font-normal">(auto-fills persona_block)</span>
                </label>
                <select
                  className="w-full text-sm border rounded px-2 py-1.5 bg-white"
                  defaultValue=""
                  onChange={(e) => {
                    const id = parseInt(e.target.value);
                    if (!id) return;
                    const persona = PERSONAS.find((p) => p.id === id);
                    if (persona) updateVar("persona_block", formatPersonaBlock(persona));
                  }}
                >
                  <option value="">— pick a persona —</option>
                  {PERSONAS.map((p) => (
                    <option key={p.id} value={p.id}>#{p.id} — {p.name}</option>
                  ))}
                </select>
              </div>
            )}
            <div className="space-y-3">
              {active.variables.map((v) => (
                <div key={v.key}>
                  <label className="block text-xs font-medium text-neutral-700 mb-1">
                    {v.label} <span className="text-neutral-400 font-normal">{`{{${v.key}}}`}</span>
                  </label>
                  {v.type === "textarea" ? (
                    <textarea
                      value={current.variables[v.key] ?? ""}
                      onChange={(e) => updateVar(v.key, e.target.value)}
                      placeholder={v.placeholder}
                      rows={4}
                      className="w-full text-sm border rounded px-2 py-1.5 bg-white"
                    />
                  ) : (
                    <input
                      type={v.type === "number" ? "number" : "text"}
                      value={current.variables[v.key] ?? ""}
                      onChange={(e) => updateVar(v.key, e.target.value)}
                      placeholder={v.placeholder}
                      className="w-full text-sm border rounded px-2 py-1.5 bg-white"
                    />
                  )}
                </div>
              ))}
            </div>
          </Section>

          <Section title="Prompt (editable — supports {{variables}})">
            <textarea
              value={current.prompt}
              onChange={(e) => updatePrompt(e.target.value)}
              rows={20}
              className="w-full text-xs font-mono border rounded px-2 py-1.5 bg-white"
            />
          </Section>

          <div className="flex items-center gap-3">
            <button
              onClick={run}
              disabled={running}
              className="px-4 py-2 rounded bg-orange-500 text-white text-sm font-medium hover:bg-orange-600 disabled:opacity-50"
            >
              {running ? "Running…" : "Run prompt"}
            </button>
            {activeKey === "subreddits" && (
              <span className="text-xs text-blue-600 border border-blue-200 bg-blue-50 rounded px-2 py-0.5">
                web search enabled
              </span>
            )}
            {lastMeta?.durationMs !== undefined && (
              <span className="text-xs text-neutral-500">
                {lastMeta.durationMs} ms
                {lastMeta.usage ? ` · ${JSON.stringify(lastMeta.usage)}` : ""}
              </span>
            )}
          </div>
        </section>

        <aside className="col-span-5 space-y-5">
          <Section title="Output">
            {error && (
              <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded p-2 mb-2 whitespace-pre-wrap">
                {error}
              </div>
            )}
            <div className="bg-white border rounded p-3 text-sm whitespace-pre-wrap min-h-[200px]">
              {output || <span className="text-neutral-400">Run the prompt to see output here.</span>}
            </div>
            {output && (
              <div className="flex gap-2 mt-2">
                <button
                  onClick={() => navigator.clipboard.writeText(output).catch(() => {})}
                  className="px-3 py-1 text-xs border rounded hover:bg-neutral-100"
                >
                  Copy
                </button>
                {activeKey === "brandContext" && (
                  <button
                    onClick={useOutputAsBrandContext}
                    className="px-3 py-1 text-xs border rounded hover:bg-neutral-100"
                  >
                    Use as brand_context in prompts 2/3/4
                  </button>
                )}
              </div>
            )}
          </Section>

          <Section title={`Rendered preview (${renderedPrompt.length} chars)`}>
            <details className="text-xs">
              <summary className="cursor-pointer text-neutral-600">Show what gets sent to Claude</summary>
              <pre className="mt-2 whitespace-pre-wrap bg-white border rounded p-2 max-h-80 overflow-auto text-xs">
                {renderedPrompt}
              </pre>
            </details>
          </Section>

          <Section title={`History (${history.length})`}>
            {history.length === 0 ? (
              <p className="text-xs text-neutral-400">No runs yet.</p>
            ) : (
              <ul className="space-y-1 max-h-80 overflow-auto">
                {history.map((r) => (
                  <li key={r.id}>
                    <button
                      onClick={() => loadFromHistory(r)}
                      className="w-full text-left text-xs px-2 py-1 rounded hover:bg-neutral-100 border"
                    >
                      <span className="font-medium">{PROMPTS[r.promptKey].title.replace(/^\d+\.\s*/, "")}</span>
                      <span className="text-neutral-500"> · {new Date(r.timestamp).toLocaleTimeString()}</span>
                      <div className="text-neutral-500 line-clamp-1">{r.output.slice(0, 80)}</div>
                    </button>
                  </li>
                ))}
              </ul>
            )}
            {history.length > 0 && (
              <button
                onClick={() => { if (!confirm("Clear all history?")) return; setHistory([]); saveHistory([]); }}
                className="mt-2 text-xs text-red-600 hover:underline"
              >
                Clear history
              </button>
            )}
          </Section>
        </aside>
      </main>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="text-xs font-semibold uppercase tracking-wide text-neutral-500 mb-2">{title}</h3>
      {children}
    </div>
  );
}

function interpolate(template: string, vars: Record<string, string>): string {
  return template.replace(/\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g, (_, key) => vars[key] ?? `{{${key}}}`);
}
