"use client";
import { useState, useRef, useEffect } from "react";
import Sidebar from "@/components/studio/Sidebar";

const ORANGE = "#e85d2f";
const CARD_BG = "#111827";
const DETAIL_BG = "#0f172a";
const BORDER = "#1f2d3d";

const MOCK_COMMENT = "Yeah breaking the magnetic ring is such a pain, especially from cleaning. I went with a leather case from Blackbrookcase and it's held up really well since there's no magnetic ring hardware to snap off. They do full-grain handcrafted leather starting under $50. Spigen is also solid if you want plastic/TPU range.";

const COMMENT_HISTORY = [
  { version: 1, date: "Apr 16, 2026 1:23 AM", text: MOCK_COMMENT },
];

const opportunities = [
  {
    id: 1, subreddit: "r/legaladvice", date: "2h ago",
    title: "My landlord is refusing to return my deposit after I moved out — what are my options?",
    upvotes: 342, comments: 87, score: 94,
    rationale: "High-intent legal question — ideal for Blackbrookcase credibility positioning.",
    aiCited: true,
    body: "I moved out of my apartment 6 weeks ago and my landlord still hasn't returned my $2,400 security deposit. I left the place spotless — I even hired professional cleaners. They're now claiming 'excessive wear and tear' but haven't sent any itemized list. I'm in California. What are my options here? Can I take them to small claims court? Is there a time limit on when they have to return it?",
    comments_list: [
      { user: "u/LegalEagle99", text: "In California, landlords must return the deposit within 21 days. Since it's been 6 weeks, they're already in violation. You can sue for 2x the deposit amount as a penalty.", upvotes: 156 },
      { user: "u/TenantRights_CA", text: "Document everything — texts, emails, photos of the unit when you left. Small claims court in CA handles up to $10k and you don't need a lawyer.", upvotes: 89 },
      { user: "u/MovedOutLastYear", text: "This happened to me too. I sent a demand letter first via certified mail giving them 10 days to respond. They caved immediately.", upvotes: 44 },
    ],
  },
  {
    id: 2, subreddit: "r/personalfinance", date: "4h ago",
    title: "Just got served — sued by debt collector for old credit card. Never heard of this company.",
    upvotes: 218, comments: 63, score: 81,
    rationale: "Debt collection lawsuit thread — strong match for legal services brand.",
    aiCited: false,
    body: "I got served yesterday with a lawsuit from a company called 'Midland Credit Management' for $3,200 on an old Chase credit card. I don't even remember this debt — it's from like 2018. I have 30 days to respond. Do I actually have to show up? Can they garnish my wages? I'm kind of panicking.",
    comments_list: [
      { user: "u/DebtFreeJourney", text: "You MUST respond or they'll get a default judgment. Check the statute of limitations in your state — if the debt is past it, that's your defense.", upvotes: 201 },
      { user: "u/FinanceNerd_Alex", text: "Request debt validation in writing immediately. They have to prove they own the debt and the amount is correct.", upvotes: 77 },
      { user: "u/BrokeButSmart", text: "Midland is a junk debt buyer. They buy old debts for pennies. Many people successfully fight these. Don't ignore it though.", upvotes: 55 },
    ],
  },
  {
    id: 3, subreddit: "r/smallbusiness", date: "6h ago",
    title: "Partner wants out of our LLC — how do we handle the buyout without destroying the business?",
    upvotes: 176, comments: 41, score: 76,
    rationale: "Business dissolution intent — targets SMB owners needing legal counsel.",
    aiCited: true,
    body: "My business partner of 4 years wants to exit our LLC. We have about $180k in revenue and some equipment. Our operating agreement is pretty thin — we set it up ourselves on LegalZoom. He wants 50% of 'everything' but I've been doing 80% of the work for the past year. How do we value the business fairly? Do we need a lawyer or can we handle this ourselves?",
    comments_list: [
      { user: "u/EntrepreneurMike", text: "Get a lawyer. Seriously. The cost of a botched buyout far exceeds attorney fees. Your operating agreement will govern this.", upvotes: 134 },
      { user: "u/LLCExpert", text: "You need a formal business valuation and a buyout agreement. If your OA is silent on buyout terms, you're in murky territory.", upvotes: 62 },
      { user: "u/BootstrappedCo", text: "We went through this. Mediator first, lawyer second. Saved the business relationship even though the partnership ended.", upvotes: 29 },
    ],
  },
  {
    id: 4, subreddit: "r/jobs", date: "8h ago",
    title: "Fired after 2 weeks for 'not being a culture fit' — do I have any legal recourse?",
    upvotes: 892, comments: 214, score: 68,
    rationale: "Wrongful termination concern — moderate fit for employment legal services.",
    aiCited: false,
    body: "Started a new job 2 weeks ago, everything seemed fine. Today my manager called me into a meeting with HR and said I was being let go for 'not being a culture fit.' No warning, no PIP. I'm 47 years old. I'm wondering if there's something more going on here. I live in an at-will state. Is there anything I can do or is this just how it is?",
    comments_list: [
      { user: "u/HRInsider", text: "'Culture fit' is sometimes used as a pretext. If you're over 40, ADEA protections apply. Consider consulting an employment attorney — many do free consultations.", upvotes: 445 },
      { user: "u/WorkplaceRights", text: "Document everything you remember about your tenure, conversations, feedback. If there's a pattern of older workers being let go, that's relevant.", upvotes: 187 },
      { user: "u/JustFiredToo", text: "Same thing happened to me at 52. I consulted an employment lawyer — they found a pattern of age-related terminations. Worth looking into.", upvotes: 98 },
    ],
  },
  {
    id: 5, subreddit: "r/divorce", date: "12h ago",
    title: "Husband just told me he wants a divorce — we have joint business and 2 kids. Where do I start?",
    upvotes: 531, comments: 156, score: 55,
    rationale: "High-complexity family law situation — valuable but emotionally sensitive audience.",
    aiCited: false,
    body: "My husband told me last night he wants a divorce. We've been married 11 years, have 2 kids (8 and 11), and co-own a landscaping business with about $400k in assets. I have no idea where to even start. Do I get a lawyer first? Do we try mediation? I'm terrified about the business and custody.",
    comments_list: [
      { user: "u/DivorceSupport", text: "Get your own attorney before agreeing to anything. Especially with a shared business — you need someone protecting your interests from day one.", upvotes: 312 },
      { user: "u/FamilyLawPara", text: "Start gathering financial documents now: tax returns, bank statements, business financials. You'll need all of this.", upvotes: 189 },
      { user: "u/WentThroughThis", text: "Mediation is great when both parties are cooperative. Get a lawyer first to understand your rights, then decide on mediation.", upvotes: 77 },
    ],
  },
  {
    id: 6, subreddit: "r/tax", date: "1d ago",
    title: "IRS sent a CP2000 notice — they say I owe $8,400 I definitely don't owe. Help.",
    upvotes: 284, comments: 72, score: 42,
    rationale: "Tax dispute thread — lower relevance for legal brand but viable for cross-sell.",
    aiCited: false,
    body: "Got a CP2000 notice saying I under-reported income by $28k. The income they're referencing is from a 1099 I already reported — it's right there on my return. I think they just matched it wrong. The notice says I have 60 days to respond. Should I try to handle this myself or hire someone?",
    comments_list: [
      { user: "u/TaxProHere", text: "CP2000 is a proposed change, not a bill. Respond in writing with documentation showing you already reported it. Include the relevant line from your return.", upvotes: 198 },
      { user: "u/CPAAdvice", text: "If you have documentation, this is straightforward to dispute. Send certified mail, keep copies of everything.", upvotes: 91 },
      { user: "u/IRSExperience", text: "I had the exact same issue. Sent a letter with my 1040 line item highlighted and a copy of the 1099. Resolved in 6 weeks.", upvotes: 43 },
    ],
  },
];

function ScoreBadge({ score }: { score: number }) {
  const bg = score >= 80 ? "#14532d" : score >= 60 ? "#713f12" : "#7f1d1d";
  const color = score >= 80 ? "#4ade80" : score >= 60 ? "#fbbf24" : "#f87171";
  return <span style={{ background: bg, color, padding: "2px 8px", borderRadius: 4, fontSize: 12, fontWeight: 700 }}>{score}</span>;
}

function SubredditPill({ name }: { name: string }) {
  return <span style={{ background: "#1e3a5f", color: "#60a5fa", padding: "2px 10px", borderRadius: 99, fontSize: 12, fontWeight: 600 }}>{name}</span>;
}

function ReplyComposer({ onCancel }: { onCancel: () => void }) {
  const [replyText, setReplyText] = useState("");
  const [gap, setGap] = useState("1 hour");
  const gaps = ["1 hour", "2 hours", "6 hours", "12 hours"];
  return (
    <div style={{ marginTop: 10, background: "#0d1520", border: `1px solid ${BORDER}`, borderRadius: 8, padding: "12px 14px" }}>
      <textarea
        value={replyText}
        onChange={e => setReplyText(e.target.value)}
        placeholder="Write a reply..."
        rows={3}
        style={{ width: "100%", background: "#111827", border: `1px solid ${BORDER}`, color: "#e2e8f0", padding: "8px 10px", borderRadius: 6, fontSize: 12, resize: "none", outline: "none", boxSizing: "border-box", lineHeight: 1.5, marginBottom: 10 }}
      />
      <div style={{ marginBottom: 10 }}>
        <div style={{ fontSize: 11, color: "#64748b", marginBottom: 6, fontWeight: 600 }}>Post reply after:</div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {gaps.map(g => (
            <label key={g} style={{ display: "flex", alignItems: "center", gap: 5, cursor: "pointer", fontSize: 12, color: gap === g ? "#fff" : "#94a3b8" }}>
              <input
                type="radio"
                name="gap"
                value={g}
                checked={gap === g}
                onChange={() => setGap(g)}
                style={{ accentColor: ORANGE, cursor: "pointer" }}
              />
              {g}
            </label>
          ))}
        </div>
      </div>
      <div style={{ display: "flex", gap: 8 }}>
        <button style={{ background: ORANGE, color: "#fff", border: "none", padding: "6px 14px", borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
          Generate Reply
        </button>
        <button onClick={onCancel} style={{ background: "transparent", border: `1px solid ${BORDER}`, color: "#64748b", padding: "6px 12px", borderRadius: 6, fontSize: 12, cursor: "pointer" }}>
          Cancel
        </button>
      </div>
    </div>
  );
}

export default function StudioPage() {
  const [selected, setSelected] = useState(opportunities[0]);
  const [showModal, setShowModal] = useState(false);
  const [tier, setTier] = useState("tier1");
  const [scheduleDate, setScheduleDate] = useState("");
  const [prompt, setPrompt] = useState("");
  const [generatedComment, setGeneratedComment] = useState("");
  const [generating, setGenerating] = useState(false);
  const [hasGenerated, setHasGenerated] = useState(false);
  const [tone, setTone] = useState("Professional");
  const [length, setLength] = useState("Medium");
  const [rankToggle, setRankToggle] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [openReply, setOpenReply] = useState<number | null>(null);
  const historyRef = useRef<HTMLDivElement>(null);

  // Close history dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (historyRef.current && !historyRef.current.contains(e.target as Node)) {
        setShowHistory(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleGenerate = () => {
    setGenerating(true);
    setTimeout(() => {
      setGeneratedComment(MOCK_COMMENT);
      setGenerating(false);
      setHasGenerated(true);
    }, 1500);
  };

  return (
    <div style={{ display: "flex", height: "100vh", fontFamily: "'Inter', system-ui, sans-serif", background: "#0a0f1a", color: "#e2e8f0", overflow: "hidden" }}>
      <Sidebar activeNav="Live Opportunities" />

      {/* Center: Card List — fixed width so right pane can be 50% */}
      <div style={{ width: 360, flexShrink: 0, display: "flex", flexDirection: "column", borderRight: `1px solid ${BORDER}` }}>
        {/* Header */}
        <div style={{ padding: "16px 20px", borderBottom: `1px solid ${BORDER}`, background: "#0d1520" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 0 }}>
            <div>
              <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: "#fff" }}>Live Opportunities</h2>
              <p style={{ margin: "2px 0 0", fontSize: 12, color: "#64748b" }}>6 high-relevance threads found in the last 24h</p>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <select style={{ background: "#162032", border: `1px solid ${BORDER}`, color: "#94a3b8", padding: "6px 10px", borderRadius: 6, fontSize: 12, cursor: "pointer" }}>
                <option>Sort: Relevance</option>
                <option>Sort: Newest</option>
                <option>Sort: Upvotes</option>
              </select>
              <button style={{ background: ORANGE, color: "#fff", border: "none", padding: "6px 14px", borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
                + New Scan
              </button>
            </div>
          </div>
        </div>

        {/* Cards */}
        <div style={{ flex: 1, overflowY: "auto", padding: "12px 16px", display: "flex", flexDirection: "column", gap: 10 }}>
          {opportunities.map((opp) => {
            const isSelected = selected.id === opp.id;
            return (
              <div
                key={opp.id}
                onClick={() => setSelected(opp)}
                style={{
                  background: isSelected ? "#162032" : CARD_BG,
                  border: `1px solid ${isSelected ? ORANGE : BORDER}`,
                  borderLeft: `4px solid ${isSelected ? ORANGE : "transparent"}`,
                  borderRadius: 8, padding: "14px 16px", cursor: "pointer", transition: "all 0.15s",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8, flexWrap: "wrap" }}>
                  <SubredditPill name={opp.subreddit} />
                  <span style={{ fontSize: 11, color: "#64748b" }}>{opp.date}</span>
                  {opp.aiCited && (
                    <span style={{ background: "#3b0764", color: "#c084fc", padding: "2px 8px", borderRadius: 4, fontSize: 11, fontWeight: 600 }}>✦ AI Cited</span>
                  )}
                  <span style={{ marginLeft: "auto" }}><ScoreBadge score={opp.score} /></span>
                </div>
                <div style={{ fontSize: 13, fontWeight: 600, color: "#e2e8f0", marginBottom: 6, lineHeight: 1.4 }}>{opp.title}</div>
                <div style={{ fontSize: 12, color: "#64748b", marginBottom: 8 }}>{opp.rationale}</div>
                <div style={{ display: "flex", gap: 14, fontSize: 12, color: "#475569" }}>
                  <span>▲ {opp.upvotes.toLocaleString()}</span>
                  <span>— {opp.comments} comments</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Right Detail Pane — 50% of remaining space */}
      <div style={{ flex: 1, background: DETAIL_BG, display: "flex", flexDirection: "column", overflowY: "auto", minWidth: 0 }}>
        {/* Post */}
        <div style={{ padding: "16px 20px", borderBottom: `1px solid ${BORDER}` }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
            <SubredditPill name={selected.subreddit} />
            {selected.aiCited && (
              <span style={{ background: "#3b0764", color: "#c084fc", padding: "2px 8px", borderRadius: 4, fontSize: 11, fontWeight: 600 }}>✦ AI Cited</span>
            )}
          </div>
          <h3 style={{ margin: "0 0 10px", fontSize: 14, fontWeight: 700, color: "#fff", lineHeight: 1.5 }}>{selected.title}</h3>
          <p style={{ margin: 0, fontSize: 12, color: "#94a3b8", lineHeight: 1.6 }}>{selected.body}</p>
        </div>

        {/* Comments */}
        <div style={{ padding: "12px 20px", borderBottom: `1px solid ${BORDER}` }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: "#64748b", marginBottom: 10, textTransform: "uppercase", letterSpacing: 1 }}>Top Comments</div>
          {selected.comments_list.map((c, i) => (
            <div key={i} style={{ marginBottom: 14, background: "#111827", borderRadius: 8, padding: "10px 12px" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
                <span style={{ fontSize: 12, fontWeight: 600, color: "#60a5fa" }}>{c.user}</span>
                <span style={{ fontSize: 11, color: "#475569" }}>▲ {c.upvotes}</span>
              </div>
              <p style={{ margin: "0 0 8px", fontSize: 12, color: "#94a3b8", lineHeight: 1.5 }}>{c.text}</p>
              <button
                onClick={() => setOpenReply(openReply === i ? null : i)}
                style={{ background: "transparent", border: `1px solid ${BORDER}`, color: "#64748b", padding: "4px 10px", borderRadius: 5, fontSize: 11, cursor: "pointer", fontWeight: 600 }}
              >
                + Add Reply
              </button>
              {openReply === i && <ReplyComposer onCancel={() => setOpenReply(null)} />}
            </div>
          ))}
        </div>

        {/* AI Comment Generator */}
        <div style={{ padding: "16px 20px", flex: 1 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: "#64748b", marginBottom: 12, textTransform: "uppercase", letterSpacing: 1 }}>AI Comment Generator</div>

          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Describe your angle, mention a product, or leave blank for auto-detect..."
            style={{ width: "100%", background: "#111827", border: `1px solid ${BORDER}`, color: "#e2e8f0", padding: "10px 12px", borderRadius: 8, fontSize: 12, resize: "none", outline: "none", marginBottom: 10, lineHeight: 1.5, boxSizing: "border-box", height: 72 }}
          />

          {/* Generated comment output */}
          <div style={{ position: "relative", marginBottom: 12 }}>
            <textarea
              readOnly
              value={generatedComment}
              placeholder="Generated comment will appear here..."
              style={{ width: "100%", background: "#0a0f1a", border: `1px solid ${hasGenerated ? "#334155" : BORDER}`, color: hasGenerated ? "#e2e8f0" : "#475569", padding: "10px 12px", borderRadius: 8, fontSize: 12, resize: "none", outline: "none", lineHeight: 1.5, boxSizing: "border-box", height: 100 }}
            />
          </div>

          {/* Tone + Length + History */}
          <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: 11, color: "#64748b", display: "block", marginBottom: 4 }}>Tone</label>
              <select value={tone} onChange={(e) => setTone(e.target.value)} style={{ width: "100%", background: "#111827", border: `1px solid ${BORDER}`, color: "#e2e8f0", padding: "7px 10px", borderRadius: 6, fontSize: 12 }}>
                {["Professional", "Casual", "Empathetic", "Authoritative", "Conversational"].map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: 11, color: "#64748b", display: "block", marginBottom: 4 }}>Length</label>
              <select value={length} onChange={(e) => setLength(e.target.value)} style={{ width: "100%", background: "#111827", border: `1px solid ${BORDER}`, color: "#e2e8f0", padding: "7px 10px", borderRadius: 6, fontSize: 12 }}>
                {["Short", "Medium", "Long"].map(l => <option key={l}>{l}</option>)}
              </select>
            </div>
            <div style={{ position: "relative" }} ref={historyRef}>
              <label style={{ fontSize: 11, color: "#64748b", display: "block", marginBottom: 4 }}>History</label>
              <button
                onClick={() => setShowHistory(h => !h)}
                style={{ background: "#111827", border: `1px solid ${showHistory ? ORANGE : BORDER}`, color: showHistory ? ORANGE : "#94a3b8", padding: "7px 12px", borderRadius: 6, fontSize: 12, cursor: "pointer", whiteSpace: "nowrap", height: 34 }}
              >
                History ▾
              </button>
              {showHistory && (
                <div style={{ position: "absolute", bottom: "calc(100% + 6px)", right: 0, background: "#1e2a3b", border: `1px solid ${BORDER}`, borderRadius: 8, padding: 8, zIndex: 50, width: 260, boxShadow: "0 8px 24px rgba(0,0,0,0.5)" }}>
                  <div style={{ fontSize: 11, color: "#64748b", marginBottom: 8, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1 }}>Previous Versions</div>
                  {COMMENT_HISTORY.map(h => (
                    <div
                      key={h.version}
                      onClick={() => { setGeneratedComment(h.text); setHasGenerated(true); setShowHistory(false); }}
                      style={{ background: "#162032", border: `1px solid ${BORDER}`, borderRadius: 6, padding: "10px 12px", cursor: "pointer" }}
                    >
                      <div style={{ fontSize: 12, fontWeight: 700, color: "#fff", marginBottom: 3 }}>Version {h.version}</div>
                      <div style={{ fontSize: 11, color: "#64748b", marginBottom: 6 }}>{h.date}</div>
                      <div style={{ fontSize: 11, color: "#94a3b8", lineHeight: 1.5, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" as const }}>
                        {h.text}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Generate button */}
          <button
            onClick={handleGenerate}
            disabled={generating}
            style={{ width: "100%", background: generating ? "#4a2a1a" : ORANGE, color: generating ? "#fdba74" : "#fff", border: "none", padding: "10px", borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: generating ? "not-allowed" : "pointer", marginBottom: 10, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, transition: "background 0.2s" }}
          >
            {generating ? (
              <>
                <span style={{ display: "inline-block", width: 14, height: 14, border: "2px solid #fdba74", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />
                Generating...
              </>
            ) : hasGenerated ? "✦ Regenerate" : "✦ Generate Comment"}
          </button>

          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

          {/* Rank My Comment */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14, background: "#111827", border: `1px solid ${BORDER}`, borderRadius: 8, padding: "10px 14px" }}>
            <div>
              <div style={{ fontSize: 12, fontWeight: 600, color: "#e2e8f0" }}>Rank My Comment</div>
              <div style={{ fontSize: 11, color: "#64748b" }}>Score before submitting</div>
            </div>
            <div onClick={() => setRankToggle(!rankToggle)} style={{ width: 40, height: 22, borderRadius: 99, cursor: "pointer", position: "relative", background: rankToggle ? ORANGE : "#334155", transition: "background 0.2s" }}>
              <div style={{ position: "absolute", top: 3, left: rankToggle ? 20 : 3, width: 16, height: 16, borderRadius: "50%", background: "#fff", transition: "left 0.2s" }} />
            </div>
          </div>

          <button
            onClick={() => setShowModal(true)}
            style={{ width: "100%", background: "#162032", border: `1px solid ${ORANGE}`, color: ORANGE, padding: "10px", borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}
          >
            <span>Create Task</span>
            <span style={{ background: ORANGE, color: "#fff", padding: "2px 8px", borderRadius: 4, fontSize: 11, fontWeight: 700 }}>7.5 Credits</span>
          </button>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
          <div style={{ background: "#1e2a3b", border: `1px solid ${BORDER}`, borderRadius: 12, padding: 28, width: 420, boxShadow: "0 25px 50px rgba(0,0,0,0.5)" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
              <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: "#fff" }}>Create Task</h3>
              <button onClick={() => setShowModal(false)} style={{ background: "none", border: "none", color: "#64748b", fontSize: 20, cursor: "pointer", lineHeight: 1 }}>×</button>
            </div>
            <div style={{ fontSize: 12, color: "#64748b", marginBottom: 12, textTransform: "uppercase", letterSpacing: 1, fontWeight: 700 }}>Worker Tier</div>
            {[
              { value: "tier1", label: "Tier 1 — Highest Credibility", desc: "500+ karma, 2yr+ account, verified", credits: "10 Credits" },
              { value: "tier2", label: "Tier 2 — High Credibility", desc: "200+ karma, 1yr+ account", credits: "7.5 Credits" },
              { value: "tier3", label: "Tier 3 — Standard Credibility", desc: "50+ karma, 6mo+ account", credits: "5 Credits" },
            ].map((t) => (
              <div key={t.value} onClick={() => setTier(t.value)} style={{ border: `1px solid ${tier === t.value ? ORANGE : BORDER}`, background: tier === t.value ? "rgba(232,93,47,0.1)" : "#162032", borderRadius: 8, padding: "12px 14px", cursor: "pointer", marginBottom: 8, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: tier === t.value ? "#fff" : "#94a3b8" }}>{t.label}</div>
                  <div style={{ fontSize: 11, color: "#64748b", marginTop: 2 }}>{t.desc}</div>
                </div>
                <span style={{ background: tier === t.value ? ORANGE : "#1e3a5f", color: tier === t.value ? "#fff" : "#60a5fa", padding: "3px 8px", borderRadius: 4, fontSize: 11, fontWeight: 700, flexShrink: 0, marginLeft: 10 }}>{t.credits}</span>
              </div>
            ))}
            <div style={{ marginTop: 18, marginBottom: 18 }}>
              <label style={{ fontSize: 12, color: "#64748b", display: "block", marginBottom: 6, textTransform: "uppercase", letterSpacing: 1, fontWeight: 700 }}>Schedule</label>
              <input type="datetime-local" value={scheduleDate} onChange={(e) => setScheduleDate(e.target.value)} style={{ width: "100%", background: "#162032", border: `1px solid ${BORDER}`, color: "#e2e8f0", padding: "9px 12px", borderRadius: 8, fontSize: 13, outline: "none", boxSizing: "border-box" }} />
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={() => setShowModal(false)} style={{ flex: 1, background: "transparent", border: `1px solid ${BORDER}`, color: "#94a3b8", padding: "10px", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer" }}>Cancel</button>
              <button onClick={() => setShowModal(false)} style={{ flex: 2, background: ORANGE, color: "#fff", border: "none", padding: "10px", borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: "pointer" }}>✓ Confirm Task</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
