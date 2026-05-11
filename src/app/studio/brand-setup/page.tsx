"use client";
import { useState, KeyboardEvent } from "react";
import Sidebar, { ORANGE, BORDER } from "@/components/studio/Sidebar";

const BG = "#0a0f1a";
const SURFACE = "#1e2a3b";
const SURFACE2 = "#162032";
const INPUT_BG = "#162032";
const TEXT = "#e2e8f0";
const MUTED = "#64748b";
const MUTED2 = "#94a3b8";

type Tab = "Brand Basics" | "Keywords & Prompts" | "Competitors";
const TABS: Tab[] = ["Brand Basics", "Keywords & Prompts", "Competitors"];

/* ── Reusable primitives ── */
function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 18 }}>
      <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: MUTED2, marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.05em" }}>
        {label}{required && <span style={{ color: ORANGE, marginLeft: 3 }}>*</span>}
      </label>
      {children}
    </div>
  );
}

function TextInput({ value, onChange, placeholder, disabled }: { value: string; onChange: (v: string) => void; placeholder?: string; disabled?: boolean }) {
  return (
    <input
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      disabled={disabled}
      style={{ width: "100%", background: INPUT_BG, border: `1px solid ${BORDER}`, color: TEXT, padding: "9px 12px", borderRadius: 8, fontSize: 13, outline: "none", boxSizing: "border-box" }}
    />
  );
}

function TextArea({ value, onChange, placeholder, rows = 4, maxLen }: { value: string; onChange: (v: string) => void; placeholder?: string; rows?: number; maxLen?: number }) {
  return (
    <div>
      <textarea
        value={value}
        onChange={e => onChange(maxLen ? e.target.value.slice(0, maxLen) : e.target.value)}
        placeholder={placeholder}
        rows={rows}
        style={{ width: "100%", background: INPUT_BG, border: `1px solid ${BORDER}`, color: TEXT, padding: "9px 12px", borderRadius: 8, fontSize: 13, outline: "none", resize: "vertical", boxSizing: "border-box", lineHeight: 1.6 }}
      />
      {maxLen && <div style={{ textAlign: "right", fontSize: 11, color: value.length < 50 ? "#f87171" : MUTED, marginTop: 4 }}>{value.length}/{maxLen}</div>}
    </div>
  );
}

function TagInput({ tags, onAdd, onRemove, placeholder, max }: { tags: string[]; onAdd: (t: string) => void; onRemove: (i: number) => void; placeholder?: string; max?: number }) {
  const [input, setInput] = useState("");
  const handle = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && input.trim()) {
      e.preventDefault();
      if (max && tags.length >= max) return;
      if (!tags.includes(input.trim())) onAdd(input.trim());
      setInput("");
    }
  };
  return (
    <div style={{ background: INPUT_BG, border: `1px solid ${BORDER}`, borderRadius: 8, padding: "8px 10px", display: "flex", flexWrap: "wrap", gap: 6, minHeight: 44 }}>
      {tags.map((t, i) => (
        <span key={i} style={{ background: "#1e3a5f", color: "#60a5fa", padding: "3px 10px", borderRadius: 99, fontSize: 12, fontWeight: 600, display: "flex", alignItems: "center", gap: 6 }}>
          {t}
          <span onClick={() => onRemove(i)} style={{ cursor: "pointer", color: "#94a3b8", fontWeight: 700, fontSize: 14, lineHeight: 1 }}>×</span>
        </span>
      ))}
      <input
        value={input}
        onChange={e => setInput(e.target.value)}
        onKeyDown={handle}
        placeholder={tags.length === 0 ? placeholder : ""}
        style={{ background: "transparent", border: "none", outline: "none", color: TEXT, fontSize: 13, flex: 1, minWidth: 120 }}
      />
    </div>
  );
}

/* ── Tab data state ── */
interface BrandData {
  brandName: string; domain: string; description: string;
  categories: string[]; geo: string; positioning: string;
}
interface KeywordData {
  keywords: string[]; prompts: string[];
  preferredSubs: string[]; blacklistedSubs: string[];
}
interface Competitor { name: string; domain: string }

/* ── Tab content ── */
function BrandBasicsTab({ data, onChange }: { data: BrandData; onChange: (d: BrandData) => void }) {
  const set = (k: keyof BrandData) => (v: string | string[]) => onChange({ ...data, [k]: v });
  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <Field label="Brand Name" required><TextInput value={data.brandName} onChange={set("brandName") as (v: string) => void} placeholder="e.g. Blackbrookcase" /></Field>
        <Field label="Primary Domain" required><TextInput value={data.domain} onChange={set("domain") as (v: string) => void} placeholder="https://yourbrand.com" /></Field>
      </div>
      <Field label="Brand Description" required>
        <TextArea value={data.description} onChange={set("description") as (v: string) => void} placeholder="Describe your brand, what you sell, and who your customers are. Minimum 50 characters." rows={4} maxLen={500} />
      </Field>
      <Field label="Product Categories">
        <TagInput tags={data.categories} onAdd={t => set("categories")([...data.categories, t])} onRemove={i => set("categories")(data.categories.filter((_, j) => j !== i))} placeholder='Type and press Enter (e.g. "Phone Cases")' />
      </Field>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <Field label="Geographic Focus">
          <select value={data.geo} onChange={e => set("geo")(e.target.value)} style={{ width: "100%", background: INPUT_BG, border: `1px solid ${BORDER}`, color: TEXT, padding: "9px 12px", borderRadius: 8, fontSize: 13, outline: "none" }}>
            {["Global", "US", "UK", "EU", "Asia"].map(g => <option key={g}>{g}</option>)}
          </select>
        </Field>
        <Field label="Positioning Notes">
          <TextInput value={data.positioning} onChange={set("positioning") as (v: string) => void} placeholder="What to emphasize and avoid" />
        </Field>
      </div>
    </div>
  );
}

function KeywordsTab({ data, onChange }: { data: KeywordData; onChange: (d: KeywordData) => void }) {
  const set = (k: keyof KeywordData) => (v: string[]) => onChange({ ...data, [k]: v });
  return (
    <div>
      <Field label="Tracked Keywords" required>
        <TagInput tags={data.keywords} onAdd={t => set("keywords")([...data.keywords, t])} onRemove={i => set("keywords")(data.keywords.filter((_, j) => j !== i))} placeholder='Press Enter to add (e.g. "leather phone case")' />
        {data.keywords.length === 0 && <p style={{ fontSize: 11, color: "#f87171", margin: "6px 0 0" }}>At least 1 keyword required</p>}
      </Field>
      <Field label="Tracked Prompts">
        <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 4 }}>
          <span style={{ fontSize: 11, color: MUTED }}>{data.prompts.length}/25 prompts added</span>
        </div>
        <TagInput tags={data.prompts} onAdd={t => set("prompts")([...data.prompts, t])} onRemove={i => set("prompts")(data.prompts.filter((_, j) => j !== i))} placeholder='e.g. "best phone case for hiking"' max={25} />
      </Field>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <Field label="Preferred Subreddits">
          <TagInput tags={data.preferredSubs} onAdd={t => set("preferredSubs")([...data.preferredSubs, t])} onRemove={i => set("preferredSubs")(data.preferredSubs.filter((_, j) => j !== i))} placeholder='e.g. "r/iphone"' />
        </Field>
        <Field label="Blacklisted Subreddits">
          <TagInput tags={data.blacklistedSubs} onAdd={t => set("blacklistedSubs")([...data.blacklistedSubs, t])} onRemove={i => set("blacklistedSubs")(data.blacklistedSubs.filter((_, j) => j !== i))} placeholder='Subreddits to never engage with' />
        </Field>
      </div>
    </div>
  );
}

function CompetitorsTab({ competitors, onChange }: { competitors: Competitor[]; onChange: (c: Competitor[]) => void }) {
  const [name, setName] = useState("");
  const [domain, setDomain] = useState("");
  const [limitMsg, setLimitMsg] = useState(false);

  const add = () => {
    if (!name.trim()) return;
    if (competitors.length >= 3) { setLimitMsg(true); return; }
    onChange([...competitors, { name: name.trim(), domain: domain.trim() }]);
    setName(""); setDomain(""); setLimitMsg(false);
  };
  const remove = (i: number) => { onChange(competitors.filter((_, j) => j !== i)); setLimitMsg(false); };

  return (
    <div>
      <p style={{ margin: "0 0 20px", fontSize: 13, color: MUTED }}>Add up to 3 competitors to monitor their Reddit mentions. (Basic plan)</p>
      <Field label="Add Competitor">
        <div style={{ display: "flex", gap: 8 }}>
          <input value={name} onChange={e => setName(e.target.value)} placeholder="Competitor name" onKeyDown={e => e.key === "Enter" && add()} style={{ flex: 1, background: INPUT_BG, border: `1px solid ${BORDER}`, color: TEXT, padding: "9px 12px", borderRadius: 8, fontSize: 13, outline: "none" }} />
          <input value={domain} onChange={e => setDomain(e.target.value)} placeholder="https://competitor.com" onKeyDown={e => e.key === "Enter" && add()} style={{ flex: 1, background: INPUT_BG, border: `1px solid ${BORDER}`, color: TEXT, padding: "9px 12px", borderRadius: 8, fontSize: 13, outline: "none" }} />
          <button onClick={add} style={{ background: ORANGE, color: "#fff", border: "none", padding: "9px 16px", borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: "pointer", whiteSpace: "nowrap" }}>+ Add</button>
        </div>
        {limitMsg && (
          <div style={{ marginTop: 10, background: "#2d1a0e", border: "1px solid #7c3e1a", borderRadius: 8, padding: "10px 14px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
            <div>
              <span style={{ fontSize: 13, color: "#fdba74", fontWeight: 600 }}>Upgrade to Pro to add more competitors</span>
              <span style={{ display: "block", fontSize: 11, color: MUTED, marginTop: 2 }}>Basic plan is limited to 3 competitors.</span>
            </div>
            <button style={{ background: ORANGE, color: "#fff", border: "none", padding: "6px 14px", borderRadius: 6, fontSize: 12, fontWeight: 700, cursor: "pointer", flexShrink: 0 }}>Upgrade</button>
          </div>
        )}
      </Field>

      {competitors.length === 0 ? (
        <div style={{ background: SURFACE2, border: `1px dashed ${BORDER}`, borderRadius: 8, padding: "28px 20px", textAlign: "center", color: MUTED, fontSize: 13 }}>
          No competitors added yet. Add up to 3 above.
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {competitors.map((c, i) => (
            <div key={i} style={{ background: SURFACE2, border: `1px solid ${BORDER}`, borderRadius: 8, padding: "12px 16px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: "#fff" }}>{c.name}</div>
                <div style={{ fontSize: 12, color: "#60a5fa" }}>{c.domain || "—"}</div>
              </div>
              <button onClick={() => remove(i)} style={{ background: "none", border: `1px solid #374151`, color: MUTED, borderRadius: 6, padding: "4px 10px", cursor: "pointer", fontSize: 13 }}>× Remove</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ── Toast ── */
function Toast({ visible }: { visible: boolean }) {
  return (
    <div style={{
      position: "fixed", bottom: 32, right: 32, zIndex: 999,
      background: "#14532d", border: "1px solid #166534", color: "#4ade80",
      padding: "14px 20px", borderRadius: 10, fontSize: 13, fontWeight: 600,
      display: "flex", alignItems: "center", gap: 10, boxShadow: "0 10px 30px rgba(0,0,0,0.4)",
      opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(16px)",
      transition: "all 0.3s", pointerEvents: "none",
    }}>
      <span>✓</span> Setup saved successfully.
    </div>
  );
}

/* ── Main Page ── */
export default function BrandSetupPage() {
  const [activeTab, setActiveTab] = useState<Tab>("Brand Basics");
  const [saved, setSaved] = useState(false);
  const [showToast, setShowToast] = useState(false);

  // Pre-filled mock data
  const [brandData, setBrandData] = useState<BrandData>({
    brandName: "Blackbrookcase",
    domain: "https://blackbrookcase.com",
    description: "Blackbrookcase crafts premium full-grain leather phone cases designed to age beautifully. We believe in quality over quantity — every case is hand-stitched in small batches and built to outlast multiple phone upgrades.",
    categories: ["Phone Cases", "Leather Goods", "iPhone Accessories"],
    geo: "US",
    positioning: "Emphasize quality craftsmanship, full-grain leather patina, and long-term value. Avoid comparisons to cheap Amazon alternatives.",
  });
  const [keywordData, setKeywordData] = useState<KeywordData>({
    keywords: ["leather phone case", "iPhone leather case", "premium phone case", "full grain leather case"],
    prompts: ["best leather case for iPhone 15", "leather case that ages well", "MagSafe leather case recommendations"],
    preferredSubs: ["r/iPhone", "r/BuyItForLife", "r/minimalism", "r/Apple"],
    blacklistedSubs: ["r/mildlyinfuriating", "r/unpopularopinion"],
  });
  const [competitors, setCompetitors] = useState<Competitor[]>([
    { name: "Nomad", domain: "https://nomadgoods.com" },
    { name: "Bellroy", domain: "https://bellroy.com" },
  ]);

  const handleSave = () => {
    setSaved(true);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const aiSummary = `Brand: ${brandData.brandName} · ${brandData.domain}
Focus: ${brandData.geo} · ${brandData.categories.join(", ")}
Keywords: ${keywordData.keywords.join(", ")}
Prompts: ${keywordData.prompts.join(", ")}
Competitors: ${competitors.map(c => c.name).join(", ") || "None"}

${brandData.description.slice(0, 200)}${brandData.description.length > 200 ? "..." : ""}`;

  return (
    <div style={{ display: "flex", minHeight: "100vh", fontFamily: "'Inter', system-ui, sans-serif", background: BG, color: TEXT }}>
      <Sidebar activeNav="Brand Setup" />

      <div style={{ flex: 1, overflowY: "auto" }}>
        {/* Top bar with tabs */}
        <div style={{ background: "#0d1520", borderBottom: `1px solid ${BORDER}`, padding: "0 32px", position: "sticky", top: 0, zIndex: 10 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: 20, paddingBottom: 0 }}>
            <div>
              <h1 style={{ margin: "0 0 4px", fontSize: 18, fontWeight: 700, color: "#fff" }}>Brand Setup</h1>
              <p style={{ margin: "0 0 16px", fontSize: 12, color: MUTED }}>Configure how the AI understands and represents your brand on Reddit.</p>
            </div>
            <div style={{ paddingBottom: 16 }}>
              <button
                onClick={handleSave}
                style={{ background: ORANGE, color: "#fff", border: "none", padding: "9px 20px", borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: "pointer" }}
              >
                Save Changes
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div style={{ display: "flex", gap: 0 }}>
            {TABS.map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                style={{
                  padding: "10px 20px", background: "transparent", border: "none",
                  borderBottom: `2px solid ${activeTab === tab ? ORANGE : "transparent"}`,
                  color: activeTab === tab ? "#fff" : MUTED2,
                  fontSize: 13, fontWeight: activeTab === tab ? 600 : 400,
                  cursor: "pointer", transition: "all 0.15s", whiteSpace: "nowrap",
                }}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Tab content */}
        <div style={{ maxWidth: 800, margin: "0 auto", padding: "32px 32px" }}>
          <div style={{ background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 12, padding: "28px 32px", marginBottom: 24 }}>
            {activeTab === "Brand Basics" && <BrandBasicsTab data={brandData} onChange={setBrandData} />}
            {activeTab === "Keywords & Prompts" && <KeywordsTab data={keywordData} onChange={setKeywordData} />}
            {activeTab === "Competitors" && <CompetitorsTab competitors={competitors} onChange={setCompetitors} />}
          </div>

          {/* AI Context Summary */}
          <div style={{ background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 12, padding: "24px 28px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: TEXT, marginBottom: 2 }}>AI Context Summary</div>
                <div style={{ fontSize: 12, color: MUTED }}>Compressed brand context sent to the AI on every scan</div>
              </div>
              <button
                style={{ background: saved ? ORANGE : "#1f2d3d", color: saved ? "#fff" : MUTED, border: "none", padding: "7px 14px", borderRadius: 7, fontSize: 12, fontWeight: 600, cursor: saved ? "pointer" : "not-allowed" }}
                disabled={!saved}
              >
                ↻ Re-compress
              </button>
            </div>
            <div style={{
              background: "#0d1520", border: `1px solid ${BORDER}`, borderRadius: 8,
              padding: "16px 18px", fontSize: 12, color: MUTED2,
              lineHeight: 1.8, minHeight: 80, whiteSpace: "pre-line",
            }}>
              {aiSummary}
            </div>
          </div>
        </div>
      </div>

      <Toast visible={showToast} />
    </div>
  );
}
