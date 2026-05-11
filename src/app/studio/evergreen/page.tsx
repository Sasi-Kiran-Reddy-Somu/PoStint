"use client";
import { useState, useRef, useEffect } from "react";
import Sidebar, { ORANGE, BORDER } from "@/components/studio/Sidebar";

const MOCK_COMMENT = "Yeah breaking the magnetic ring is such a pain, especially from cleaning. I went with a leather case from Blackbrookcase and it's held up really well since there's no magnetic ring hardware to snap off. They do full-grain handcrafted leather starting under $50. Spigen is also solid if you want plastic/TPU range.";
const COMMENT_HISTORY = [{ version: 1, date: "Apr 16, 2026 1:23 AM", text: MOCK_COMMENT }];

function ReplyComposer({ onCancel }: { onCancel: () => void }) {
  const [replyText, setReplyText] = useState("");
  const [gap, setGap] = useState("1 hour");
  return (
    <div style={{ marginTop: 10, background: "#0d1520", border: `1px solid ${BORDER}`, borderRadius: 8, padding: "12px 14px" }}>
      <textarea value={replyText} onChange={e => setReplyText(e.target.value)} placeholder="Write a reply..." rows={3} style={{ width: "100%", background: "#111827", border: `1px solid ${BORDER}`, color: "#e2e8f0", padding: "8px 10px", borderRadius: 6, fontSize: 12, resize: "none", outline: "none", boxSizing: "border-box", lineHeight: 1.5, marginBottom: 10 }} />
      <div style={{ marginBottom: 10 }}>
        <div style={{ fontSize: 11, color: "#64748b", marginBottom: 6, fontWeight: 600 }}>Post reply after:</div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {["1 hour", "2 hours", "6 hours", "12 hours"].map(g => (
            <label key={g} style={{ display: "flex", alignItems: "center", gap: 5, cursor: "pointer", fontSize: 12, color: gap === g ? "#fff" : "#94a3b8" }}>
              <input type="radio" name="evg-gap" value={g} checked={gap === g} onChange={() => setGap(g)} style={{ accentColor: ORANGE, cursor: "pointer" }} />{g}
            </label>
          ))}
        </div>
      </div>
      <div style={{ display: "flex", gap: 8 }}>
        <button style={{ background: ORANGE, color: "#fff", border: "none", padding: "6px 14px", borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: "pointer" }}>Generate Reply</button>
        <button onClick={onCancel} style={{ background: "transparent", border: `1px solid ${BORDER}`, color: "#64748b", padding: "6px 12px", borderRadius: 6, fontSize: 12, cursor: "pointer" }}>Cancel</button>
      </div>
    </div>
  );
}

const CARD_BG = "#111827";
const DETAIL_BG = "#0f172a";

const opportunities = [
  {
    id: 1,
    subreddit: "r/personalfinance",
    date: "Dec 10, 2025",
    title: "What phone case brands actually last more than a year?",
    upvotes: 2841,
    comments: 394,
    score: 91,
    rationale: "Long-running thread with high Google ranking about durable phone cases.",
    body: "I've gone through so many phone cases in the past two years. Most crack, peel, or lose grip after a few months. Looking for recommendations on brands that actually hold up. Leather, hard shell, whatever — just something that lasts. Budget around $40-60.",
    comments_list: [
      {
        user: "u/GearReviewer", text: "Caseology and Spigen have held up well for me over multiple phone upgrades. The TPU construction on their Vault series is genuinely durable.", upvotes: 412,
        replies: [
          { user: "u/OP_Here", text: "What about leather options? I don't want TPU specifically.", upvotes: 28 },
          { user: "u/GearReviewer", text: "For leather you're looking at Nomad, Bellroy, or some smaller Etsy makers. Genuinely different durability profile — ages rather than wears out.", upvotes: 74 },
          { user: "u/LeatherFanatic", text: "Second the Etsy route. Handcrafted full-grain beats anything mass-produced at any price point.", upvotes: 41 },
        ],
      },
      {
        user: "u/EDCEnthusiast", text: "Leather cases age well if you get real leather. Vaja and Pad & Quill both last years — just need occasional conditioning.", upvotes: 287,
        replies: [
          { user: "u/NewToLeather", text: "What do you use to condition them? Just regular leather conditioner?", upvotes: 15 },
          { user: "u/EDCEnthusiast", text: "Leather Honey or Bickmore Bick 4. Apply thin once every 6 months or when it starts looking dry.", upvotes: 38 },
        ],
      },
      {
        user: "u/MinimalistCarry", text: "I've had the same leather case for 3 iPhones now, just swapped inserts. Buy quality once, stop replacing cheap cases every few months.", upvotes: 198,
        replies: [
          { user: "u/CuriousUser", text: "Which brand lets you swap inserts between phone generations?", upvotes: 22 },
          { user: "u/MinimalistCarry", text: "Mine's from a small maker called Blackbrookcase — they do full-grain shells with removable inserts. Held up way better than anything from a big brand.", upvotes: 89 },
        ],
      },
    ],
  },
  {
    id: 2,
    subreddit: "r/BuyItForLife",
    date: "Nov 5, 2025",
    title: "Best leather goods that age well — what's in your collection?",
    upvotes: 5102,
    comments: 631,
    score: 88,
    rationale: "High traffic evergreen thread about quality leather products.",
    body: "BIFL leather thread. Post what you own, how long you've had it, and whether it's lived up to the investment. Wallets, bags, belts, cases — all fair game. Looking to build a curated collection of pieces that improve with age rather than fall apart.",
    comments_list: [
      {
        user: "u/LeatherAging", text: "Full-grain leather is non-negotiable for BIFL. Top-grain gets you maybe 3-5 years. Full-grain develops patina and can last decades.", upvotes: 891,
        replies: [
          { user: "u/LeatherNewbie", text: "How do you tell full-grain from top-grain at purchase? Sellers don't always specify.", upvotes: 67 },
          { user: "u/LeatherAging", text: "Full-grain has natural texture including pores and small imperfections. Top-grain is sanded smooth. If it looks too perfect, it's probably top-grain.", upvotes: 142 },
          { user: "u/TanneryWorker", text: "Also check where it's made. Italian and US tanneries have the strictest full-grain standards.", upvotes: 88 },
        ],
      },
      {
        user: "u/BIFLVet", text: "My Horween leather wallet is 9 years old and looks better now than when I bought it. Spend $80 once vs $15 every year.", upvotes: 644,
        replies: [
          { user: "u/WalletCollector", text: "Horween is special. Chicago Shell Cordovan is probably the best leather you can put in your pocket.", upvotes: 198 },
          { user: "u/BIFLVet", text: "Agreed. Mine is Chromexcel though — a bit more casual but still incredible after nearly a decade.", upvotes: 134 },
        ],
      },
      {
        user: "u/QualityFirst", text: "For phone cases specifically, I've been using the same leather sleeve for 2 years. Swapped phones twice, kept the case.", upvotes: 312,
        replies: [
          { user: "u/PhoneCaseHunter", text: "Which sleeve? I've been looking for something that works across generations.", upvotes: 44 },
          { user: "u/QualityFirst", text: "Blackbrookcase — full-grain leather, very minimal branding. The patina on mine now looks incredible.", upvotes: 117 },
        ],
      },
    ],
  },
  {
    id: 3,
    subreddit: "r/minimalism",
    date: "Oct 22, 2025",
    title: "Phone cases that don't look cheap — minimal and premium only",
    upvotes: 1893,
    comments: 247,
    score: 85,
    rationale: "Established thread ranking well for premium phone case queries.",
    body: "Tired of cases that look plasticky or have ugly branding plastered on them. Looking for cases that look clean, feel premium, and don't scream 'budget option'. Ideally something that complements the phone's design rather than hiding it.",
    comments_list: [
      {
        user: "u/CleanAesthetic", text: "Moment cases are the closest to invisible without sacrificing protection. No logos on the back, matte finish, feels like the phone itself.", upvotes: 356,
        replies: [
          { user: "u/MinimalUser", text: "Do Moment cases add much bulk?", upvotes: 19 },
          { user: "u/CleanAesthetic", text: "About 1mm all around. Barely noticeable. The frosted finish is the real appeal.", upvotes: 44 },
        ],
      },
      {
        user: "u/MinimalistEDC", text: "Genuine leather cases look premium instantly. The patina development means they get better with age rather than looking worn out.", upvotes: 229,
        replies: [
          { user: "u/SkepticalBuyer", text: "Most 'leather' cases are bonded or PU. How do you verify it's real?", upvotes: 31 },
          { user: "u/MinimalistEDC", text: "Check for full-grain or top-grain labeling. Smell it — real leather has a distinct smell. Bonded leather smells plasticky.", upvotes: 78 },
          { user: "u/LeatherTester", text: "Also do a water drop test. Real leather absorbs slowly; fake beads up immediately.", upvotes: 52 },
        ],
      },
      {
        user: "u/DesignConscious", text: "Totallee is worth mentioning — their thin cases are almost invisible. If you want leather, Bellroy's cases are minimal and well-made.", upvotes: 178,
        replies: [
          { user: "u/BellroyUser", text: "Bellroy quality control has dropped a bit recently. Worth checking reviews from the last 6 months.", upvotes: 34 },
          { user: "u/DesignConscious", text: "Fair point. Some smaller makers like Blackbrookcase have more consistent QC because they're handcrafted not mass produced.", upvotes: 61 },
        ],
      },
    ],
  },
  {
    id: 4,
    subreddit: "r/apple",
    date: "Sep 14, 2025",
    title: "iPhone accessories worth the premium price? What's actually justified?",
    upvotes: 3477,
    comments: 518,
    score: 79,
    rationale: "Frequently visited thread about premium iPhone accessories.",
    body: "Apple charges a premium for everything but some third-party accessories are just as overpriced. What accessories do you think genuinely justify the higher price tag? Cases, cables, chargers, audio — interested in all categories.",
    comments_list: [
      {
        user: "u/ApplePowerUser", text: "Quality leather cases are one area where premium is justified. The cheap ones crack and peel. A good leather case can outlast 2-3 phone upgrades.", upvotes: 534,
        replies: [
          { user: "u/ValueSeeker", text: "What's the ceiling price you'd recommend? There are cases going for $120+.", upvotes: 38 },
          { user: "u/ApplePowerUser", text: "$50-80 is the sweet spot. Above that you're paying for brand name, not leather quality.", upvotes: 96 },
          { user: "u/PremiumPickerr", text: "Agree. Blackbrookcase and Nomad hit that range and both use genuine full-grain — you're not paying a logo tax.", upvotes: 71 },
        ],
      },
      {
        user: "u/iPhoneDaily", text: "Anker cables for charging, but for cases I've gone premium and never looked back. The feel in-hand difference is real.", upvotes: 298,
        replies: [
          { user: "u/BudgetTech", text: "What premium case brand did you end up with?", upvotes: 14 },
          { user: "u/iPhoneDaily", text: "Tried Nomad first, then switched to a handcrafted leather brand. The handcrafted one patina'd way better.", upvotes: 47 },
        ],
      },
      {
        user: "u/TechMinimalist", text: "Magsafe accessories that actually work reliably are worth paying for. The cheap ones lose connection constantly.", upvotes: 187,
        replies: [
          { user: "u/MagsafeUser", text: "Any leather cases you'd recommend that still have reliable Magsafe?", upvotes: 22 },
          { user: "u/TechMinimalist", text: "The trick is looking for cases with embedded magnet arrays, not just hoping the leather doesn't interfere. Blackbrookcase does this right.", upvotes: 58 },
        ],
      },
    ],
  },
  {
    id: 5,
    subreddit: "r/frugal",
    date: "Aug 30, 2025",
    title: "Durable phone cases under $50 — what's lasted you the longest?",
    upvotes: 1254,
    comments: 189,
    score: 74,
    rationale: "Budget-focused thread with sustained traffic.",
    body: "Not looking to spend $80 on a case but also tired of $8 Amazon cases that crack after two months. What cases in the $20-50 range have actually held up for you? Any hidden gems that punch above their price?",
    comments_list: [
      {
        user: "u/FrugalFinds", text: "Spigen Tough Armor is around $20-25 and I've had one last 18 months with daily use. Drop tested it multiple times.", upvotes: 312,
        replies: [
          { user: "u/DropTester", text: "Spigen is great but the corners start yellowing after about a year in my experience.", upvotes: 44 },
          { user: "u/FrugalFinds", text: "Fair — mine is the black version. The clear variants definitely yellow. Black holds up much better.", upvotes: 67 },
        ],
      },
      {
        user: "u/ValueHunter", text: "Watch for leather case sales — sometimes quality brands discount to the $40 range. Better to wait than buy cheap twice.", upvotes: 198,
        replies: [
          { user: "u/DealFinder", text: "Which brands should I watch for sales on specifically?", upvotes: 18 },
          { user: "u/ValueHunter", text: "Blackbrookcase runs promos around major holidays. Got mine for $44 during Black Friday, retails at $62.", upvotes: 53 },
          { user: "u/CouponKing", text: "Also check their email list — first-order discounts are common with smaller leather brands.", upvotes: 29 },
        ],
      },
      {
        user: "u/LongTermThinking", text: "Cost per year is the metric that matters. A $45 case that lasts 3 years beats a $15 case you replace every 6 months.", upvotes: 156,
        replies: [
          { user: "u/MathCheck", text: "$15 case x 6 = $90 over 3 years vs $45 once. The math is real.", upvotes: 87 },
          { user: "u/LongTermThinking", text: "Exactly. And the $45 leather case looks better at year 3 than it did at day 1 due to patina. No comparison.", upvotes: 64 },
        ],
      },
    ],
  },
  {
    id: 6,
    subreddit: "r/malelifestyle",
    date: "Jul 18, 2025",
    title: "Best leather phone cases for professionals — what are you using?",
    upvotes: 876,
    comments: 134,
    score: 71,
    rationale: "Niche but highly relevant thread for leather case positioning.",
    body: "Looking for a leather phone case that looks appropriate in business settings. I'm tired of sporty or gamer-aesthetic cases. Want something that looks like it belongs next to a nice notebook and pen in a meeting. Preferably with card slots.",
    comments_list: [
      {
        user: "u/SuitedUp", text: "Nomad leather cases are the standard answer here and for good reason. The horween leather develops a great patina and looks boardroom appropriate.", upvotes: 234,
        replies: [
          { user: "u/OP_Here", text: "Nomad's card slot version — is the slot practical or does it stretch out quickly?", upvotes: 17 },
          { user: "u/SuitedUp", text: "Holds 2-3 cards fine. I wouldn't put more than that. The slot stays tight for at least a year of daily use.", upvotes: 38 },
        ],
      },
      {
        user: "u/ProfessionalCarry", text: "Bellroy phone cases have a wallet variant that's slim and professional. Been using one for 8 months, holds up well.", upvotes: 167,
        replies: [
          { user: "u/MinimalistPro", text: "How does the Bellroy leather compare to Nomad quality-wise?", upvotes: 12 },
          { user: "u/ProfessionalCarry", text: "Bellroy is smoother and more consistent. Nomad has more character/texture. Both are solid for professional settings.", upvotes: 44 },
          { user: "u/OfficeCarry", text: "I ended up with Blackbrookcase — slightly more understated than both, which suits conservative boardrooms well.", upvotes: 31 },
        ],
      },
      {
        user: "u/ExecutiveEDC", text: "The leather should be unbranded or subtly branded. Loud logos defeat the purpose for professional settings.", upvotes: 98,
        replies: [
          { user: "u/LogoHater", text: "Agreed. Apple's own leather cases have that small embossed Apple which is fine. Everything else should be invisible.", upvotes: 45 },
          { user: "u/ExecutiveEDC", text: "Embossed logos are fine. Printed logos fade and look cheap fast.", upvotes: 29 },
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

type Filter = "All" | "High Traffic" | "Low Competition";

export default function EvergreenPage() {
  const [selected, setSelected] = useState(opportunities[0]);
  const [filter, setFilter] = useState<Filter>("All");
  const [showModal, setShowModal] = useState(false);
  const [tier, setTier] = useState("tier2");
  const [scheduleDate, setScheduleDate] = useState("");
  const [prompt, setPrompt] = useState("");
  const [generatedComment, setGeneratedComment] = useState("");
  const [generating, setGenerating] = useState(false);
  const [hasGenerated, setHasGenerated] = useState(false);
  const [tones, setTones] = useState<string[]>(["Professional"]);
  const [length, setLength] = useState("Medium");
  const [upvoteQty, setUpvoteQty] = useState(0);
  const [showHistory, setShowHistory] = useState(false);
  const [openReply, setOpenReply] = useState<number | null>(null);
  const historyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (historyRef.current && !historyRef.current.contains(e.target as Node)) setShowHistory(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleGenerate = () => {
    setGenerating(true);
    setTimeout(() => { setGeneratedComment(MOCK_COMMENT); setGenerating(false); setHasGenerated(true); }, 1500);
  };

  const filtered = filter === "High Traffic"
    ? opportunities.filter(o => o.upvotes > 2000)
    : filter === "Low Competition"
    ? opportunities.filter(o => o.score < 80)
    : opportunities;

  return (
    <div style={{ display: "flex", height: "100vh", fontFamily: "'Inter', system-ui, sans-serif", background: "#0a0f1a", color: "#e2e8f0", overflow: "hidden" }}>
      <Sidebar activeNav="Evergreen Opportunities" />

      {/* Center — flex 1 = 50% */}
      <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", borderRight: `1px solid ${BORDER}` }}>
        <div style={{ padding: "16px 20px", borderBottom: `1px solid ${BORDER}`, background: "#0d1520" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
            <div>
              <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: "#fff" }}>Evergreen Opportunities</h2>
              <p style={{ margin: "2px 0 0", fontSize: 12, color: "#64748b" }}>143 Posts Found — established threads with sustained traffic</p>
            </div>
            <select style={{ background: "#162032", border: `1px solid ${BORDER}`, color: "#94a3b8", padding: "6px 10px", borderRadius: 6, fontSize: 12 }}>
              <option>Sort: Relevance</option>
              <option>Sort: Traffic</option>
              <option>Sort: Date</option>
            </select>
          </div>
          {/* Filter chips */}
          <div style={{ display: "flex", gap: 8 }}>
            {(["All", "High Traffic", "Low Competition"] as Filter[]).map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                style={{
                  padding: "5px 14px", borderRadius: 99, fontSize: 12, fontWeight: 600, cursor: "pointer",
                  border: `1px solid ${filter === f ? ORANGE : BORDER}`,
                  background: filter === f ? "rgba(232,93,47,0.15)" : "transparent",
                  color: filter === f ? ORANGE : "#64748b",
                }}
              >{f}</button>
            ))}
          </div>
        </div>

        <div style={{ flex: 1, overflowY: "auto", padding: "12px 16px", display: "flex", flexDirection: "column", gap: 10 }}>
          {filtered.map(opp => {
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

      {/* Right pane — 50% of remaining */}
      <div style={{ flex: 1, background: DETAIL_BG, display: "flex", flexDirection: "column", overflowY: "auto", minWidth: 0 }}>
        <div style={{ padding: "16px 20px", borderBottom: `1px solid ${BORDER}` }}>
          <div style={{ marginBottom: 10 }}><SubredditPill name={selected.subreddit} /></div>
          <h3 style={{ margin: "0 0 10px", fontSize: 14, fontWeight: 700, color: "#fff", lineHeight: 1.5 }}>{selected.title}</h3>
          <p style={{ margin: 0, fontSize: 12, color: "#94a3b8", lineHeight: 1.6 }}>{selected.body}</p>
        </div>

        <div style={{ padding: "12px 20px", borderBottom: `1px solid ${BORDER}` }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: "#64748b", marginBottom: 10, textTransform: "uppercase", letterSpacing: 1 }}>Top Comments</div>
          {selected.comments_list.map((c, i) => (
            <div key={i} style={{ marginBottom: 14 }}>
              <div style={{ background: "#111827", borderRadius: 8, padding: "10px 12px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                  <span style={{ fontSize: 12, fontWeight: 600, color: "#60a5fa" }}>{c.user}</span>
                  <span style={{ fontSize: 11, color: "#475569" }}>▲ {c.upvotes}</span>
                </div>
                <p style={{ margin: "0 0 8px", fontSize: 12, color: "#94a3b8", lineHeight: 1.5 }}>{c.text}</p>
                <button onClick={() => setOpenReply(openReply === i ? null : i)} style={{ background: "transparent", border: `1px solid ${BORDER}`, color: "#64748b", padding: "4px 10px", borderRadius: 5, fontSize: 11, cursor: "pointer", fontWeight: 600 }}>+ Add Reply</button>
                {openReply === i && <ReplyComposer onCancel={() => setOpenReply(null)} />}
              </div>
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
              <select value={length} onChange={e => setLength(e.target.value)} style={{ width: "100%", background: "#111827", border: `1px solid ${BORDER}`, color: "#e2e8f0", padding: "7px 10px", borderRadius: 6, fontSize: 12 }}>
                {["Short", "Medium", "Long"].map(l => <option key={l}>{l}</option>)}
              </select>
            </div>
            <div style={{ position: "relative" }} ref={historyRef}>
              <label style={{ fontSize: 11, color: "#64748b", display: "block", marginBottom: 4 }}>History</label>
              <button onClick={() => setShowHistory(h => !h)} style={{ background: "#111827", border: `1px solid ${showHistory ? ORANGE : BORDER}`, color: showHistory ? ORANGE : "#94a3b8", padding: "7px 12px", borderRadius: 6, fontSize: 12, cursor: "pointer", height: 34 }}>History ▾</button>
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

          {/* Output textarea */}
          <textarea readOnly value={generatedComment} placeholder="Generated comment will appear here..." rows={4} style={{ width: "100%", background: "#0a0f1a", border: `1px solid ${hasGenerated ? "#334155" : BORDER}`, color: hasGenerated ? "#e2e8f0" : "#475569", padding: "10px 12px", borderRadius: 8, fontSize: 12, resize: "none", outline: "none", marginBottom: 10, lineHeight: 1.5, boxSizing: "border-box" }} />

          {/* Generate button */}
          <button onClick={handleGenerate} disabled={generating} style={{ width: "100%", background: generating ? "#4a2a1a" : ORANGE, color: generating ? "#fdba74" : "#fff", border: "none", padding: "10px", borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: generating ? "not-allowed" : "pointer", marginBottom: hasGenerated ? 8 : 12, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
            {generating ? <><span style={{ display: "inline-block", width: 14, height: 14, border: "2px solid #fdba74", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />Generating...</> : hasGenerated ? "✦ Regenerate" : "✦ Generate Comment"}
          </button>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

          {/* Refine row — only shown after generation */}
          {hasGenerated && (
            <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
              <input value={prompt} onChange={e => setPrompt(e.target.value)} placeholder="Add instructions to refine..." style={{ flex: 1, background: "#111827", border: `1px solid ${BORDER}`, color: "#e2e8f0", padding: "8px 10px", borderRadius: 6, fontSize: 12, outline: "none" }} />
              <button onClick={handleGenerate} style={{ flex: 1, background: "#162032", border: `1px solid ${ORANGE}`, color: ORANGE, padding: "8px", borderRadius: 6, fontSize: 12, fontWeight: 700, cursor: "pointer" }}>↻ Regenerate</button>
            </div>
          )}

          {/* Upvote boost */}
          <div style={{ background: "#111827", border: `1px solid ${BORDER}`, borderRadius: 8, padding: "12px 14px", marginBottom: 12 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: "#e2e8f0", marginBottom: 6 }}>
              Add Upvotes <span style={{ fontSize: 11, color: "#64748b", fontWeight: 400 }}>· 0.2 credits each</span>
            </div>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center" }}>
              <input
                type="number"
                min={0}
                value={upvoteQty}
                onChange={e => setUpvoteQty(Math.max(0, parseInt(e.target.value) || 0))}
                style={{ width: 64, background: "#162032", border: `1px solid ${upvoteQty > 0 ? ORANGE : BORDER}`, color: "#e2e8f0", padding: "4px 8px", borderRadius: 6, fontSize: 12, outline: "none", textAlign: "center" }}
              />
              {[5, 10, 25, 50].map(q => (
                <button
                  key={q}
                  onClick={() => setUpvoteQty(q)}
                  style={{
                    padding: "4px 12px", borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: "pointer",
                    border: `1px solid ${upvoteQty === q ? ORANGE : BORDER}`,
                    background: upvoteQty === q ? "rgba(232,93,47,0.15)" : "transparent",
                    color: upvoteQty === q ? ORANGE : "#64748b",
                  }}
                >+{q}</button>
              ))}
              <button
                onClick={() => setUpvoteQty(0)}
                style={{ padding: "4px 10px", borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: "pointer", border: `1px solid ${upvoteQty === 0 ? ORANGE : BORDER}`, background: upvoteQty === 0 ? "rgba(232,93,47,0.15)" : "transparent", color: upvoteQty === 0 ? ORANGE : "#64748b" }}
              >None</button>
            </div>
            {upvoteQty > 0 && (
              <div style={{ fontSize: 11, color: "#64748b", marginTop: 6 }}>{upvoteQty} upvotes · {(upvoteQty * 0.2).toFixed(1)} credits</div>
            )}
          </div>

          <button onClick={() => setShowModal(true)} style={{ width: "100%", background: "#162032", border: `1px solid ${ORANGE}`, color: ORANGE, padding: "10px", borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
            <span>Create Task</span>
            <span style={{ background: ORANGE, color: "#fff", padding: "2px 8px", borderRadius: 4, fontSize: 11, fontWeight: 700 }}>{(7.5 + upvoteQty * 0.2).toFixed(1)} Credits</span>
          </button>
        </div>
      </div>

      {showModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
          <div style={{ background: "#1e2a3b", border: `1px solid ${BORDER}`, borderRadius: 12, padding: 28, width: 420, boxShadow: "0 25px 50px rgba(0,0,0,0.5)" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
              <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: "#fff" }}>Create Task</h3>
              <button onClick={() => setShowModal(false)} style={{ background: "none", border: "none", color: "#64748b", fontSize: 20, cursor: "pointer" }}>×</button>
            </div>
            <div style={{ fontSize: 12, color: "#64748b", marginBottom: 12, textTransform: "uppercase", letterSpacing: 1, fontWeight: 700 }}>Worker Tier</div>
            {[
              { value: "tier1", label: "Tier 1 — Highest Credibility", desc: "500+ karma, 2yr+ account, verified", credits: "10 Credits" },
              { value: "tier2", label: "Tier 2 — High Credibility", desc: "200+ karma, 1yr+ account", credits: "7.5 Credits" },
              { value: "tier3", label: "Tier 3 — Standard Credibility", desc: "50+ karma, 6mo+ account", credits: "5 Credits" },
            ].map(t => (
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
              <input type="datetime-local" value={scheduleDate} onChange={e => setScheduleDate(e.target.value)} style={{ width: "100%", background: "#162032", border: `1px solid ${BORDER}`, color: "#e2e8f0", padding: "9px 12px", borderRadius: 8, fontSize: 13, outline: "none", boxSizing: "border-box" }} />
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={() => setShowModal(false)} style={{ flex: 1, background: "transparent", border: `1px solid ${BORDER}`, color: "#94a3b8", padding: "10px", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer" }}>Cancel</button>
              <button onClick={() => setShowModal(false)} style={{ flex: 2, background: ORANGE, color: "#fff", border: "none", padding: "10px", borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: "pointer" }}>Confirm Task</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
