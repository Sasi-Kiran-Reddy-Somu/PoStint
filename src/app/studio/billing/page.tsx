"use client";
import { useState } from "react";
import Sidebar, { ORANGE, BORDER } from "@/components/studio/Sidebar";

const BG = "#0a0f1a";
const SURFACE = "#1e2a3b";
const SURFACE2 = "#162032";
const TEXT = "#e2e8f0";
const MUTED = "#64748b";
const MUTED2 = "#94a3b8";

const PACKAGES = [
  { id: "starter", label: "Starter", credits: 100, price: "$9.99" },
  { id: "growth",  label: "Growth",  credits: 250, price: "$19.99", popular: true },
  { id: "pro",     label: "Pro",     credits: 500, price: "$34.99" },
  { id: "enterprise", label: "Enterprise", credits: 1000, price: "$59.99" },
];

const HISTORY = [
  { date: "Apr 1, 2026",  description: "Pro Plan — Monthly",          amount: "$49.99", status: "Paid" },
  { date: "Mar 1, 2026",  description: "Pro Plan — Monthly",          amount: "$49.99", status: "Paid" },
  { date: "Feb 10, 2026", description: "Credit Top Up — Growth Pack", amount: "$19.99", status: "Paid" },
  { date: "Feb 1, 2026",  description: "Pro Plan — Monthly",          amount: "$49.99", status: "Paid" },
];

function SectionCard({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 12, padding: "24px 28px", marginBottom: 20 }}>
      {children}
    </div>
  );
}

export default function BillingPage() {
  const [selectedPkg, setSelectedPkg] = useState("growth");

  const used = 358;
  const total = 500;
  const pct = (used / total) * 100;

  return (
    <div style={{ display: "flex", minHeight: "100vh", fontFamily: "'Inter', system-ui, sans-serif", background: BG, color: TEXT }}>
      <Sidebar activeNav="Billing" />

      <div style={{ flex: 1, overflowY: "auto", padding: "36px 0" }}>
        <div style={{ maxWidth: 800, margin: "0 auto", padding: "0 32px" }}>

          <h1 style={{ margin: "0 0 6px", fontSize: 22, fontWeight: 700, color: "#fff" }}>Billing</h1>
          <p style={{ margin: "0 0 28px", fontSize: 13, color: MUTED }}>Manage your plan, credits, and payment details.</p>

          {/* Section 1 — Current Plan */}
          <SectionCard>
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 20 }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
                  <span style={{ fontSize: 20, fontWeight: 800, color: "#fff" }}>Pro Plan</span>
                  <span style={{ background: "#14532d", color: "#4ade80", padding: "2px 10px", borderRadius: 99, fontSize: 11, fontWeight: 700 }}>Active</span>
                </div>
                <div style={{ fontSize: 13, color: MUTED2 }}>500 credits / month</div>
              </div>
              <div style={{ textAlign: "right" }}>
                <button style={{ background: ORANGE, color: "#fff", border: "none", padding: "9px 18px", borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: "pointer", display: "block", marginBottom: 6 }}>
                  Upgrade to Enterprise
                </button>
                <div style={{ fontSize: 11, color: MUTED }}>Plan downgrade is not available</div>
              </div>
            </div>

            {/* Progress bar */}
            <div style={{ marginBottom: 6 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                <span style={{ fontSize: 12, color: MUTED2 }}>{used} credits used</span>
                <span style={{ fontSize: 12, color: MUTED2 }}>{total - used} remaining</span>
              </div>
              <div style={{ height: 8, background: "#0d1520", borderRadius: 99, overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${pct}%`, background: ORANGE, borderRadius: 99 }} />
              </div>
            </div>
            <div style={{ fontSize: 12, color: MUTED, marginTop: 8 }}>Resets May 1, 2026</div>
          </SectionCard>

          {/* Section 2 — Top Up */}
          <SectionCard>
            <div style={{ fontSize: 15, fontWeight: 700, color: "#fff", marginBottom: 16 }}>Top Up Credits</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10, marginBottom: 18 }}>
              {PACKAGES.map(pkg => (
                <div
                  key={pkg.id}
                  onClick={() => setSelectedPkg(pkg.id)}
                  style={{
                    border: `2px solid ${selectedPkg === pkg.id ? ORANGE : BORDER}`,
                    background: selectedPkg === pkg.id ? "rgba(232,93,47,0.08)" : SURFACE2,
                    borderRadius: 10, padding: "16px 12px", cursor: "pointer",
                    textAlign: "center", position: "relative", transition: "all 0.15s",
                  }}
                >
                  {pkg.popular && (
                    <div style={{ position: "absolute", top: -10, left: "50%", transform: "translateX(-50%)", background: ORANGE, color: "#fff", fontSize: 10, fontWeight: 700, padding: "2px 10px", borderRadius: 99, whiteSpace: "nowrap" }}>
                      Most Popular
                    </div>
                  )}
                  <div style={{ fontSize: 13, fontWeight: 700, color: selectedPkg === pkg.id ? "#fff" : MUTED2, marginBottom: 6 }}>{pkg.label}</div>
                  <div style={{ fontSize: 20, fontWeight: 800, color: selectedPkg === pkg.id ? ORANGE : "#fff", marginBottom: 4 }}>{pkg.credits}</div>
                  <div style={{ fontSize: 11, color: MUTED, marginBottom: 8 }}>credits</div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: selectedPkg === pkg.id ? "#fff" : MUTED2 }}>{pkg.price}</div>
                </div>
              ))}
            </div>
            <button style={{ background: ORANGE, color: "#fff", border: "none", padding: "11px 24px", borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
              Purchase Credits
            </button>
          </SectionCard>

          {/* Section 3 — Payment Method */}
          <SectionCard>
            <div style={{ fontSize: 15, fontWeight: 700, color: "#fff", marginBottom: 16 }}>Payment Method</div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                <div style={{ background: SURFACE2, border: `1px solid ${BORDER}`, borderRadius: 6, padding: "8px 14px", fontSize: 13, fontWeight: 700, color: "#60a5fa", letterSpacing: "0.04em" }}>VISA</div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: TEXT }}>Visa ending in 4242</div>
                  <div style={{ fontSize: 12, color: MUTED }}>Expiry: 12/2027</div>
                </div>
              </div>
              <button style={{ background: "transparent", border: `1px solid ${BORDER}`, color: MUTED2, padding: "8px 16px", borderRadius: 7, fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
                Update Payment Method
              </button>
            </div>
          </SectionCard>

          {/* Section 4 — Billing History */}
          <SectionCard>
            <div style={{ fontSize: 15, fontWeight: 700, color: "#fff", marginBottom: 16 }}>Billing History</div>
            <div style={{ border: `1px solid ${BORDER}`, borderRadius: 8, overflow: "hidden" }}>
              {/* Table header */}
              <div style={{ display: "grid", gridTemplateColumns: "130px 1fr 100px 90px 80px", background: SURFACE2, padding: "10px 16px", gap: 8 }}>
                {["Date", "Description", "Amount", "Status", "Download"].map(h => (
                  <div key={h} style={{ fontSize: 11, fontWeight: 700, color: MUTED, textTransform: "uppercase", letterSpacing: "0.06em" }}>{h}</div>
                ))}
              </div>
              {HISTORY.map((row, i) => (
                <div key={i} style={{ display: "grid", gridTemplateColumns: "130px 1fr 100px 90px 80px", padding: "13px 16px", gap: 8, alignItems: "center", borderTop: `1px solid ${BORDER}` }}>
                  <div style={{ fontSize: 12, color: MUTED2 }}>{row.date}</div>
                  <div style={{ fontSize: 13, color: TEXT }}>{row.description}</div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: TEXT }}>{row.amount}</div>
                  <div><span style={{ background: "#14532d", color: "#4ade80", padding: "2px 8px", borderRadius: 4, fontSize: 11, fontWeight: 700 }}>{row.status}</span></div>
                  <div><a href="#" style={{ fontSize: 12, color: "#60a5fa", textDecoration: "none", fontWeight: 600 }}>Download</a></div>
                </div>
              ))}
            </div>
          </SectionCard>

        </div>
      </div>
    </div>
  );
}
