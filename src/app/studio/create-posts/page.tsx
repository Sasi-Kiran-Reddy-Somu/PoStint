"use client";
import { useState } from "react";
import Sidebar, { ORANGE, BORDER } from "@/components/studio/Sidebar";

const BG = "#0a0f1a";
const SURFACE = "#111827";
const SURFACE2 = "#162032";
const TEXT = "#e2e8f0";
const MUTED = "#64748b";
const MUTED2 = "#94a3b8";

const KEYWORDS = ["leather phone case", "iPhone case", "premium cases", "durable phone cases"];

const SUBREDDITS = [
  { name: "r/iPhone", score: 94, comments: "Avg 52 comments", wau: "18.2k WAU" },
  { name: "r/Apple", score: 91, comments: "Avg 47 comments", wau: "14.8k WAU" },
  { name: "r/BuyItForLife", score: 88, comments: "Avg 38 comments", wau: "9.4k WAU" },
  { name: "r/minimalism", score: 85, comments: "Avg 29 comments", wau: "7.1k WAU" },
  { name: "r/malelifestyle", score: 82, comments: "Avg 31 comments", wau: "5.6k WAU" },
  { name: "r/frugal", score: 79, comments: "Avg 45 comments", wau: "12.4k WAU" },
  { name: "r/personalfinance", score: 77, comments: "Avg 61 comments", wau: "22.7k WAU" },
  { name: "r/iphone17Pro", score: 74, comments: "Avg 22 comments", wau: "3.8k WAU" },
  { name: "r/technology", score: 71, comments: "Avg 34 comments", wau: "8.9k WAU" },
  { name: "r/gadgets", score: 68, comments: "Avg 28 comments", wau: "6.2k WAU" },
];

const MOCK_GENERATED: Record<string, { title: string; body: string }> = {
  "r/iPhone": {
    title: "What leather phone cases are you using for your iPhone 15? Looking for recommendations",
    body: "Been looking for a quality leather case that won't break down after a few months. Magnetic ring compatibility is a must. What are you all using? Any hidden gems under $60?",
  },
  "r/Apple": {
    title: "Looking for premium leather case recommendations — what's your daily carry?",
    body: "I've tried a few different leather cases but most either lose their shape or the stitching comes apart within 6 months. Looking for something that actually ages well and works with MagSafe. Budget is flexible for the right product.",
  },
  "r/BuyItForLife": {
    title: "Can a leather phone case genuinely be BIFL? Share your long-term experiences",
    body: "I know most phone cases are disposable by nature since we upgrade phones, but I'm wondering if anyone has found leather cases that survive multiple phone swaps or at least develop a great patina over 2-3 years.",
  },
};

function ScoreBadge({ score }: { score: number }) {
  const bg = score >= 80 ? "#14532d" : score >= 60 ? "#713f12" : "#7f1d1d";
  const color = score >= 80 ? "#4ade80" : score >= 60 ? "#fbbf24" : "#f87171";
  return <span style={{ background: bg, color, padding: "2px 7px", borderRadius: 4, fontSize: 11, fontWeight: 700 }}>{score}</span>;
}

export default function CreatePostsPage() {
  const [topic, setTopic] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [customSub, setCustomSub] = useState("");
  const [extraSubs, setExtraSubs] = useState<string[]>([]);
  const [generated, setGenerated] = useState<Record<string, { title: string; body: string }>>({});
  const [activeTab, setActiveTab] = useState("");
  const [prompts, setPrompts] = useState<Record<string, string>>({});
  const [showModal, setShowModal] = useState(false);
  const [tier, setTier] = useState("tier2");
  const [scheduleDate, setScheduleDate] = useState("");

  const allSubs = [...SUBREDDITS, ...extraSubs.map(n => ({ name: n, score: 65, comments: "Avg 20 comments", wau: "—" }))];

  const toggle = (name: string) => {
    const next = new Set(selected);
    if (next.has(name)) { next.delete(name); if (activeTab === name) setActiveTab([...next][0] ?? ""); }
    else { next.add(name); if (!activeTab) setActiveTab(name); }
    setSelected(next);
  };

  const addCustom = () => {
    if (!customSub.trim()) return;
    const name = customSub.startsWith("r/") ? customSub.trim() : `r/${customSub.trim()}`;
    if (!extraSubs.includes(name)) setExtraSubs([...extraSubs, name]);
    setCustomSub("");
  };

  const generate = () => {
    const result: Record<string, { title: string; body: string }> = {};
    selected.forEach(sub => {
      result[sub] = MOCK_GENERATED[sub] ?? {
        title: `Discussion: ${topic || "quality phone cases"} — what's working for r/${sub.replace("r/", "")} users?`,
        body: `I've been researching ${topic || "phone cases"} extensively and wanted to get this community's take. What brands or styles have you found actually hold up? Looking for genuine recommendations from people who've tested them long-term.`,
      };
    });
    setGenerated(result);
    if (!activeTab && selected.size > 0) setActiveTab([...selected][0]);
  };

  const canGenerate = topic.trim().length > 0 && selected.size > 0;
  const hasGenerated = Object.keys(generated).length > 0;
  const creditCost = selected.size * 12;

  return (
    <div style={{ display: "flex", minHeight: "100vh", fontFamily: "'Inter', system-ui, sans-serif", background: BG, color: TEXT }}>
      <Sidebar activeNav="Create Posts" />

      <div style={{ flex: 1, overflowY: "auto", padding: "36px 0" }}>
        <div style={{ maxWidth: 900, margin: "0 auto", padding: "0 32px" }}>
          <h1 style={{ margin: "0 0 6px", fontSize: 22, fontWeight: 700, color: "#fff" }}>Create Posts</h1>
          <p style={{ margin: "0 0 28px", fontSize: 13, color: MUTED }}>Generate Reddit-native posts and comments for your selected subreddits.</p>

          {/* Section 1 */}
          <div style={{ background: "#1e2a3b", border: `1px solid ${BORDER}`, borderRadius: 12, padding: "28px 32px", marginBottom: 20 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: TEXT, marginBottom: 16, textTransform: "uppercase", letterSpacing: "0.06em" }}>Topic & Subreddit Selection</div>

            {/* Topic input */}
            <div style={{ marginBottom: 14 }}>
              <label style={{ fontSize: 12, color: MUTED2, display: "block", marginBottom: 6, fontWeight: 600 }}>Topic</label>
              <input
                value={topic}
                onChange={e => setTopic(e.target.value)}
                placeholder="What do you want to post about?"
                style={{ width: "100%", background: SURFACE2, border: `1px solid ${BORDER}`, color: TEXT, padding: "10px 14px", borderRadius: 8, fontSize: 13, outline: "none", boxSizing: "border-box" }}
              />
            </div>

            {/* Keyword chips */}
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 24 }}>
              {KEYWORDS.map(kw => (
                <button
                  key={kw}
                  onClick={() => setTopic(kw)}
                  style={{ background: topic === kw ? "rgba(232,93,47,0.2)" : SURFACE2, border: `1px solid ${topic === kw ? ORANGE : BORDER}`, color: topic === kw ? ORANGE : MUTED2, padding: "5px 12px", borderRadius: 99, fontSize: 12, fontWeight: 600, cursor: "pointer" }}
                >
                  {kw}
                </button>
              ))}
            </div>

            {/* Subreddit grid */}
            <label style={{ fontSize: 12, color: MUTED2, display: "block", marginBottom: 10, fontWeight: 600 }}>Select Subreddits</label>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 14 }}>
              {allSubs.map(sub => {
                const isSelected = selected.has(sub.name);
                return (
                  <div
                    key={sub.name}
                    onClick={() => toggle(sub.name)}
                    style={{
                      background: isSelected ? "rgba(232,93,47,0.08)" : SURFACE,
                      border: `1px solid ${isSelected ? ORANGE : BORDER}`,
                      borderRadius: 8, padding: "12px 14px", cursor: "pointer",
                      display: "flex", alignItems: "flex-start", gap: 10, transition: "all 0.15s",
                    }}
                  >
                    <div style={{ marginTop: 1, width: 16, height: 16, borderRadius: 4, border: `2px solid ${isSelected ? ORANGE : "#334155"}`, background: isSelected ? ORANGE : "transparent", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                      {isSelected && <span style={{ color: "#fff", fontSize: 10, fontWeight: 900 }}>✓</span>}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
                        <span style={{ fontSize: 13, fontWeight: 600, color: isSelected ? "#fff" : TEXT }}>{sub.name}</span>
                        <ScoreBadge score={sub.score} />
                      </div>
                      <div style={{ fontSize: 11, color: MUTED }}>{sub.comments} · {sub.wau}</div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Custom subreddit */}
            <div style={{ display: "flex", gap: 8 }}>
              <input
                value={customSub}
                onChange={e => setCustomSub(e.target.value)}
                onKeyDown={e => e.key === "Enter" && addCustom()}
                placeholder="Add custom subreddit (e.g. r/ipadOS)"
                style={{ flex: 1, background: SURFACE2, border: `1px solid ${BORDER}`, color: TEXT, padding: "8px 12px", borderRadius: 8, fontSize: 13, outline: "none" }}
              />
              <button onClick={addCustom} style={{ background: SURFACE2, border: `1px solid ${BORDER}`, color: MUTED2, padding: "8px 16px", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer" }}>+ Add</button>
            </div>
          </div>

          {/* Section 2 */}
          {(topic.trim() || selected.size > 0) && (
            <div style={{ background: "#1e2a3b", border: `1px solid ${BORDER}`, borderRadius: 12, padding: "28px 32px", marginBottom: 20 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: TEXT, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 2 }}>Post Generation</div>
                  <div style={{ fontSize: 12, color: MUTED }}>{selected.size} subreddit{selected.size !== 1 ? "s" : ""} selected</div>
                </div>
                <button
                  onClick={generate}
                  disabled={!canGenerate}
                  style={{ background: canGenerate ? ORANGE : "#4a2a1a", color: canGenerate ? "#fff" : "#7a4a3a", border: "none", padding: "10px 22px", borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: canGenerate ? "pointer" : "not-allowed" }}
                >
                  Generate Posts
                </button>
              </div>

              {selected.size === 0 ? (
                <div style={{ background: SURFACE, border: `1px dashed ${BORDER}`, borderRadius: 8, padding: "28px", textAlign: "center", color: MUTED, fontSize: 13 }}>
                  Select at least one subreddit above to generate posts.
                </div>
              ) : (
                <>
                  {/* Tabs */}
                  <div style={{ display: "flex", gap: 0, borderBottom: `1px solid ${BORDER}`, marginBottom: 20, overflowX: "auto" }}>
                    {[...selected].map(sub => (
                      <button
                        key={sub}
                        onClick={() => setActiveTab(sub)}
                        style={{
                          padding: "9px 16px", background: "transparent", border: "none", borderBottom: `2px solid ${activeTab === sub ? ORANGE : "transparent"}`,
                          color: activeTab === sub ? "#fff" : MUTED, fontSize: 13, fontWeight: activeTab === sub ? 600 : 400, cursor: "pointer", whiteSpace: "nowrap",
                        }}
                      >{sub}</button>
                    ))}
                  </div>

                  {/* Active tab content */}
                  {activeTab && (
                    <div>
                      <div style={{ marginBottom: 14 }}>
                        <label style={{ fontSize: 12, color: MUTED2, display: "block", marginBottom: 6, fontWeight: 600 }}>Post Title</label>
                        <input
                          readOnly
                          value={generated[activeTab]?.title ?? ""}
                          placeholder="Click Generate Posts to create content for this subreddit"
                          style={{ width: "100%", background: hasGenerated && generated[activeTab] ? SURFACE : "#0a0f1a", border: `1px solid ${BORDER}`, color: generated[activeTab] ? TEXT : MUTED, padding: "10px 14px", borderRadius: 8, fontSize: 13, outline: "none", boxSizing: "border-box" }}
                        />
                      </div>
                      <div style={{ marginBottom: 14 }}>
                        <label style={{ fontSize: 12, color: MUTED2, display: "block", marginBottom: 6, fontWeight: 600 }}>Post Body</label>
                        <textarea
                          readOnly
                          value={generated[activeTab]?.body ?? ""}
                          placeholder="Click Generate Posts to create content for this subreddit"
                          rows={5}
                          style={{ width: "100%", background: hasGenerated && generated[activeTab] ? SURFACE : "#0a0f1a", border: `1px solid ${BORDER}`, color: generated[activeTab] ? TEXT : MUTED, padding: "10px 14px", borderRadius: 8, fontSize: 13, outline: "none", resize: "vertical", lineHeight: 1.6, boxSizing: "border-box" }}
                        />
                      </div>
                      <div style={{ display: "flex", gap: 8 }}>
                        <input
                          value={prompts[activeTab] ?? ""}
                          onChange={e => setPrompts({ ...prompts, [activeTab]: e.target.value })}
                          placeholder="Add instructions to refine this post..."
                          style={{ flex: 1, background: SURFACE2, border: `1px solid ${BORDER}`, color: TEXT, padding: "8px 12px", borderRadius: 8, fontSize: 12, outline: "none" }}
                        />
                        <button
                          onClick={() => {
                            const mock = MOCK_GENERATED[activeTab];
                            setGenerated(prev => ({ ...prev, [activeTab]: mock ?? { title: `Refined: ${topic}`, body: "Regenerated content based on your instructions." } }));
                          }}
                          style={{ background: SURFACE2, border: `1px solid ${BORDER}`, color: MUTED2, padding: "8px 16px", borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: "pointer" }}
                        >
                          Regenerate
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* Create tasks button */}
              {selected.size > 0 && (
                <div style={{ marginTop: 24, paddingTop: 20, borderTop: `1px solid ${BORDER}` }}>
                  <button
                    onClick={() => setShowModal(true)}
                    disabled={!hasGenerated}
                    style={{
                      width: "100%", background: hasGenerated ? "#162032" : "#0d1520",
                      border: `1px solid ${hasGenerated ? ORANGE : BORDER}`,
                      color: hasGenerated ? ORANGE : MUTED, padding: "12px", borderRadius: 8,
                      fontSize: 14, fontWeight: 700, cursor: hasGenerated ? "pointer" : "not-allowed",
                      display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
                    }}
                  >
                    <span>Create {selected.size} Task{selected.size !== 1 ? "s" : ""}</span>
                    <span style={{ background: hasGenerated ? ORANGE : "#334155", color: "#fff", padding: "3px 10px", borderRadius: 4, fontSize: 12, fontWeight: 700 }}>
                      {creditCost} Credits
                    </span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Task modal */}
      {showModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
          <div style={{ background: "#1e2a3b", border: `1px solid ${BORDER}`, borderRadius: 12, padding: 28, width: 420, boxShadow: "0 25px 50px rgba(0,0,0,0.5)" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
              <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: "#fff" }}>Create {selected.size} Task{selected.size !== 1 ? "s" : ""}</h3>
              <button onClick={() => setShowModal(false)} style={{ background: "none", border: "none", color: MUTED, fontSize: 20, cursor: "pointer" }}>×</button>
            </div>
            <div style={{ fontSize: 12, color: MUTED, marginBottom: 12, textTransform: "uppercase", letterSpacing: 1, fontWeight: 700 }}>Worker Tier</div>
            {[
              { value: "tier1", label: "Tier 1 — Highest Credibility", desc: "500+ karma, 2yr+ account, verified", credits: "10 Credits" },
              { value: "tier2", label: "Tier 2 — High Credibility", desc: "200+ karma, 1yr+ account", credits: "7.5 Credits" },
              { value: "tier3", label: "Tier 3 — Standard Credibility", desc: "50+ karma, 6mo+ account", credits: "5 Credits" },
            ].map(t => (
              <div key={t.value} onClick={() => setTier(t.value)} style={{ border: `1px solid ${tier === t.value ? ORANGE : BORDER}`, background: tier === t.value ? "rgba(232,93,47,0.1)" : "#162032", borderRadius: 8, padding: "12px 14px", cursor: "pointer", marginBottom: 8, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: tier === t.value ? "#fff" : MUTED2 }}>{t.label}</div>
                  <div style={{ fontSize: 11, color: MUTED, marginTop: 2 }}>{t.desc}</div>
                </div>
                <span style={{ background: tier === t.value ? ORANGE : "#1e3a5f", color: tier === t.value ? "#fff" : "#60a5fa", padding: "3px 8px", borderRadius: 4, fontSize: 11, fontWeight: 700, marginLeft: 10, flexShrink: 0 }}>{t.credits}</span>
              </div>
            ))}
            <div style={{ marginTop: 18, marginBottom: 18 }}>
              <label style={{ fontSize: 12, color: MUTED, display: "block", marginBottom: 6, textTransform: "uppercase", letterSpacing: 1, fontWeight: 700 }}>Schedule</label>
              <input type="datetime-local" value={scheduleDate} onChange={e => setScheduleDate(e.target.value)} style={{ width: "100%", background: "#162032", border: `1px solid ${BORDER}`, color: TEXT, padding: "9px 12px", borderRadius: 8, fontSize: 13, outline: "none", boxSizing: "border-box" }} />
            </div>
            <div style={{ background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 8, padding: "12px 14px", marginBottom: 18 }}>
              <div style={{ fontSize: 12, color: MUTED, marginBottom: 6 }}>Tasks being created:</div>
              {[...selected].map(sub => (
                <div key={sub} style={{ fontSize: 13, color: MUTED2, padding: "2px 0" }}>— {sub}</div>
              ))}
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={() => setShowModal(false)} style={{ flex: 1, background: "transparent", border: `1px solid ${BORDER}`, color: MUTED2, padding: "10px", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer" }}>Cancel</button>
              <button onClick={() => setShowModal(false)} style={{ flex: 2, background: ORANGE, color: "#fff", border: "none", padding: "10px", borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: "pointer" }}>Confirm {selected.size} Tasks</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
