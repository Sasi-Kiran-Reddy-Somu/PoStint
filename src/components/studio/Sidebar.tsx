"use client";
import Link from "next/link";
import { useState, useEffect } from "react";

export const ORANGE = "#e85d2f";
export const SIDEBAR_BG = "#1e2a3b";
export const BORDER = "#1f2d3d";

const PROJECTS = ["Blackbrookcase", "Nomad Goods", "Bellroy UK"];

// Main nav items — reordered, no Notifications, no Billing/Settings
const NAV_ITEMS = [
  { label: "My Tasks", badge: null, info: null },
  { label: "Live Opportunities", badge: "6", info: "Reddit threads that AI engines are actively citing right now for your tracked prompts along with new posts matching your keywords. Best acted on quickly." },
  { label: "Evergreen Opportunities", badge: null, info: "Established Reddit threads ranking high on Google for your keywords. Might be older but still getting traffic." },
  { label: "Create Posts", badge: null, info: null },
  { label: "Reddit Mentions", badge: null, info: null },
];

const NAV_ROUTES: Record<string, string> = {
  "My Tasks": "/studio/my-tasks",
  "Live Opportunities": "/studio",
  "Evergreen Opportunities": "/studio/evergreen",
  "Create Posts": "/studio/create-posts",
  "Reddit Mentions": "/studio/reddit-mentions",
  "Brand Setup": "/studio/brand-setup",
  "Billing": "/studio/billing",
  "Help Center": "/studio/help-center",
  "Settings": "/studio/settings",
};

// Bottom utility links
const BOTTOM_ITEMS = [
  { label: "Brand Setup" },
  { label: "Billing" },
  { label: "Help Center" },
];

// Shared user state — in a real app this would come from context/API
// We expose setters so Settings page can update them
export let sidebarUsername = "Sasi Kumar";
export let sidebarAvatar = ""; // data URL or empty for animated default
export const setSidebarUsername = (v: string) => { sidebarUsername = v; };
export const setSidebarAvatar = (v: string) => { sidebarAvatar = v; };

interface SidebarProps { activeNav: string }

export default function Sidebar({ activeNav }: SidebarProps) {
  const [project, setProject] = useState("Blackbrookcase");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [tooltip, setTooltip] = useState<string | null>(null);
  const [showGuide, setShowGuide] = useState(false);
  const [username, setUsername] = useState(sidebarUsername);
  const [avatar, setAvatar] = useState(sidebarAvatar);
  const [hue, setHue] = useState(0);

  // Animate logo hue
  useEffect(() => {
    const t = setInterval(() => setHue(h => (h + 1) % 360), 30);
    return () => clearInterval(t);
  }, []);

  // Sync username/avatar from module-level state on mount
  useEffect(() => {
    setUsername(sidebarUsername);
    setAvatar(sidebarAvatar);
  }, []);

  return (
    <div style={{ width: 250, background: SIDEBAR_BG, display: "flex", flexDirection: "column", borderRight: `1px solid ${BORDER}`, flexShrink: 0, height: "100vh", position: "sticky", top: 0 }}>
      {/* Logo */}
      <div style={{ padding: "20px 16px 12px", borderBottom: `1px solid ${BORDER}` }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
          <div style={{ width: 28, height: 28, background: `hsl(${hue}, 85%, 55%)`, borderRadius: 6, flexShrink: 0, transition: "background 0.1s" }} />
          <span style={{ fontWeight: 700, fontSize: 15, color: "#fff", flex: 1 }}>Reddit Studio</span>
          {/* What is this? button */}
          <button
            onClick={() => setShowGuide(g => !g)}
            title="What is this?"
            style={{ background: "transparent", border: `1px solid ${BORDER}`, color: "#64748b", borderRadius: 6, width: 26, height: 26, fontSize: 13, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}
          >?</button>
        </div>

        {/* Guide panel */}
        {showGuide && (
          <div style={{ background: "#0d1520", border: `1px solid ${BORDER}`, borderRadius: 8, padding: "12px 14px", marginBottom: 12, fontSize: 12, color: "#94a3b8", lineHeight: 1.6 }}>
            <div style={{ fontWeight: 700, color: "#fff", marginBottom: 6, fontSize: 13 }}>What is Reddit Studio?</div>
            Reddit Studio helps brands get authentic visibility on Reddit — without ads. It finds relevant threads, generates natural comments, and dispatches real Reddit users (workers) to post them on your behalf.
            <div style={{ marginTop: 8, display: "flex", flexDirection: "column", gap: 4 }}>
              <div><span style={{ color: ORANGE }}>Live Opportunities</span> — fresh threads to engage now</div>
              <div><span style={{ color: ORANGE }}>Evergreen</span> — long-lived threads for sustained presence</div>
              <div><span style={{ color: ORANGE }}>Create Posts</span> — generate new discussion threads</div>
              <div><span style={{ color: ORANGE }}>My Tasks</span> — track all submitted tasks</div>
            </div>
            <button onClick={() => setShowGuide(false)} style={{ marginTop: 10, background: "transparent", border: "none", color: "#475569", fontSize: 11, cursor: "pointer", padding: 0 }}>Close ×</button>
          </div>
        )}

        {/* Project dropdown */}
        <div style={{ position: "relative" }}>
          <div
            onClick={() => setDropdownOpen(o => !o)}
            style={{ background: "#162032", border: `1px solid ${dropdownOpen ? ORANGE : BORDER}`, borderRadius: 8, padding: "8px 12px", display: "flex", alignItems: "center", justifyContent: "space-between", cursor: "pointer" }}
          >
            <div>
              <div style={{ fontSize: 10, color: "#64748b", marginBottom: 2, letterSpacing: "0.08em" }}>PROJECT</div>
              <div style={{ fontSize: 13, fontWeight: 600, color: "#e2e8f0" }}>{project}</div>
            </div>
            <span style={{ color: "#64748b", fontSize: 11, transform: dropdownOpen ? "rotate(180deg)" : "none", transition: "transform 0.2s" }}>▼</span>
          </div>

          {dropdownOpen && (
            <div style={{ position: "absolute", top: "calc(100% + 4px)", left: 0, right: 0, background: "#162032", border: `1px solid ${BORDER}`, borderRadius: 8, overflow: "hidden", zIndex: 100, boxShadow: "0 8px 24px rgba(0,0,0,0.4)" }}>
              {PROJECTS.map(p => (
                <div
                  key={p}
                  onClick={() => { setProject(p); setDropdownOpen(false); }}
                  style={{
                    padding: "10px 12px", fontSize: 13, cursor: "pointer",
                    color: p === project ? "#fff" : "#94a3b8",
                    background: p === project ? "rgba(232,93,47,0.15)" : "transparent",
                    borderLeft: `3px solid ${p === project ? ORANGE : "transparent"}`,
                    fontWeight: p === project ? 600 : 400,
                    transition: "background 0.1s",
                  }}
                >{p}</div>
              ))}
              <div style={{ borderTop: `1px solid ${BORDER}`, padding: "8px 12px", fontSize: 12, color: ORANGE, cursor: "pointer", fontWeight: 600 }}>
                + New Project
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main Nav */}
      <nav style={{ flex: 1, padding: "8px 0", overflowY: "auto" }}>
        {NAV_ITEMS.map((item) => {
          const isActive = activeNav === item.label;
          return (
            <div key={item.label} style={{ position: "relative" }}>
              <Link
                href={NAV_ROUTES[item.label]}
                style={{
                  display: "flex", alignItems: "center", gap: 10,
                  padding: "9px 16px", cursor: "pointer", fontSize: 13, fontWeight: 500,
                  color: isActive ? "#fff" : "#94a3b8",
                  background: isActive ? "rgba(232,93,47,0.15)" : "transparent",
                  borderLeft: isActive ? `3px solid ${ORANGE}` : "3px solid transparent",
                  textDecoration: "none", transition: "all 0.15s",
                }}
              >
                <span style={{ flex: 1 }}>{item.label}</span>
                {item.badge && (
                  <span style={{ background: ORANGE, color: "#fff", borderRadius: 99, fontSize: 10, fontWeight: 700, padding: "1px 6px" }}>
                    {item.badge}
                  </span>
                )}
                {item.info && (
                  <span
                    onMouseEnter={() => setTooltip(item.label)}
                    onMouseLeave={() => setTooltip(null)}
                    style={{ width: 16, height: 16, borderRadius: "50%", border: `1px solid #334155`, color: "#475569", fontSize: 10, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", cursor: "default", flexShrink: 0 }}
                  >i</span>
                )}
              </Link>
              {/* Tooltip */}
              {tooltip === item.label && item.info && (
                <div style={{
                  position: "fixed", left: 258, zIndex: 300,
                  background: "#0d1520", border: `1px solid ${BORDER}`,
                  borderRadius: 8, padding: "10px 14px", width: 220,
                  fontSize: 12, color: "#94a3b8", lineHeight: 1.6,
                  boxShadow: "0 8px 24px rgba(0,0,0,0.5)",
                }}>
                  <div style={{ fontWeight: 700, color: "#fff", marginBottom: 4, fontSize: 12 }}>{item.label}</div>
                  {item.info}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* Bottom utility links */}
      <div style={{ borderTop: `1px solid ${BORDER}`, padding: "8px 0" }}>
        {BOTTOM_ITEMS.map(item => {
          const isActive = activeNav === item.label;
          return (
            <Link
              key={item.label}
              href={NAV_ROUTES[item.label]}
              style={{
                display: "flex", alignItems: "center",
                padding: "9px 16px", fontSize: 13, fontWeight: 500,
                color: isActive ? "#fff" : "#94a3b8",
                background: isActive ? "rgba(232,93,47,0.15)" : "transparent",
                borderLeft: isActive ? `3px solid ${ORANGE}` : "3px solid transparent",
                textDecoration: "none", transition: "all 0.15s",
              }}
            >{item.label}</Link>
          );
        })}
      </div>

      {/* User row */}
      <div style={{ padding: "12px 16px", borderTop: `1px solid ${BORDER}`, display: "flex", alignItems: "center", gap: 10 }}>
        {avatar ? (
          <img src={avatar} alt="" style={{ width: 32, height: 32, borderRadius: "50%", objectFit: "cover", flexShrink: 0 }} />
        ) : (
          <div style={{ width: 32, height: 32, borderRadius: "50%", background: `hsl(${hue}, 70%, 50%)`, flexShrink: 0, transition: "background 0.1s" }} />
        )}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: "#e2e8f0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{username}</div>
          <div style={{ fontSize: 11, color: "#64748b" }}>Pro Plan</div>
        </div>
        <Link
          href="/studio/settings"
          title="Settings"
          style={{ color: activeNav === "Settings" ? ORANGE : "#64748b", textDecoration: "none", fontSize: 22, display: "flex", alignItems: "center", flexShrink: 0 }}
        >
          ⚙
        </Link>
      </div>
    </div>
  );
}
