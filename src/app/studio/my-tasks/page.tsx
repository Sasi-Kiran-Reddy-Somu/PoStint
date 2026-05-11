"use client";
import { useState } from "react";
import Sidebar, { ORANGE, BORDER } from "@/components/studio/Sidebar";

const BG = "#0a0f1a";
const SURFACE = "#111827";
const SURFACE2 = "#162032";
const TEXT = "#e2e8f0";
const MUTED = "#64748b";
const MUTED2 = "#94a3b8";

type Status = "All" | "Pending" | "Live" | "Failed" | "Refunded" | "Mod Removed" | "Automod Removed" | "Completed";
type Source = "All" | "Opportunity" | "Mention" | "Post" | "Boost";

const STATUS_COLORS: Record<string, { bg: string; color: string }> = {
  Live:              { bg: "#14532d",  color: "#4ade80" },
  Pending:           { bg: "#1e293b",  color: "#94a3b8" },
  Completed:         { bg: "#1e3a5f",  color: "#60a5fa" },
  "Mod Removed":     { bg: "#450a0a",  color: "#f87171" },
  "Automod Removed": { bg: "#431407",  color: "#fb923c" },
  Refunded:          { bg: "#1e3a5f",  color: "#60a5fa" },
  Failed:            { bg: "#450a0a",  color: "#f87171" },
};

interface Task {
  id: string; source: string; subreddit: string; scheduled: string;
  status: string; tier: string; credits: number;
  upvotes: string; replies: string; comment: string;
  removed?: string; removedDate?: string; boosted?: boolean;
}

const TASKS: Task[] = [
  {
    id: "#1001", source: "Opportunity", subreddit: "r/iPhone",
    scheduled: "Apr 16 2026 10:00 AM", status: "Live", tier: "Tier 1",
    credits: 12, upvotes: "7", replies: "3", boosted: true,
    comment: "Been using a full-grain leather case from Blackbrookcase for about 8 months now — the patina development has been incredible. MagSafe works perfectly through it too. Highly recommend checking them out if you want something that actually ages well.",
  },
  {
    id: "#1002", source: "Opportunity", subreddit: "r/Apple",
    scheduled: "Apr 16 2026 2:00 PM", status: "Pending", tier: "Tier 2",
    credits: 8, upvotes: "—", replies: "—",
    comment: "Comment is scheduled and pending placement.",
  },
  {
    id: "#1003", source: "Post", subreddit: "r/BuyItForLife",
    scheduled: "Apr 15 2026 9:00 AM", status: "Live", tier: "Tier 1",
    credits: 12, upvotes: "15", replies: "6",
    comment: "My leather phone case has survived two phone upgrades and looks better now than the day I bought it. Full-grain leather with proper conditioning develops a patina that no synthetic material can replicate. Worth every penny for a BIFL perspective.",
  },
  {
    id: "#1004", source: "Boost", subreddit: "r/iPhone",
    scheduled: "Apr 15 2026 9:05 AM", status: "Completed", tier: "—",
    credits: 3, upvotes: "—", replies: "—",
    comment: "Upvote boost applied to task #1001.",
  },
  {
    id: "#1005", source: "Mention", subreddit: "r/minimalism",
    scheduled: "Apr 14 2026 4:00 PM", status: "Mod Removed", tier: "Tier 2",
    credits: 8, upvotes: "2", replies: "0",
    comment: "For minimal aesthetics, genuine leather cases are the obvious choice — no branding, no plasticky finish. The natural texture speaks for itself.",
    removed: "Apr 15 2026", removedDate: "Apr 15 2026",
  },
  {
    id: "#1006", source: "Opportunity", subreddit: "r/frugal",
    scheduled: "Apr 13 2026 11:00 AM", status: "Automod Removed", tier: "Tier 3",
    credits: 5, upvotes: "0", replies: "0",
    comment: "Cost per year is the real metric. A quality leather case that lasts 3 years beats replacing cheap cases every 6 months. Work out the math and premium pays for itself.",
    removed: "Apr 13 2026", removedDate: "Apr 14 2026",
  },
  {
    id: "#1007", source: "Opportunity", subreddit: "r/personalfinance",
    scheduled: "Apr 12 2026", status: "Refunded", tier: "Tier 1",
    credits: 0, upvotes: "—", replies: "—",
    comment: "Task was not placed. Full credit refund applied.",
  },
  {
    id: "#1008", source: "Post", subreddit: "r/malelifestyle",
    scheduled: "Apr 11 2026 3:00 PM", status: "Failed", tier: "Tier 2",
    credits: 0, upvotes: "—", replies: "—",
    comment: "Post placement failed. Worker was unable to complete the task within the scheduled window.",
  },
];

const STATUS_FILTERS: Status[] = ["All", "Pending", "Live", "Failed", "Refunded", "Mod Removed", "Automod Removed"];
const SOURCE_FILTERS: Source[] = ["All", "Opportunity", "Mention", "Post", "Boost"];

function StatusBadge({ status }: { status: string }) {
  const s = STATUS_COLORS[status] ?? { bg: "#1e293b", color: "#94a3b8" };
  return (
    <span style={{ background: s.bg, color: s.color, padding: "3px 9px", borderRadius: 4, fontSize: 11, fontWeight: 700, whiteSpace: "nowrap" }}>
      {status}
    </span>
  );
}

function FilterChip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: "5px 14px", borderRadius: 99, fontSize: 12, fontWeight: 600, cursor: "pointer",
        border: `1px solid ${active ? ORANGE : BORDER}`,
        background: active ? "rgba(232,93,47,0.15)" : "transparent",
        color: active ? ORANGE : MUTED,
      }}
    >{label}</button>
  );
}

export default function MyTasksPage() {
  const [statusFilter, setStatusFilter] = useState<Status>("All");
  const [sourceFilter, setSourceFilter] = useState<Source>("All");
  const [expanded, setExpanded] = useState<string | null>(null);
  const [boostExpanded, setBoostExpanded] = useState<string | null>(null);
  const [cancelConfirm, setCancelConfirm] = useState<string | null>(null);
  const [cancelledTasks, setCancelledTasks] = useState<Set<string>>(new Set());

  const filtered = TASKS.filter(t =>
    (statusFilter === "All" || t.status === statusFilter) &&
    (sourceFilter === "All" || t.source === sourceFilter)
  );

  const confirmCancel = (id: string) => {
    setCancelledTasks(prev => new Set([...prev, id]));
    setCancelConfirm(null);
    setExpanded(null);
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh", fontFamily: "'Inter', system-ui, sans-serif", background: BG, color: TEXT }}>
      <Sidebar activeNav="My Tasks" />

      <div style={{ flex: 1, overflowY: "auto", padding: "32px 0" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 32px" }}>

          <h1 style={{ margin: "0 0 6px", fontSize: 22, fontWeight: 700, color: "#fff" }}>My Tasks</h1>
          <p style={{ margin: "0 0 24px", fontSize: 13, color: MUTED }}>Track all placed comments and posts across subreddits.</p>

          {/* Filters */}
          <div style={{ background: "#1e2a3b", border: `1px solid ${BORDER}`, borderRadius: 10, padding: "14px 20px", marginBottom: 20 }}>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 10 }}>
              <span style={{ fontSize: 11, color: MUTED, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", alignSelf: "center", marginRight: 4 }}>Status</span>
              {STATUS_FILTERS.map(f => <FilterChip key={f} label={f} active={statusFilter === f} onClick={() => setStatusFilter(f)} />)}
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              <span style={{ fontSize: 11, color: MUTED, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", alignSelf: "center", marginRight: 4 }}>Source</span>
              {SOURCE_FILTERS.map(f => <FilterChip key={f} label={f} active={sourceFilter === f} onClick={() => setSourceFilter(f as Source)} />)}
            </div>
          </div>

          {/* Table */}
          <div style={{ background: "#1e2a3b", border: `1px solid ${BORDER}`, borderRadius: 10, overflow: "hidden" }}>
            {/* Header — merged Upvotes+Replies into one Activity column */}
            <div style={{ display: "grid", gridTemplateColumns: "80px 110px 150px 180px 180px 80px 70px 1fr", background: SURFACE2, borderBottom: `1px solid ${BORDER}`, padding: "10px 16px", gap: 8 }}>
              {["ID", "Source", "Subreddit", "Scheduled", "Status", "Tier", "Credits", "Activity"].map(h => (
                <div key={h} style={{ fontSize: 11, fontWeight: 700, color: MUTED, textTransform: "uppercase", letterSpacing: "0.06em" }}>{h}</div>
              ))}
            </div>

            {filtered.length === 0 ? (
              <div style={{ padding: "40px", textAlign: "center", color: MUTED, fontSize: 13 }}>No tasks match the current filters.</div>
            ) : (
              filtered.map(task => {
                const isCancelled = cancelledTasks.has(task.id);
                const effectiveStatus = isCancelled ? "Refunded" : task.status;
                const isLive = task.status === "Live" && !isCancelled;

                return (
                  <div key={task.id}>
                    {/* Row */}
                    <div
                      onClick={() => { setExpanded(expanded === task.id ? null : task.id); setCancelConfirm(null); }}
                      style={{
                        display: "grid", gridTemplateColumns: "80px 110px 150px 180px 180px 80px 70px 1fr",
                        padding: "13px 16px", gap: 8, cursor: "pointer", alignItems: "center",
                        borderBottom: `1px solid ${BORDER}`,
                        background: expanded === task.id ? SURFACE2 : "transparent",
                        transition: "background 0.15s",
                      }}
                    >
                      <div style={{ fontSize: 12, fontWeight: 700, color: ORANGE }}>{task.id}</div>
                      <div style={{ fontSize: 12, color: MUTED2 }}>{task.source}</div>
                      <div style={{ fontSize: 12, fontWeight: 600, color: "#60a5fa" }}>{task.subreddit}</div>
                      <div style={{ fontSize: 11, color: MUTED }}>{task.scheduled}</div>

                      {/* Status + Boosted badge */}
                      <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                        <StatusBadge status={effectiveStatus} />
                        {task.boosted && !isCancelled && (
                          <span
                            onClick={e => { e.stopPropagation(); setBoostExpanded(boostExpanded === task.id ? null : task.id); }}
                            style={{ background: "rgba(232,93,47,0.2)", color: ORANGE, border: `1px solid ${ORANGE}`, padding: "2px 8px", borderRadius: 4, fontSize: 10, fontWeight: 700, cursor: "pointer", whiteSpace: "nowrap" }}
                          >
                            Boosted
                          </span>
                        )}
                      </div>

                      <div style={{ fontSize: 12, color: MUTED2 }}>{task.tier}</div>
                      <div style={{ fontSize: 12, color: task.credits > 0 ? TEXT : MUTED }}>{task.credits > 0 ? `${task.credits}cr` : "—"}</div>

                      {/* Activity column */}
                      <div>
                        {isLive ? (
                          <span style={{ fontSize: 11, color: MUTED }}>
                            {task.upvotes} ↑ &nbsp; {task.replies} 💬 &nbsp;
                            <span style={{ color: "#475569" }}>Updated 23m ago</span>
                          </span>
                        ) : (
                          <span style={{ fontSize: 12, color: MUTED }}>—</span>
                        )}
                      </div>
                    </div>

                    {/* Boost panel */}
                    {boostExpanded === task.id && (
                      <div style={{ padding: "10px 24px", background: "rgba(232,93,47,0.05)", borderBottom: `1px solid ${BORDER}`, borderLeft: `3px solid ${ORANGE}` }}>
                        <span style={{ fontSize: 12, color: MUTED2 }}>
                          Boost: <strong style={{ color: "#fff" }}>10 requested</strong> &nbsp;·&nbsp;
                          <strong style={{ color: "#4ade80" }}>8 completed</strong> &nbsp;·&nbsp;
                          <strong style={{ color: "#f87171" }}>2 failed</strong>
                        </span>
                      </div>
                    )}

                    {/* Expanded row */}
                    {expanded === task.id && (
                      <div style={{ padding: "20px 24px", background: "#0d1520", borderBottom: `1px solid ${BORDER}` }}>
                        <div style={{ maxWidth: 720 }}>
                          <div style={{ fontSize: 11, color: MUTED, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8 }}>Comment Placed</div>
                          <div style={{ background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 8, padding: "14px 16px", fontSize: 13, color: MUTED2, lineHeight: 1.7, marginBottom: 16, fontStyle: task.status === "Pending" ? "italic" : "normal" }}>
                            {task.comment}
                          </div>

                          {/* Mod/Automod removed — green "Within 3 days • Credits Refunded ✓" */}
                          {(task.status === "Mod Removed" || task.status === "Automod Removed") && task.removedDate && (
                            <div style={{ fontSize: 12, color: "#4ade80", marginBottom: 14, fontWeight: 600 }}>
                              Removed {task.removedDate} · Within 3 days · Credits Refunded ✓
                            </div>
                          )}

                          <div style={{ display: "flex", gap: 24, marginBottom: 16, flexWrap: "wrap" }}>
                            <div>
                              <div style={{ fontSize: 11, color: MUTED, marginBottom: 3 }}>Worker Tier</div>
                              <div style={{ fontSize: 13, color: TEXT, fontWeight: 600 }}>{task.tier}</div>
                            </div>
                            <div>
                              <div style={{ fontSize: 11, color: MUTED, marginBottom: 3 }}>Placed</div>
                              <div style={{ fontSize: 13, color: TEXT }}>{task.scheduled}</div>
                            </div>
                            <div>
                              <div style={{ fontSize: 11, color: MUTED, marginBottom: 3 }}>Last Engagement Update</div>
                              <div style={{ fontSize: 13, color: TEXT }}>Updated 23 minutes ago</div>
                            </div>
                          </div>

                          {/* Cancel confirmation flow for Pending tasks */}
                          {task.status === "Pending" && !isCancelled && (
                            cancelConfirm === task.id ? (
                              <div style={{ background: "#1a0505", border: "1px solid #450a0a", borderRadius: 8, padding: "14px 16px", marginBottom: 14 }}>
                                <div style={{ fontSize: 13, color: "#fca5a5", fontWeight: 600, marginBottom: 10 }}>
                                  Cancel this task? {task.credits} credits will be refunded.
                                </div>
                                <div style={{ display: "flex", gap: 8 }}>
                                  <button onClick={() => confirmCancel(task.id)} style={{ background: "#7f1d1d", color: "#fca5a5", border: "1px solid #991b1b", padding: "7px 16px", borderRadius: 7, fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
                                    Confirm Cancel
                                  </button>
                                  <button onClick={() => setCancelConfirm(null)} style={{ background: "transparent", border: `1px solid ${BORDER}`, color: MUTED2, padding: "7px 14px", borderRadius: 7, fontSize: 13, cursor: "pointer" }}>
                                    Keep Task
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <div style={{ marginBottom: 14 }}>
                                <button
                                  onClick={() => setCancelConfirm(task.id)}
                                  style={{ background: "transparent", border: `1px solid ${BORDER}`, color: MUTED2, padding: "7px 16px", borderRadius: 7, fontSize: 13, fontWeight: 600, cursor: "pointer" }}
                                >
                                  Cancel Task
                                </button>
                              </div>
                            )
                          )}

                          <div style={{ display: "flex", gap: 10 }}>
                            <a href="#" style={{ fontSize: 13, color: "#60a5fa", textDecoration: "none", fontWeight: 600, padding: "7px 14px", border: `1px solid ${BORDER}`, borderRadius: 7, background: SURFACE }}>
                              View on Reddit ↗
                            </a>
                            {(task.status === "Live" || task.status === "Completed") && (
                              <button style={{ background: ORANGE, color: "#fff", border: "none", padding: "7px 16px", borderRadius: 7, fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
                                Add Reply
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}

            {/* Pagination */}
            <div style={{ padding: "12px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", borderTop: `1px solid ${BORDER}`, background: SURFACE2 }}>
              <span style={{ fontSize: 12, color: MUTED }}>1–{filtered.length} of {filtered.length} task{filtered.length !== 1 ? "s" : ""}</span>
              <div style={{ display: "flex", gap: 6 }}>
                <button disabled style={{ background: "transparent", border: `1px solid ${BORDER}`, color: MUTED, padding: "5px 12px", borderRadius: 6, fontSize: 12, cursor: "not-allowed" }}>← Prev</button>
                <button disabled style={{ background: "transparent", border: `1px solid ${BORDER}`, color: MUTED, padding: "5px 12px", borderRadius: 6, fontSize: 12, cursor: "not-allowed" }}>Next →</button>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
