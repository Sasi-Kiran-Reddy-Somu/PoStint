"use client";
import { useState } from "react";
import Sidebar, { ORANGE, BORDER } from "@/components/studio/Sidebar";

const BG = "#0a0f1a";
const SURFACE = "#1e2a3b";
const SURFACE2 = "#162032";
const TEXT = "#e2e8f0";
const MUTED = "#64748b";
const MUTED2 = "#94a3b8";

type RaiseTab = "raise" | "track";

const COMPLAINT_TYPES = [
  "Bug / Technical Issue",
  "Task Not Credited",
  "Worker Performance Issue",
  "Incorrect Billing Charge",
  "Comment Removed Unfairly",
  "Feature Request",
  "Account Access Issue",
  "Other",
];

const MOCK_TICKETS = [
  { id: "HLP-1041", type: "Task Not Credited", subject: "Comment posted but credits not returned", status: "Open", date: "May 10, 2026", reply: "" },
  { id: "HLP-1028", type: "Bug / Technical Issue", subject: "Generate button spinner doesn't stop on error", status: "Resolved", date: "May 3, 2026", reply: "This has been fixed in the latest deployment. Please refresh and try again." },
  { id: "HLP-1019", type: "Incorrect Billing Charge", subject: "Charged twice for same task", status: "In Review", date: "Apr 28, 2026", reply: "Our billing team is investigating. We'll update you within 24h." },
];

const STATUS_COLORS: Record<string, { bg: string; color: string }> = {
  "Open":      { bg: "#1e3a5f", color: "#60a5fa" },
  "In Review": { bg: "#713f12", color: "#fbbf24" },
  "Resolved":  { bg: "#14532d", color: "#4ade80" },
};

export default function HelpCenterPage() {
  const [tab, setTab] = useState<RaiseTab>("raise");

  // Raise form state
  const [type, setType] = useState("");
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [submitted, setSubmitted] = useState(false);

  // Track state
  const [expanded, setExpanded] = useState<string | null>(null);

  const canSubmit = type && subject.trim() && description.trim().length >= 10;

  const handleSubmit = () => {
    if (!canSubmit) return;
    setSubmitted(true);
    setType(""); setSubject(""); setDescription("");
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh", fontFamily: "'Inter', system-ui, sans-serif", background: BG, color: TEXT }}>
      <Sidebar activeNav="Help Center" />

      <div style={{ flex: 1, overflowY: "auto", padding: "36px 0" }}>
        <div style={{ maxWidth: 720, margin: "0 auto", padding: "0 32px" }}>
          <h1 style={{ margin: "0 0 4px", fontSize: 22, fontWeight: 700, color: "#fff" }}>Help Center</h1>
          <p style={{ margin: "0 0 28px", fontSize: 13, color: MUTED }}>Raise a support request or track your existing tickets.</p>

          {/* Tabs */}
          <div style={{ display: "flex", borderBottom: `1px solid ${BORDER}`, marginBottom: 28 }}>
            {([["raise", "Raise a Complaint"], ["track", "Track Complaints"]] as [RaiseTab, string][]).map(([key, label]) => (
              <button
                key={key}
                onClick={() => setTab(key)}
                style={{
                  padding: "10px 20px", background: "transparent", border: "none",
                  borderBottom: `2px solid ${tab === key ? ORANGE : "transparent"}`,
                  color: tab === key ? "#fff" : MUTED2,
                  fontSize: 13, fontWeight: tab === key ? 600 : 400,
                  cursor: "pointer", marginBottom: -1,
                }}
              >{label}</button>
            ))}
          </div>

          {tab === "raise" && (
            <div style={{ background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 12, padding: "28px 32px" }}>
              {submitted ? (
                <div style={{ textAlign: "center", padding: "24px 0" }}>
                  <div style={{ fontSize: 32, marginBottom: 12 }}>✓</div>
                  <div style={{ fontSize: 16, fontWeight: 700, color: "#fff", marginBottom: 8 }}>Ticket submitted successfully</div>
                  <div style={{ fontSize: 13, color: MUTED, marginBottom: 20 }}>We&apos;ll get back to you within 24 hours. Check the Track tab for updates.</div>
                  <button onClick={() => setSubmitted(false)} style={{ background: ORANGE, color: "#fff", border: "none", padding: "10px 24px", borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
                    Submit Another
                  </button>
                </div>
              ) : (
                <>
                  <div style={{ marginBottom: 18 }}>
                    <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: MUTED2, marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.05em" }}>Complaint Type</label>
                    <select
                      value={type}
                      onChange={e => setType(e.target.value)}
                      style={{ width: "100%", background: SURFACE2, border: `1px solid ${type ? ORANGE : BORDER}`, color: type ? TEXT : MUTED, padding: "10px 12px", borderRadius: 8, fontSize: 13, outline: "none" }}
                    >
                      <option value="">Select a type...</option>
                      {COMPLAINT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>

                  <div style={{ marginBottom: 18 }}>
                    <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: MUTED2, marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.05em" }}>Subject</label>
                    <input
                      value={subject}
                      onChange={e => setSubject(e.target.value)}
                      placeholder="Brief description of the issue"
                      style={{ width: "100%", background: SURFACE2, border: `1px solid ${BORDER}`, color: TEXT, padding: "10px 12px", borderRadius: 8, fontSize: 13, outline: "none", boxSizing: "border-box" }}
                    />
                  </div>

                  <div style={{ marginBottom: 24 }}>
                    <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: MUTED2, marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.05em" }}>Description</label>
                    <textarea
                      value={description}
                      onChange={e => setDescription(e.target.value)}
                      placeholder="Describe the issue in detail — include any task IDs, page names, or steps to reproduce..."
                      rows={5}
                      style={{ width: "100%", background: SURFACE2, border: `1px solid ${BORDER}`, color: TEXT, padding: "10px 12px", borderRadius: 8, fontSize: 13, outline: "none", resize: "vertical", lineHeight: 1.6, boxSizing: "border-box" }}
                    />
                    <div style={{ fontSize: 11, color: description.length < 10 && description.length > 0 ? "#f87171" : MUTED, marginTop: 4 }}>
                      {description.length < 10 ? `${10 - description.length} more characters required` : `${description.length} characters`}
                    </div>
                  </div>

                  <button
                    onClick={handleSubmit}
                    disabled={!canSubmit}
                    style={{ background: canSubmit ? ORANGE : "#4a2a1a", color: canSubmit ? "#fff" : "#7a4a3a", border: "none", padding: "11px 28px", borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: canSubmit ? "pointer" : "not-allowed" }}
                  >
                    Submit Ticket
                  </button>
                </>
              )}
            </div>
          )}

          {tab === "track" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {MOCK_TICKETS.length === 0 ? (
                <div style={{ background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 12, padding: "48px 32px", textAlign: "center", color: MUTED, fontSize: 13 }}>
                  No tickets yet. Raise one from the other tab.
                </div>
              ) : (
                MOCK_TICKETS.map(ticket => (
                  <div key={ticket.id} style={{ background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 10, overflow: "hidden" }}>
                    <div
                      onClick={() => setExpanded(expanded === ticket.id ? null : ticket.id)}
                      style={{ padding: "14px 20px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}
                    >
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4, flexWrap: "wrap" }}>
                          <span style={{ fontSize: 12, fontWeight: 700, color: MUTED2 }}>{ticket.id}</span>
                          <span style={{ fontSize: 11, background: "#1e293b", color: MUTED2, padding: "2px 8px", borderRadius: 4 }}>{ticket.type}</span>
                          <span style={{ fontSize: 11, fontWeight: 700, background: STATUS_COLORS[ticket.status].bg, color: STATUS_COLORS[ticket.status].color, padding: "2px 8px", borderRadius: 4 }}>{ticket.status}</span>
                        </div>
                        <div style={{ fontSize: 13, fontWeight: 600, color: TEXT }}>{ticket.subject}</div>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 12, flexShrink: 0 }}>
                        <span style={{ fontSize: 11, color: MUTED }}>{ticket.date}</span>
                        <span style={{ color: MUTED, fontSize: 12 }}>{expanded === ticket.id ? "▲" : "▼"}</span>
                      </div>
                    </div>
                    {expanded === ticket.id && (
                      <div style={{ borderTop: `1px solid ${BORDER}`, padding: "14px 20px", background: "#0d1520" }}>
                        {ticket.reply ? (
                          <div>
                            <div style={{ fontSize: 11, fontWeight: 700, color: MUTED, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6 }}>Support Response</div>
                            <div style={{ fontSize: 13, color: MUTED2, lineHeight: 1.6 }}>{ticket.reply}</div>
                          </div>
                        ) : (
                          <div style={{ fontSize: 13, color: MUTED, fontStyle: "italic" }}>No response yet — our team will reply within 24 hours.</div>
                        )}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
