"use client";
import { useState, KeyboardEvent } from "react";
import Sidebar, { ORANGE, BORDER } from "@/components/studio/Sidebar";

const BG = "#0a0f1a";
const CARD_BG = "#111827";
const INPUT_BG = "#162032";
const SURFACE = "#1e2a3b";
const TEXT = "#e2e8f0";
const MUTED = "#64748b";
const MUTED2 = "#94a3b8";

/* ── helpers ── */
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
    <div style={{ position: "relative" }}>
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

function ProgressBar({ step, total }: { step: number; total: number }) {
  return (
    <div style={{ marginBottom: 28 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
        <span style={{ fontSize: 13, color: MUTED2, fontWeight: 600 }}>Step {step} of {total}</span>
        <span style={{ fontSize: 12, color: MUTED }}>{Math.round((step / total) * 100)}% complete</span>
      </div>
      <div style={{ height: 4, background: "#1f2d3d", borderRadius: 99, overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${(step / total) * 100}%`, background: ORANGE, borderRadius: 99, transition: "width 0.4s ease" }} />
      </div>
      <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
        {["Brand Basics", "Keywords & Prompts", "Competitors"].map((label, i) => (
          <div key={i} style={{ flex: 1, textAlign: "center" }}>
            <div style={{ width: 24, height: 24, borderRadius: "50%", margin: "0 auto 4px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, background: i + 1 <= step ? ORANGE : "#1f2d3d", color: i + 1 <= step ? "#fff" : MUTED }}>
              {i + 1 < step ? "✓" : i + 1}
            </div>
            <div style={{ fontSize: 11, color: i + 1 === step ? TEXT : MUTED }}>{label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Btn({ children, onClick, disabled, variant = "primary", style: extraStyle }: { children: React.ReactNode; onClick?: () => void; disabled?: boolean; variant?: "primary" | "secondary"; style?: React.CSSProperties }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        padding: "10px 22px", borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: disabled ? "not-allowed" : "pointer",
        border: variant === "primary" ? "none" : `1px solid ${BORDER}`,
        background: variant === "primary" ? (disabled ? "#4a2a1a" : ORANGE) : "transparent",
        color: variant === "primary" ? (disabled ? "#7a4a3a" : "#fff") : MUTED2,
        transition: "opacity 0.15s",
        ...extraStyle,
      }}
    >
      {children}
    </button>
  );
}

/* ── Steps ── */
interface Step1Data { brandName: string; domain: string; description: string; categories: string[]; geo: string; positioning: string; voiceGuidelines: string }
interface Step2Data { keywords: string[]; prompts: string[]; preferredSubs: string[]; blacklistedSubs: string[] }
interface Step3Data { competitors: { name: string; domain: string }[] }

function Step1({ data, onChange, onNext }: { data: Step1Data; onChange: (d: Step1Data) => void; onNext: () => void }) {
  const valid = data.brandName.trim() && data.domain.trim() && data.description.trim().length >= 50;
  const set = (k: keyof Step1Data) => (v: string | string[]) => onChange({ ...data, [k]: v });

  return (
    <div>
      <ProgressBar step={1} total={3} />
      <h2 style={{ margin: "0 0 6px", fontSize: 20, fontWeight: 700, color: "#fff" }}>Brand Basics</h2>
      <p style={{ margin: "0 0 24px", fontSize: 13, color: MUTED }}>Tell us about your brand so we can find the right Reddit conversations.</p>

      <Field label="Brand Name" required><TextInput value={data.brandName} onChange={set("brandName")} placeholder="e.g. Blackbrookcase" /></Field>
      <Field label="Primary Domain" required><TextInput value={data.domain} onChange={set("domain")} placeholder="https://yourbrand.com" /></Field>
      <Field label="Brand Description" required>
        <TextArea value={data.description} onChange={set("description") as (v: string) => void} placeholder="Describe your brand, what you sell, and who your customers are. Minimum 50 characters." rows={4} maxLen={500} />
      </Field>
      <Field label="Product Categories">
        <TagInput tags={data.categories} onAdd={t => set("categories")([...data.categories, t])} onRemove={i => set("categories")(data.categories.filter((_, j) => j !== i))} placeholder='Type a category and press Enter (e.g. "Phone Cases")' />
      </Field>
      <Field label="Geographic Focus">
        <select value={data.geo} onChange={e => set("geo")(e.target.value)} style={{ width: "100%", background: INPUT_BG, border: `1px solid ${BORDER}`, color: TEXT, padding: "9px 12px", borderRadius: 8, fontSize: 13, outline: "none" }}>
          {["Global", "US", "UK", "EU", "Asia"].map(g => <option key={g}>{g}</option>)}
        </select>
      </Field>
      <Field label="Positioning Notes"><TextArea value={data.positioning} onChange={set("positioning") as (v: string) => void} placeholder="What to emphasize and what to avoid in Reddit comments..." rows={3} /></Field>
      <Field label="Brand Voice Guidelines"><TextArea value={data.voiceGuidelines} onChange={set("voiceGuidelines") as (v: string) => void} placeholder="Tone, language style, phrases to use or avoid..." rows={3} /></Field>

      <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 8 }}>
        <Btn variant="secondary" disabled>← Back</Btn>
        <Btn onClick={onNext} disabled={!valid}>Next →</Btn>
      </div>
    </div>
  );
}

function Step2({ data, onChange, onNext, onBack }: { data: Step2Data; onChange: (d: Step2Data) => void; onNext: () => void; onBack: () => void }) {
  const valid = data.keywords.length >= 1;
  const set = (k: keyof Step2Data) => (v: string[]) => onChange({ ...data, [k]: v });

  return (
    <div>
      <ProgressBar step={2} total={3} />
      <h2 style={{ margin: "0 0 6px", fontSize: 20, fontWeight: 700, color: "#fff" }}>Keywords & Prompts</h2>
      <p style={{ margin: "0 0 24px", fontSize: 13, color: MUTED }}>Define what Reddit conversations to monitor and engage with.</p>

      <Field label="Tracked Keywords" required>
        <TagInput tags={data.keywords} onAdd={t => set("keywords")([...data.keywords, t])} onRemove={i => set("keywords")(data.keywords.filter((_, j) => j !== i))} placeholder='Press Enter to add (e.g. "leather phone case")' />
        {data.keywords.length === 0 && <p style={{ fontSize: 11, color: "#f87171", margin: "6px 0 0" }}>At least 1 keyword required</p>}
      </Field>

      <Field label="Tracked Prompts">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
          <span style={{ fontSize: 11, color: MUTED }}>{data.prompts.length}/25 prompts added</span>
        </div>
        <TagInput tags={data.prompts} onAdd={t => set("prompts")([...data.prompts, t])} onRemove={i => set("prompts")(data.prompts.filter((_, j) => j !== i))} placeholder='e.g. "best phone case for hiking"' max={25} />
      </Field>

      <Field label="Preferred Subreddits">
        <TagInput tags={data.preferredSubs} onAdd={t => set("preferredSubs")([...data.preferredSubs, t])} onRemove={i => set("preferredSubs")(data.preferredSubs.filter((_, j) => j !== i))} placeholder='e.g. "r/iphone" — press Enter to add' />
      </Field>

      <Field label="Blacklisted Subreddits">
        <TagInput tags={data.blacklistedSubs} onAdd={t => set("blacklistedSubs")([...data.blacklistedSubs, t])} onRemove={i => set("blacklistedSubs")(data.blacklistedSubs.filter((_, j) => j !== i))} placeholder='Subreddits to never engage with' />
      </Field>

      <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 8 }}>
        <Btn variant="secondary" onClick={onBack}>← Back</Btn>
        <Btn onClick={onNext} disabled={!valid}>Next →</Btn>
      </div>
    </div>
  );
}

function Step3({ data, onChange, onComplete }: { data: Step3Data; onChange: (d: Step3Data) => void; onComplete: () => void }) {
  const [name, setName] = useState("");
  const [domain, setDomain] = useState("");
  const [limitMsg, setLimitMsg] = useState(false);

  const add = () => {
    if (!name.trim()) return;
    if (data.competitors.length >= 3) { setLimitMsg(true); return; }
    onChange({ competitors: [...data.competitors, { name: name.trim(), domain: domain.trim() }] });
    setName(""); setDomain(""); setLimitMsg(false);
  };
  const remove = (i: number) => { onChange({ competitors: data.competitors.filter((_, j) => j !== i) }); setLimitMsg(false); };

  return (
    <div>
      <ProgressBar step={3} total={3} />
      <h2 style={{ margin: "0 0 6px", fontSize: 20, fontWeight: 700, color: "#fff" }}>Competitors</h2>
      <p style={{ margin: "0 0 24px", fontSize: 13, color: MUTED }}>Add up to 3 competitors to monitor their Reddit mentions. (Basic plan)</p>

      <Field label="Add Competitor">
        <div style={{ display: "flex", gap: 8 }}>
          <input value={name} onChange={e => setName(e.target.value)} placeholder="Competitor name" onKeyDown={e => e.key === "Enter" && add()} style={{ flex: 1, background: INPUT_BG, border: `1px solid ${BORDER}`, color: TEXT, padding: "9px 12px", borderRadius: 8, fontSize: 13, outline: "none" }} />
          <input value={domain} onChange={e => setDomain(e.target.value)} placeholder="https://competitor.com" onKeyDown={e => e.key === "Enter" && add()} style={{ flex: 1, background: INPUT_BG, border: `1px solid ${BORDER}`, color: TEXT, padding: "9px 12px", borderRadius: 8, fontSize: 13, outline: "none" }} />
          <button onClick={add} style={{ background: ORANGE, color: "#fff", border: "none", padding: "9px 16px", borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: "pointer", whiteSpace: "nowrap" }}>+ Add</button>
        </div>
        {limitMsg && (
          <div style={{ marginTop: 10, background: "#2d1a0e", border: `1px solid #7c3e1a`, borderRadius: 8, padding: "10px 14px", display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 16 }}>🔒</span>
            <div>
              <span style={{ fontSize: 13, color: "#fdba74", fontWeight: 600 }}>Upgrade to Pro to add more competitors</span>
              <span style={{ display: "block", fontSize: 11, color: MUTED, marginTop: 2 }}>Basic plan is limited to 3 competitors.</span>
            </div>
            <button style={{ marginLeft: "auto", background: ORANGE, color: "#fff", border: "none", padding: "6px 14px", borderRadius: 6, fontSize: 12, fontWeight: 700, cursor: "pointer" }}>Upgrade</button>
          </div>
        )}
      </Field>

      {data.competitors.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 20 }}>
          {data.competitors.map((c, i) => (
            <div key={i} style={{ background: CARD_BG, border: `1px solid ${BORDER}`, borderRadius: 8, padding: "12px 16px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: "#fff", marginBottom: 2 }}>{c.name}</div>
                <div style={{ fontSize: 12, color: "#60a5fa" }}>{c.domain || "—"}</div>
              </div>
              <button onClick={() => remove(i)} style={{ background: "none", border: `1px solid #374151`, color: MUTED, borderRadius: 6, padding: "4px 10px", cursor: "pointer", fontSize: 13 }}>× Remove</button>
            </div>
          ))}
        </div>
      )}

      {data.competitors.length === 0 && (
        <div style={{ background: CARD_BG, border: `1px dashed ${BORDER}`, borderRadius: 8, padding: "28px 20px", textAlign: "center", marginBottom: 20, color: MUTED, fontSize: 13 }}>
          No competitors added yet. Add up to 3 competitors above.
        </div>
      )}

      <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 8 }}>
        <Btn variant="secondary" onClick={() => history.back()}>← Back</Btn>
        <Btn onClick={onComplete}>Complete Setup ✓</Btn>
      </div>
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
      transition: "all 0.3s", opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(16px)", pointerEvents: "none",
    }}>
      <span style={{ fontSize: 18 }}>✓</span> Setup complete! Your first opportunities will arrive soon.
    </div>
  );
}

/* ── Main Page ── */
export default function BrandSetupPage() {
  const [step, setStep] = useState(1);
  const [complete, setComplete] = useState(false);
  const [showToast, setShowToast] = useState(false);

  const [step1, setStep1] = useState<Step1Data>({ brandName: "", domain: "", description: "", categories: [], geo: "Global", positioning: "", voiceGuidelines: "" });
  const [step2, setStep2] = useState<Step2Data>({ keywords: [], prompts: [], preferredSubs: [], blacklistedSubs: [] });
  const [step3, setStep3] = useState<Step3Data>({ competitors: [] });

  const handleComplete = () => {
    setComplete(true);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 4000);
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh", fontFamily: "'Inter', system-ui, sans-serif", background: BG, color: TEXT }}>
      <Sidebar activeNav="Brand Setup" />

      {/* Main content */}
      <div style={{ flex: 1, overflowY: "auto", padding: "40px 0" }}>
        <div style={{ maxWidth: 680, margin: "0 auto", padding: "0 32px" }}>

          {/* Wizard card */}
          <div style={{ background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 12, padding: "32px 36px", marginBottom: 24 }}>
            {step === 1 && <Step1 data={step1} onChange={setStep1} onNext={() => setStep(2)} />}
            {step === 2 && <Step2 data={step2} onChange={setStep2} onNext={() => setStep(3)} onBack={() => setStep(1)} />}
            {step === 3 && <Step3 data={step3} onChange={setStep3} onComplete={handleComplete} />}
          </div>

          {/* AI Context Summary */}
          <div style={{ background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 12, padding: "24px 28px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: TEXT, marginBottom: 2 }}>AI Context Summary</div>
                <div style={{ fontSize: 12, color: MUTED }}>Compressed brand context sent to the AI on every scan</div>
              </div>
              <button
                disabled={!complete}
                style={{
                  background: complete ? ORANGE : "#1f2d3d", color: complete ? "#fff" : MUTED,
                  border: "none", padding: "7px 14px", borderRadius: 7, fontSize: 12, fontWeight: 600,
                  cursor: complete ? "pointer" : "not-allowed",
                }}
              >
                ↻ Re-compress
              </button>
            </div>
            <div style={{
              background: "#0d1520", border: `1px solid ${BORDER}`, borderRadius: 8,
              padding: "16px 18px", fontSize: 12, color: complete ? MUTED2 : MUTED,
              lineHeight: 1.7, minHeight: 80, fontStyle: complete ? "normal" : "italic",
            }}>
              {complete
                ? `Brand: ${step1.brandName} · ${step1.domain}\nFocus: ${step1.geo} · ${step1.categories.join(", ") || "General"}\nKeywords: ${step2.keywords.join(", ")}\nCompetitors: ${step3.competitors.map(c => c.name).join(", ") || "None"}\n\n${step1.description.slice(0, 200)}${step1.description.length > 200 ? "..." : ""}`
                : "Your brand context will be compressed and summarised here after setup is complete."
              }
            </div>
          </div>

        </div>
      </div>

      <Toast visible={showToast} />
    </div>
  );
}
