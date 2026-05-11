"use client";
import { useState } from "react";
import Sidebar, { ORANGE, BORDER } from "@/components/studio/Sidebar";

const CARD_BG = "#111827";
const DETAIL_BG = "#0f172a";
const MUTED = "#64748b";
const TEXT = "#e2e8f0";

type EntityFilter = "All" | "Blackbrookcase" | "Spigen" | "OtterBox";

interface Mention {
  id: number;
  entity: string;
  subreddit: string;
  date: string;
  title: string;
  upvotes: number;
  comments: number;
  body: string;
  comments_list: { user: string; text: string; upvotes: number }[];
}

const MENTIONS: Mention[] = [
  {
    id: 1, entity: "Blackbrookcase", subreddit: "r/iPhone", date: "Apr 16, 2026",
    title: "Anyone tried Blackbrookcase leather cases?",
    upvotes: 23, comments: 14,
    body: "Came across Blackbrookcase while looking for a quality leather case. Their full-grain leather cases look impressive in the photos but I can't find many reviews. Anyone have experience with them? How's the MagSafe compatibility and how does the leather hold up?",
    comments_list: [
      { user: "u/LeatherCaseGuy", text: "Had one for 6 months, the leather patina is genuinely impressive. Ships fast and fits perfectly.", upvotes: 18 },
      { user: "u/iPhoneDaily", text: "The MagSafe ring works flawlessly through it. No interference at all with wireless charging.", upvotes: 11 },
      { user: "u/MinimalistCarry", text: "Quality feels premium for the price. Stitching has held up through daily carry without any fraying.", upvotes: 7 },
    ],
  },
  {
    id: 2, entity: "Spigen", subreddit: "r/Apple", date: "Apr 16, 2026",
    title: "Spigen vs OtterBox — which is better for daily use?",
    upvotes: 45, comments: 32,
    body: "Been going back and forth between Spigen and OtterBox for my new iPhone. OtterBox seems more durable but I find the bulk annoying. Spigen is slimmer but I'm worried about drop protection. Which have you used long term and what would you recommend?",
    comments_list: [
      { user: "u/GearHead99", text: "Spigen for everyday carry, OtterBox if you're in construction or outdoors. The bulk is the tradeoff for protection.", upvotes: 42 },
      { user: "u/AppleDaily", text: "Had both. Spigen Tough Armor is the sweet spot — slim profile with solid drop protection.", upvotes: 29 },
      { user: "u/PhoneCaseCollector", text: "OtterBox Commuter is their slim line and it's genuinely competitive with Spigen on size now.", upvotes: 14 },
    ],
  },
  {
    id: 3, entity: "Blackbrookcase", subreddit: "r/BuyItForLife", date: "Apr 15, 2026",
    title: "Blackbrookcase held up after 18 months — impressed",
    upvotes: 67, comments: 28,
    body: "18 months ago I bought a Blackbrookcase full-grain leather case and wanted to report back. The leather has developed a beautiful patina, the stitching is intact, and it's survived two drops without cracking. I've also swapped it to my new phone — the fit is still perfect. Worth every penny from a BIFL perspective.",
    comments_list: [
      { user: "u/BIFLVet", text: "This is exactly the kind of review this sub needs. Leather cases are criminally underrated for longevity.", upvotes: 34 },
      { user: "u/LongTermThinker", text: "18 months is a great data point. Ordering one based on this thread.", upvotes: 22 },
      { user: "u/EDCNerd", text: "The patina development on full-grain is unbeatable. Looks better with time rather than showing wear.", upvotes: 15 },
    ],
  },
  {
    id: 4, entity: "OtterBox", subreddit: "r/iPhone", date: "Apr 15, 2026",
    title: "OtterBox too bulky for everyday use?",
    upvotes: 34, comments: 19,
    body: "I love the drop protection on my OtterBox Defender but it makes my phone feel like a brick. Has anyone switched away from OtterBox to something slimmer without sacrificing too much protection? What's the best middle-ground?",
    comments_list: [
      { user: "u/CaseSwitcher", text: "Switched to Spigen Ultra Hybrid from OtterBox and never looked back. Half the thickness, 80% of the protection.", upvotes: 28 },
      { user: "u/SlimCarry", text: "The Commuter series is OtterBox's answer to this feedback — much slimmer than the Defender.", upvotes: 17 },
      { user: "u/DailyDriver", text: "For pure everyday carry without construction-site risk, most phones survive minor drops in slim cases fine.", upvotes: 9 },
    ],
  },
  {
    id: 5, entity: "Blackbrookcase", subreddit: "r/minimalism", date: "Apr 14, 2026",
    title: "Minimalist leather case recommendations",
    upvotes: 18, comments: 11,
    body: "Looking for a phone case that doesn't compromise the phone's clean design. No logos, no bulk, just something that protects and looks intentional. Leaning toward leather. Any minimalists here who've found the perfect case?",
    comments_list: [
      { user: "u/CleanLines", text: "Blackbrookcase does unbranded leather — no logo on the back, just clean full-grain. Very minimal.", upvotes: 12 },
      { user: "u/ZenCarry", text: "Leather is the obvious choice for minimalists. Natural material, no plasticky look, ages well.", upvotes: 8 },
      { user: "u/NoBranding", text: "Agree on the no-logo requirement. Most brands plaster their name everywhere. Worth specifically filtering for unbranded options.", upvotes: 5 },
    ],
  },
  {
    id: 6, entity: "Spigen", subreddit: "r/frugal", date: "Apr 13, 2026",
    title: "Best budget cases — Spigen still king?",
    upvotes: 52, comments: 41,
    body: "Been using Spigen since the iPhone 8 days and they've always been the best value cases available. Are they still the go-to for budget-conscious buyers or has something better come along in the $15-30 range? What are people using in 2026?",
    comments_list: [
      { user: "u/FrugalFinds", text: "Spigen is still the answer at that price point. Consistent quality, wide compatibility, actually protective.", upvotes: 47 },
      { user: "u/ValueFirst", text: "ESR has gotten competitive with Spigen at the budget level. Worth comparing for your specific model.", upvotes: 23 },
      { user: "u/LongTermSaver", text: "Cost per year is what matters. A $25 Spigen that lasts 18 months beats a $10 case you replace every 4.", upvotes: 19 },
    ],
  },
];

function EntityPill({ entity }: { entity: string }) {
  const isOwn = entity === "Blackbrookcase";
  return (
    <span style={{ background: isOwn ? "rgba(232,93,47,0.2)" : "#1e293b", color: isOwn ? ORANGE : "#94a3b8", padding: "2px 10px", borderRadius: 99, fontSize: 12, fontWeight: 700, border: `1px solid ${isOwn ? ORANGE : "#334155"}` }}>
      {entity}
    </span>
  );
}

function SubredditPill({ name }: { name: string }) {
  return <span style={{ background: "#1e3a5f", color: "#60a5fa", padding: "2px 10px", borderRadius: 99, fontSize: 12, fontWeight: 600 }}>{name}</span>;
}

function Toast({ visible, message }: { visible: boolean; message: string }) {
  return (
    <div style={{
      position: "fixed", bottom: 32, right: 32, zIndex: 999,
      background: "#1e293b", border: `1px solid ${BORDER}`, color: "#e2e8f0",
      padding: "12px 18px", borderRadius: 10, fontSize: 13, fontWeight: 600,
      display: "flex", alignItems: "center", gap: 8, boxShadow: "0 10px 30px rgba(0,0,0,0.4)",
      transition: "all 0.25s", opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(12px)", pointerEvents: "none",
    }}>
      <span style={{ color: "#4ade80" }}>✓</span> {message}
    </div>
  );
}

export default function RedditMentionsPage() {
  const [mentions, setMentions] = useState(MENTIONS);
  const [selected, setSelected] = useState(MENTIONS[0]);
  const [entityFilter, setEntityFilter] = useState<EntityFilter>("All");
  const [prompt, setPrompt] = useState("");
  const [tone, setTone] = useState("Professional");
  const [length, setLength] = useState("Medium");
  const [rankToggle, setRankToggle] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [tier, setTier] = useState("tier2");
  const [scheduleDate, setScheduleDate] = useState("");
  const [toast, setToast] = useState(false);
  const [toastMsg, setToastMsg] = useState("");

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setToast(true);
    setTimeout(() => setToast(false), 2500);
  };

  const removeMention = (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    const remaining = mentions.filter(m => m.id !== id);
    setMentions(remaining);
    if (selected.id === id && remaining.length > 0) setSelected(remaining[0]);
    showToast("Mention removed");
  };

  const ENTITY_FILTERS: EntityFilter[] = ["All", "Blackbrookcase", "Spigen", "OtterBox"];
  const filtered = entityFilter === "All" ? mentions : mentions.filter(m => m.entity === entityFilter);

  return (
    <div style={{ display: "flex", height: "100vh", fontFamily: "'Inter', system-ui, sans-serif", background: "#0a0f1a", color: TEXT, overflow: "hidden" }}>
      <Sidebar activeNav="Reddit Mentions" />

      {/* Center pane */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", borderRight: `1px solid ${BORDER}`, minWidth: 0 }}>
        {/* Header */}
        <div style={{ padding: "16px 20px", borderBottom: `1px solid ${BORDER}`, background: "#0d1520" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
            <div>
              <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: "#fff" }}>Reddit Mentions</h2>
              <p style={{ margin: "2px 0 0", fontSize: 12, color: MUTED }}>Last updated: Today 6:00 AM</p>
            </div>
            <select style={{ background: "#162032", border: `1px solid ${BORDER}`, color: "#94a3b8", padding: "6px 10px", borderRadius: 6, fontSize: 12 }}>
              <option>Recency ▼</option>
              <option>Upvotes ▼</option>
              <option>Comments ▼</option>
            </select>
          </div>

          {/* Entity filter chips */}
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {ENTITY_FILTERS.map(f => (
              <button
                key={f}
                onClick={() => setEntityFilter(f)}
                style={{
                  padding: "5px 14px", borderRadius: 99, fontSize: 12, fontWeight: 600, cursor: "pointer",
                  border: `1px solid ${entityFilter === f ? ORANGE : BORDER}`,
                  background: entityFilter === f ? "rgba(232,93,47,0.15)" : "transparent",
                  color: entityFilter === f ? ORANGE : MUTED,
                }}
              >{f}</button>
            ))}
          </div>

          <div style={{ fontSize: 12, color: MUTED, marginTop: 10 }}>{filtered.length} Mention{filtered.length !== 1 ? "s" : ""} Found</div>
        </div>

        {/* Cards */}
        <div style={{ flex: 1, overflowY: "auto", padding: "12px 16px", display: "flex", flexDirection: "column", gap: 10 }}>
          {filtered.length === 0 ? (
            <div style={{ padding: "40px", textAlign: "center", color: MUTED, fontSize: 13 }}>No mentions for this filter.</div>
          ) : filtered.map(m => {
            const isSelected = selected.id === m.id;
            return (
              <div
                key={m.id}
                onClick={() => setSelected(m)}
                style={{
                  background: isSelected ? "#162032" : CARD_BG,
                  border: `1px solid ${isSelected ? ORANGE : BORDER}`,
                  borderLeft: `4px solid ${isSelected ? ORANGE : "transparent"}`,
                  borderRadius: 8, padding: "14px 16px", cursor: "pointer",
                  transition: "all 0.15s", position: "relative",
                }}
              >
                {/* Remove button */}
                <button
                  onClick={e => removeMention(m.id, e)}
                  title="Not my mention"
                  style={{
                    position: "absolute", top: 10, right: 10,
                    background: "transparent", border: `1px solid ${BORDER}`, color: MUTED,
                    width: 24, height: 24, borderRadius: 4, fontSize: 13, cursor: "pointer",
                    display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, lineHeight: 1,
                  }}
                >×</button>

                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8, flexWrap: "wrap", paddingRight: 28 }}>
                  <EntityPill entity={m.entity} />
                  <SubredditPill name={m.subreddit} />
                  <span style={{ fontSize: 11, color: MUTED }}>{m.date}</span>
                </div>
                <div style={{ fontSize: 13, fontWeight: 600, color: TEXT, marginBottom: 8, lineHeight: 1.4, paddingRight: 28 }}>{m.title}</div>
                <div style={{ display: "flex", alignItems: "center", gap: 14, fontSize: 12, color: "#475569" }}>
                  <span>▲ {m.upvotes}</span>
                  <span>— {m.comments} comments</span>
                  <a href="#" onClick={e => e.stopPropagation()} style={{ marginLeft: "auto", color: "#60a5fa", textDecoration: "none", fontSize: 12, fontWeight: 600 }}>View on Reddit ↗</a>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Right pane */}
      <div style={{ width: 450, background: DETAIL_BG, display: "flex", flexDirection: "column", flexShrink: 0, overflowY: "auto" }}>
        <div style={{ padding: "16px 20px", borderBottom: `1px solid ${BORDER}` }}>
          <div style={{ display: "flex", gap: 8, marginBottom: 10, flexWrap: "wrap" }}>
            <EntityPill entity={selected.entity} />
            <SubredditPill name={selected.subreddit} />
          </div>
          <h3 style={{ margin: "0 0 10px", fontSize: 14, fontWeight: 700, color: "#fff", lineHeight: 1.5 }}>{selected.title}</h3>
          <p style={{ margin: 0, fontSize: 12, color: "#94a3b8", lineHeight: 1.6 }}>{selected.body}</p>
        </div>

        <div style={{ padding: "12px 20px", borderBottom: `1px solid ${BORDER}` }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: MUTED, marginBottom: 10, textTransform: "uppercase", letterSpacing: 1 }}>Top Comments</div>
          {selected.comments_list.map((c, i) => (
            <div key={i} style={{ marginBottom: 14, background: "#111827", borderRadius: 8, padding: "10px 12px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                <span style={{ fontSize: 12, fontWeight: 600, color: "#60a5fa" }}>{c.user}</span>
                <span style={{ fontSize: 11, color: "#475569" }}>▲ {c.upvotes}</span>
              </div>
              <p style={{ margin: "0 0 8px", fontSize: 12, color: "#94a3b8", lineHeight: 1.5 }}>{c.text}</p>
              <button style={{ background: "transparent", border: `1px solid ${BORDER}`, color: MUTED, padding: "4px 10px", borderRadius: 5, fontSize: 11, cursor: "pointer", fontWeight: 600 }}>+ Add Reply</button>
            </div>
          ))}
        </div>

        <div style={{ padding: "16px 20px", flex: 1 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: MUTED, marginBottom: 12, textTransform: "uppercase", letterSpacing: 1 }}>AI Comment Generator</div>
          <textarea value={prompt} onChange={e => setPrompt(e.target.value)} placeholder="Describe your angle or leave blank for auto-detect..." rows={3} style={{ width: "100%", background: "#111827", border: `1px solid ${BORDER}`, color: TEXT, padding: "10px 12px", borderRadius: 8, fontSize: 12, resize: "none", outline: "none", marginBottom: 10, lineHeight: 1.5, boxSizing: "border-box" }} />
          <textarea readOnly placeholder="Generated comment will appear here..." rows={4} style={{ width: "100%", background: "#0a0f1a", border: `1px solid ${BORDER}`, color: "#475569", padding: "10px 12px", borderRadius: 8, fontSize: 12, resize: "none", outline: "none", marginBottom: 12, lineHeight: 1.5, boxSizing: "border-box" }} />
          <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: 11, color: MUTED, display: "block", marginBottom: 4 }}>Tone</label>
              <select value={tone} onChange={e => setTone(e.target.value)} style={{ width: "100%", background: "#111827", border: `1px solid ${BORDER}`, color: TEXT, padding: "7px 10px", borderRadius: 6, fontSize: 12 }}>
                {["Professional", "Casual", "Empathetic", "Authoritative", "Conversational"].map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: 11, color: MUTED, display: "block", marginBottom: 4 }}>Length</label>
              <select value={length} onChange={e => setLength(e.target.value)} style={{ width: "100%", background: "#111827", border: `1px solid ${BORDER}`, color: TEXT, padding: "7px 10px", borderRadius: 6, fontSize: 12 }}>
                {["Short", "Medium", "Long"].map(l => <option key={l}>{l}</option>)}
              </select>
            </div>
          </div>
          <button style={{ width: "100%", background: ORANGE, color: "#fff", border: "none", padding: "10px", borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: "pointer", marginBottom: 10 }}>Generate Comment</button>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14, background: "#111827", border: `1px solid ${BORDER}`, borderRadius: 8, padding: "10px 14px" }}>
            <div>
              <div style={{ fontSize: 12, fontWeight: 600, color: TEXT }}>Rank My Comment</div>
              <div style={{ fontSize: 11, color: MUTED }}>Score before submitting</div>
            </div>
            <div onClick={() => setRankToggle(!rankToggle)} style={{ width: 40, height: 22, borderRadius: 99, cursor: "pointer", position: "relative", background: rankToggle ? ORANGE : "#334155", transition: "background 0.2s" }}>
              <div style={{ position: "absolute", top: 3, left: rankToggle ? 20 : 3, width: 16, height: 16, borderRadius: "50%", background: "#fff", transition: "left 0.2s" }} />
            </div>
          </div>
          <button onClick={() => setShowModal(true)} style={{ width: "100%", background: "#162032", border: `1px solid ${ORANGE}`, color: ORANGE, padding: "10px", borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
            <span>Create Task</span>
            <span style={{ background: ORANGE, color: "#fff", padding: "2px 8px", borderRadius: 4, fontSize: 11, fontWeight: 700 }}>7.5 Credits</span>
          </button>
        </div>
      </div>

      {/* Task modal */}
      {showModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
          <div style={{ background: "#1e2a3b", border: `1px solid ${BORDER}`, borderRadius: 12, padding: 28, width: 420, boxShadow: "0 25px 50px rgba(0,0,0,0.5)" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
              <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: "#fff" }}>Create Task</h3>
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
                  <div style={{ fontSize: 13, fontWeight: 600, color: tier === t.value ? "#fff" : "#94a3b8" }}>{t.label}</div>
                  <div style={{ fontSize: 11, color: MUTED, marginTop: 2 }}>{t.desc}</div>
                </div>
                <span style={{ background: tier === t.value ? ORANGE : "#1e3a5f", color: tier === t.value ? "#fff" : "#60a5fa", padding: "3px 8px", borderRadius: 4, fontSize: 11, fontWeight: 700, marginLeft: 10, flexShrink: 0 }}>{t.credits}</span>
              </div>
            ))}
            <div style={{ marginTop: 18, marginBottom: 18 }}>
              <label style={{ fontSize: 12, color: MUTED, display: "block", marginBottom: 6, textTransform: "uppercase", letterSpacing: 1, fontWeight: 700 }}>Schedule</label>
              <input type="datetime-local" value={scheduleDate} onChange={e => setScheduleDate(e.target.value)} style={{ width: "100%", background: "#162032", border: `1px solid ${BORDER}`, color: TEXT, padding: "9px 12px", borderRadius: 8, fontSize: 13, outline: "none", boxSizing: "border-box" }} />
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={() => setShowModal(false)} style={{ flex: 1, background: "transparent", border: `1px solid ${BORDER}`, color: "#94a3b8", padding: "10px", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer" }}>Cancel</button>
              <button onClick={() => setShowModal(false)} style={{ flex: 2, background: ORANGE, color: "#fff", border: "none", padding: "10px", borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: "pointer" }}>Confirm Task</button>
            </div>
          </div>
        </div>
      )}

      <Toast visible={toast} message={toastMsg} />
    </div>
  );
}
