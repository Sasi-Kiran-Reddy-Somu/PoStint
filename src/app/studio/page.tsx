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
      {
        user: "u/LegalEagle99", text: "In California, landlords must return the deposit within 21 days. Since it's been 6 weeks, they're already in violation. You can sue for 2x the deposit amount as a penalty.", upvotes: 156,
        replies: [
          { user: "u/OP_Here", text: "Wait, 2x the deposit? So I could potentially get $4,800 back?", upvotes: 34 },
          { user: "u/LegalEagle99", text: "Correct — Civil Code 1950.5 allows for statutory damages up to 2x if bad faith is proven. Document everything.", upvotes: 61 },
        ],
      },
      {
        user: "u/TenantRights_CA", text: "Document everything — texts, emails, photos of the unit when you left. Small claims court in CA handles up to $10k and you don't need a lawyer.", upvotes: 89,
        replies: [
          { user: "u/FirstTimeRenter", text: "Does this apply if the lease ended naturally vs early termination?", upvotes: 12 },
          { user: "u/TenantRights_CA", text: "Yes, deposit rules apply regardless of how the tenancy ended.", upvotes: 28 },
          { user: "u/CALegalAid", text: "Also check if your city has local tenant protections — some go beyond state law.", upvotes: 19 },
        ],
      },
      {
        user: "u/MovedOutLastYear", text: "This happened to me too. I sent a demand letter first via certified mail giving them 10 days to respond. They caved immediately.", upvotes: 44,
        replies: [
          { user: "u/OP_Here", text: "Where did you get the demand letter template?", upvotes: 8 },
          { user: "u/MovedOutLastYear", text: "r/legaladvice wiki has a good one, or just Google 'California security deposit demand letter'.", upvotes: 22 },
        ],
      },
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
      {
        user: "u/DebtFreeJourney", text: "You MUST respond or they'll get a default judgment. Check the statute of limitations in your state — if the debt is past it, that's your defense.", upvotes: 201,
        replies: [
          { user: "u/OP_Here", text: "I'm in Texas, debt is from 2018. Is SOL 4 years here?", upvotes: 15 },
          { user: "u/DebtFreeJourney", text: "Texas SOL on written contracts is 4 years from last activity. If last payment was 2018 you may have a strong defense.", upvotes: 67 },
          { user: "u/ConsumerLawNerd", text: "Also look into FDCPA violations — if they violated any rules during collection, you can countersue.", upvotes: 44 },
        ],
      },
      {
        user: "u/FinanceNerd_Alex", text: "Request debt validation in writing immediately. They have to prove they own the debt and the amount is correct.", upvotes: 77,
        replies: [
          { user: "u/OP_Here", text: "Can I send validation request even after being served?", upvotes: 9 },
          { user: "u/FinanceNerd_Alex", text: "Yes but respond to the lawsuit first — validation request doesn't pause the court clock.", upvotes: 31 },
        ],
      },
      {
        user: "u/BrokeButSmart", text: "Midland is a junk debt buyer. They buy old debts for pennies. Many people successfully fight these. Don't ignore it though.", upvotes: 55,
        replies: [
          { user: "u/WonAgainstMidland", text: "Can confirm, beat them in court. They often can't produce original creditor documentation.", upvotes: 48 },
        ],
      },
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
      {
        user: "u/EntrepreneurMike", text: "Get a lawyer. Seriously. The cost of a botched buyout far exceeds attorney fees. Your operating agreement will govern this.", upvotes: 134,
        replies: [
          { user: "u/OP_Here", text: "What kind of lawyer specifically — business attorney or transactional?", upvotes: 11 },
          { user: "u/EntrepreneurMike", text: "Business transactional attorney. Look for someone who handles M&A or small business exits specifically.", upvotes: 38 },
        ],
      },
      {
        user: "u/LLCExpert", text: "You need a formal business valuation and a buyout agreement. If your OA is silent on buyout terms, you're in murky territory.", upvotes: 62,
        replies: [
          { user: "u/SoloFounder22", text: "How much does a formal valuation typically cost for a $180k revenue business?", upvotes: 7 },
          { user: "u/LLCExpert", text: "Anywhere from $2k–$8k depending on complexity. Worth every dollar vs. a disputed exit.", upvotes: 25 },
          { user: "u/AccountantHere", text: "You can also use an earnings multiplier method (EBITDA x 2-4) as a cheaper starting point.", upvotes: 17 },
        ],
      },
      {
        user: "u/BootstrappedCo", text: "We went through this. Mediator first, lawyer second. Saved the business relationship even though the partnership ended.", upvotes: 29,
        replies: [
          { user: "u/OP_Here", text: "Did mediation actually hold up legally?", upvotes: 5 },
          { user: "u/BootstrappedCo", text: "Yes, mediator drafted a binding agreement that both parties signed. Lawyer then reviewed it.", upvotes: 18 },
        ],
      },
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
      {
        user: "u/HRInsider", text: "'Culture fit' is sometimes used as a pretext. If you're over 40, ADEA protections apply. Consider consulting an employment attorney — many do free consultations.", upvotes: 445,
        replies: [
          { user: "u/OP_Here", text: "What would I need to prove age discrimination though?", upvotes: 22 },
          { user: "u/HRInsider", text: "Disparate impact evidence — e.g. if most people let go under 'culture fit' are 40+. Discovery would reveal hiring/firing patterns.", upvotes: 87 },
          { user: "u/EmploymentAttorney", text: "Also check if they immediately hired someone younger for the same role. That's often the smoking gun.", upvotes: 134 },
        ],
      },
      {
        user: "u/WorkplaceRights", text: "Document everything you remember about your tenure, conversations, feedback. If there's a pattern of older workers being let go, that's relevant.", upvotes: 187,
        replies: [
          { user: "u/OP_Here", text: "Should I reach out to other ex-employees?", upvotes: 14 },
          { user: "u/WorkplaceRights", text: "Yes, but don't do it in a way that could be seen as coordinating — just have genuine conversations.", upvotes: 39 },
        ],
      },
      {
        user: "u/JustFiredToo", text: "Same thing happened to me at 52. I consulted an employment lawyer — they found a pattern of age-related terminations. Worth looking into.", upvotes: 98,
        replies: [
          { user: "u/OP_Here", text: "How did that turn out for you?", upvotes: 19 },
          { user: "u/JustFiredToo", text: "Settled for 8 months salary. Can't share more details but definitely pursue it if you have even a slight feeling something was off.", upvotes: 76 },
        ],
      },
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
      {
        user: "u/DivorceSupport", text: "Get your own attorney before agreeing to anything. Especially with a shared business — you need someone protecting your interests from day one.", upvotes: 312,
        replies: [
          { user: "u/OP_Here", text: "He's suggesting we use one attorney to save money. Is that okay?", upvotes: 28 },
          { user: "u/DivorceSupport", text: "Absolutely not. One attorney can only represent one party. Get your own counsel — the 'savings' can cost you enormously.", upvotes: 119 },
          { user: "u/FamilyLawPara", text: "What she said. One attorney for both is a massive red flag, especially with shared business assets.", upvotes: 67 },
        ],
      },
      {
        user: "u/FamilyLawPara", text: "Start gathering financial documents now: tax returns, bank statements, business financials. You'll need all of this.", upvotes: 189,
        replies: [
          { user: "u/OP_Here", text: "He controls most of the business accounts. Can he hide assets?", upvotes: 16 },
          { user: "u/FamilyLawPara", text: "During discovery, both sides must disclose all assets under oath. Hiding them is contempt of court. Your lawyer can also subpoena records.", upvotes: 55 },
        ],
      },
      {
        user: "u/WentThroughThis", text: "Mediation is great when both parties are cooperative. Get a lawyer first to understand your rights, then decide on mediation.", upvotes: 77,
        replies: [
          { user: "u/MediatorHere", text: "Even in mediation, you can have your own attorney review any agreement before signing. Don't skip that step.", upvotes: 41 },
        ],
      },
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
      {
        user: "u/TaxProHere", text: "CP2000 is a proposed change, not a bill. Respond in writing with documentation showing you already reported it. Include the relevant line from your return.", upvotes: 198,
        replies: [
          { user: "u/OP_Here", text: "Do I respond via the portal or certified mail?", upvotes: 11 },
          { user: "u/TaxProHere", text: "Both if possible. Certified mail creates a paper trail. The portal is faster but sometimes has issues.", upvotes: 44 },
          { user: "u/IRSExperience", text: "Always certified mail with return receipt. You need proof of delivery if it ever escalates.", upvotes: 32 },
        ],
      },
      {
        user: "u/CPAAdvice", text: "If you have documentation, this is straightforward to dispute. Send certified mail, keep copies of everything.", upvotes: 91,
        replies: [
          { user: "u/OP_Here", text: "Should I hire a CPA or can I handle this myself?", upvotes: 8 },
          { user: "u/CPAAdvice", text: "If the documentation is clear-cut, you can handle it yourself. If they push back after your response, then hire someone.", upvotes: 29 },
        ],
      },
      {
        user: "u/IRSExperience", text: "I had the exact same issue. Sent a letter with my 1040 line item highlighted and a copy of the 1099. Resolved in 6 weeks.", upvotes: 43,
        replies: [
          { user: "u/SameProblem", text: "How long did it actually take to resolve after you sent the letter?", upvotes: 6 },
          { user: "u/IRSExperience", text: "About 6 weeks from when they received it. The IRS is slow but they do process these correctly when you give them clear documentation.", upvotes: 21 },
        ],
      },
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
  const [boostQty, setBoostQty] = useState(5);
  const [upvoteQty, setUpvoteQty] = useState(0);
  const [prompt, setPrompt] = useState("");
  const [generatedComment, setGeneratedComment] = useState("");
  const [generating, setGenerating] = useState(false);
  const [hasGenerated, setHasGenerated] = useState(false);
  const [tones, setTones] = useState<string[]>(["Professional"]);
  const [length, setLength] = useState("Medium");
  const [rankToggle, setRankToggle] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [openReply, setOpenReply] = useState<number | null>(null);
  const historyRef = useRef<HTMLDivElement>(null);

  const BALANCE = 142;
  const TIER_CREDITS: Record<string, number> = { tier1: 10, tier2: 7.5, tier3: 5 };
  const baseCost = TIER_CREDITS[tier] ?? 10;
  const totalCost = (rankToggle ? baseCost + boostQty : baseCost) + upvoteQty * 0.2;
  const canAfford = totalCost <= BALANCE;

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

      {/* Center: Card List — flex 1 = 50% */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", borderRight: `1px solid ${BORDER}`, minWidth: 0 }}>
        {/* Header */}
        <div style={{ padding: "16px 20px", borderBottom: `1px solid ${BORDER}`, background: "#0d1520" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 0 }}>
            <div>
              <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: "#fff" }}>Live Opportunities</h2>
              <p style={{ margin: "2px 0 0", fontSize: 12, color: "#64748b" }}>6 high-relevance threads found in the last 24h</p>
            </div>
            <select style={{ background: "#162032", border: `1px solid ${BORDER}`, color: "#94a3b8", padding: "6px 10px", borderRadius: 6, fontSize: 12, cursor: "pointer" }}>
              <option>Sort: Relevance</option>
              <option>Sort: Newest</option>
              <option>Sort: Upvotes</option>
            </select>
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

      {/* Right Detail Pane — flex 1 = 50% */}
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
            <div key={i} style={{ marginBottom: 14 }}>
              <div style={{ background: "#111827", borderRadius: 8, padding: "10px 12px" }}>
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
              {/* Nested replies */}
              {c.replies && c.replies.length > 0 && (
                <div style={{ marginLeft: 20, borderLeft: `2px solid ${BORDER}`, paddingLeft: 12, marginTop: 4, display: "flex", flexDirection: "column", gap: 6 }}>
                  {c.replies.map((r, j) => (
                    <div key={j} style={{ background: "#0d1520", borderRadius: 6, padding: "8px 10px" }}>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
                        <span style={{ fontSize: 11, fontWeight: 600, color: "#7dd3fc" }}>{r.user}</span>
                        <span style={{ fontSize: 10, color: "#475569" }}>▲ {r.upvotes}</span>
                      </div>
                      <p style={{ margin: 0, fontSize: 11, color: "#64748b", lineHeight: 1.5 }}>{r.text}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* AI Comment Generator */}
        <div style={{ padding: "16px 20px", flex: 1 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: "#64748b", marginBottom: 12, textTransform: "uppercase", letterSpacing: 1 }}>AI Comment Generator</div>

          {/* Tone chips */}
          <div style={{ marginBottom: 10 }}>
            <label style={{ fontSize: 11, color: "#64748b", display: "block", marginBottom: 6 }}>Tone <span style={{ color: "#475569", fontWeight: 400 }}>(select multiple)</span></label>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {["Professional", "Casual", "Empathetic", "Authoritative", "Conversational", "Humorous"].map(t => {
                const active = tones.includes(t);
                return (
                  <button
                    key={t}
                    onClick={() => setTones(prev => active ? prev.filter(x => x !== t) : [...prev, t])}
                    style={{
                      padding: "4px 12px", borderRadius: 99, fontSize: 11, fontWeight: 600, cursor: "pointer",
                      border: `1px solid ${active ? ORANGE : BORDER}`,
                      background: active ? "rgba(232,93,47,0.15)" : "transparent",
                      color: active ? ORANGE : "#64748b",
                      transition: "all 0.12s",
                    }}
                  >{t}</button>
                );
              })}
            </div>
          </div>

          {/* Length + History row */}
          <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
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
                    <div key={h.version} onClick={() => { setGeneratedComment(h.text); setHasGenerated(true); setShowHistory(false); }} style={{ background: "#162032", border: `1px solid ${BORDER}`, borderRadius: 6, padding: "10px 12px", cursor: "pointer" }}>
                      <div style={{ fontSize: 12, fontWeight: 700, color: "#fff", marginBottom: 3 }}>Version {h.version}</div>
                      <div style={{ fontSize: 11, color: "#64748b", marginBottom: 6 }}>{h.date}</div>
                      <div style={{ fontSize: 11, color: "#94a3b8", lineHeight: 1.5, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" as const }}>{h.text}</div>
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
              <><span style={{ display: "inline-block", width: 14, height: 14, border: "2px solid #fdba74", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />Generating...</>
            ) : hasGenerated ? "✦ Regenerate" : "✦ Generate Comment"}
          </button>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

          {/* Generated comment output */}
          <textarea
            readOnly
            value={generatedComment}
            placeholder="Generated comment will appear here..."
            style={{ width: "100%", background: "#0a0f1a", border: `1px solid ${hasGenerated ? "#334155" : BORDER}`, color: hasGenerated ? "#e2e8f0" : "#475569", padding: "10px 12px", borderRadius: 8, fontSize: 12, resize: "none", outline: "none", lineHeight: 1.5, boxSizing: "border-box", height: 100, marginBottom: hasGenerated ? 8 : 12 }}
          />

          {/* Refine row — only shown after generation */}
          {hasGenerated && (
            <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
              <input
                value={prompt}
                onChange={e => setPrompt(e.target.value)}
                placeholder="Add instructions to refine..."
                style={{ flex: 1, background: "#111827", border: `1px solid ${BORDER}`, color: "#e2e8f0", padding: "8px 12px", borderRadius: 8, fontSize: 12, outline: "none" }}
              />
              <button
                onClick={handleGenerate}
                style={{ flex: 1, background: "#162032", border: `1px solid ${BORDER}`, color: "#94a3b8", padding: "8px 12px", borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap" }}
              >
                ↻ Regenerate
              </button>
            </div>
          )}

          {/* Upvote boost */}
          <div style={{ background: "#111827", border: `1px solid ${BORDER}`, borderRadius: 8, padding: "12px 14px", marginBottom: 12 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: "#e2e8f0", marginBottom: 6 }}>
              Add Upvotes <span style={{ fontSize: 11, color: "#64748b", fontWeight: 400 }}>· 0.2 credits each</span>
            </div>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {[0, 5, 10, 25, 50].map(q => (
                <button
                  key={q}
                  onClick={() => setUpvoteQty(q)}
                  style={{
                    padding: "4px 14px", borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: "pointer",
                    border: `1px solid ${upvoteQty === q ? ORANGE : BORDER}`,
                    background: upvoteQty === q ? "rgba(232,93,47,0.15)" : "transparent",
                    color: upvoteQty === q ? ORANGE : "#64748b",
                  }}
                >{q === 0 ? "None" : `+${q}`}</button>
              ))}
            </div>
            {upvoteQty > 0 && (
              <div style={{ fontSize: 11, color: "#64748b", marginTop: 6 }}>{upvoteQty} upvotes · {(upvoteQty * 0.2).toFixed(1)} credits</div>
            )}
          </div>

          <button
            onClick={() => setShowModal(true)}
            style={{ width: "100%", background: "#162032", border: `1px solid ${ORANGE}`, color: ORANGE, padding: "10px", borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}
          >
            <span>Create Task</span>
            <span style={{ background: ORANGE, color: "#fff", padding: "2px 8px", borderRadius: 4, fontSize: 11, fontWeight: 700 }}>{totalCost.toFixed(1)} Credits</span>
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

            {/* Rank My Comment toggle */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12, background: "#162032", border: `1px solid ${BORDER}`, borderRadius: 8, padding: "10px 14px" }}>
              <div>
                <div style={{ fontSize: 12, fontWeight: 600, color: "#e2e8f0" }}>Rank My Comment</div>
                <div style={{ fontSize: 11, color: "#64748b" }}>Add upvote boosts to increase visibility</div>
              </div>
              <div onClick={() => setRankToggle(!rankToggle)} style={{ width: 40, height: 22, borderRadius: 99, cursor: "pointer", position: "relative", background: rankToggle ? ORANGE : "#334155", transition: "background 0.2s", flexShrink: 0 }}>
                <div style={{ position: "absolute", top: 3, left: rankToggle ? 20 : 3, width: 16, height: 16, borderRadius: "50%", background: "#fff", transition: "left 0.2s" }} />
              </div>
            </div>

            {/* Boost qty — only shown when Rank My Comment is on */}
            {rankToggle && (
              <div style={{ background: "#162032", border: `1px solid ${BORDER}`, borderRadius: 8, padding: "12px 14px", marginBottom: 12 }}>
                <div style={{ fontSize: 12, color: "#94a3b8", marginBottom: 10, fontWeight: 600 }}>Number of upvote boosts: <span style={{ color: "#fff" }}>{boostQty}</span> <span style={{ color: "#64748b", fontWeight: 400 }}>({boostQty} credits)</span></div>
                <div style={{ display: "flex", gap: 8 }}>
                  {[5, 10, 20].map(q => (
                    <button
                      key={q}
                      onClick={() => setBoostQty(q)}
                      style={{
                        padding: "6px 18px", borderRadius: 7, fontSize: 13, fontWeight: 700, cursor: "pointer",
                        border: `1px solid ${boostQty === q ? ORANGE : BORDER}`,
                        background: boostQty === q ? "rgba(232,93,47,0.15)" : "transparent",
                        color: boostQty === q ? ORANGE : "#94a3b8",
                      }}
                    >{q}</button>
                  ))}
                </div>
              </div>
            )}

            <div style={{ marginTop: 4, marginBottom: 14 }}>
              <label style={{ fontSize: 12, color: "#64748b", display: "block", marginBottom: 6, textTransform: "uppercase", letterSpacing: 1, fontWeight: 700 }}>Schedule</label>
              <input type="datetime-local" value={scheduleDate} onChange={(e) => setScheduleDate(e.target.value)} style={{ width: "100%", background: "#162032", border: `1px solid ${BORDER}`, color: "#e2e8f0", padding: "9px 12px", borderRadius: 8, fontSize: 13, outline: "none", boxSizing: "border-box" }} />
            </div>

            {/* Task summary */}
            <div style={{ background: "#0d1520", border: `1px solid ${BORDER}`, borderRadius: 8, padding: "12px 14px", marginBottom: 14 }}>
              <div style={{ fontSize: 11, color: "#64748b", fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 }}>Tasks Summary</div>
              <div style={{ fontSize: 12, color: "#94a3b8", marginBottom: 4 }}>1 main comment task</div>
              {rankToggle && <div style={{ fontSize: 12, color: "#94a3b8", marginBottom: 2 }}>{boostQty} rank boost tasks</div>}
              {upvoteQty > 0 && <div style={{ fontSize: 12, color: "#94a3b8" }}>{upvoteQty} upvote tasks · {(upvoteQty * 0.2).toFixed(1)} credits</div>}
            </div>

            {/* Total + balance */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
              <span style={{ fontSize: 14, fontWeight: 700, color: "#fff" }}>Total: {totalCost} credits</span>
              <span style={{ fontSize: 12, color: "#64748b" }}>Your balance: {BALANCE} credits</span>
            </div>
            {!canAfford && (
              <div style={{ marginBottom: 12 }}>
                <div style={{ fontSize: 12, color: "#f87171", marginBottom: 4 }}>You need {Math.ceil(totalCost - BALANCE)} more credits</div>
                <a href="/studio/billing" style={{ fontSize: 12, color: ORANGE, fontWeight: 600, textDecoration: "none" }}>Top Up Credits →</a>
              </div>
            )}

            <div style={{ display: "flex", gap: 10, marginTop: canAfford ? 14 : 6 }}>
              <button onClick={() => setShowModal(false)} style={{ flex: 1, background: "transparent", border: `1px solid ${BORDER}`, color: "#94a3b8", padding: "10px", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer" }}>Cancel</button>
              {canAfford ? (
                <button onClick={() => setShowModal(false)} style={{ flex: 2, background: ORANGE, color: "#fff", border: "none", padding: "10px", borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: "pointer" }}>✓ Confirm Task</button>
              ) : (
                <button disabled style={{ flex: 2, background: "#1e293b", color: "#475569", border: `1px solid ${BORDER}`, padding: "10px", borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: "not-allowed" }}>Insufficient Credits</button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
