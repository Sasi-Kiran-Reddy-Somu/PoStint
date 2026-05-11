"use client";

export const ORANGE = "#e85d2f";
export const SIDEBAR_BG = "#1e2a3b";
export const BORDER = "#1f2d3d";

const NAV_ITEMS = [
  { label: "Brand Setup", badge: null },
  { label: "Live Opportunities", badge: "6" },
  { label: "Evergreen Opportunities", badge: null },
  { label: "Create Posts", badge: null },
  { label: "My Tasks", badge: null },
  { label: "Notifications", badge: null },
  { label: "Reddit Mentions", badge: null },
  { label: "Billing", badge: null },
  { label: "Settings", badge: null },
];

const NAV_ROUTES: Record<string, string> = {
  "Brand Setup": "/studio/brand-setup",
  "Live Opportunities": "/studio",
  "Evergreen Opportunities": "/studio/evergreen",
  "Create Posts": "/studio/create-posts",
  "My Tasks": "/studio/my-tasks",
  "Notifications": "/studio/notifications",
  "Reddit Mentions": "/studio/reddit-mentions",
  "Billing": "/studio/billing",
  "Settings": "/studio/settings",
};

interface SidebarProps { activeNav: string }

export default function Sidebar({ activeNav }: SidebarProps) {
  return (
    <div style={{ width: 250, background: SIDEBAR_BG, display: "flex", flexDirection: "column", borderRight: `1px solid ${BORDER}`, flexShrink: 0, height: "100vh", position: "sticky", top: 0 }}>
      {/* Logo */}
      <div style={{ padding: "20px 16px 12px", borderBottom: `1px solid ${BORDER}` }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
          <div style={{ width: 28, height: 28, background: ORANGE, borderRadius: 6 }} />
          <span style={{ fontWeight: 700, fontSize: 15, color: "#fff" }}>Reddit Studio</span>
        </div>
        <div style={{ background: "#162032", border: `1px solid ${BORDER}`, borderRadius: 8, padding: "8px 12px", display: "flex", alignItems: "center", justifyContent: "space-between", cursor: "pointer" }}>
          <div>
            <div style={{ fontSize: 10, color: "#64748b", marginBottom: 2, letterSpacing: "0.08em" }}>PROJECT</div>
            <div style={{ fontSize: 13, fontWeight: 600, color: "#e2e8f0" }}>Blackbrookcase</div>
          </div>
          <span style={{ color: "#64748b", fontSize: 11 }}>▼</span>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: "8px 0", overflowY: "auto" }}>
        {NAV_ITEMS.map((item) => {
          const isActive = activeNav === item.label;
          return (
            <a
              key={item.label}
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
              {item.label}
              {item.badge && (
                <span style={{ marginLeft: "auto", background: ORANGE, color: "#fff", borderRadius: 99, fontSize: 10, fontWeight: 700, padding: "1px 6px" }}>
                  {item.badge}
                </span>
              )}
            </a>
          );
        })}
      </nav>

      {/* User */}
      <div style={{ padding: "12px 16px", borderBottom: `1px solid ${BORDER}`, display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{ width: 32, height: 32, borderRadius: "50%", background: "#334155" }} />
        <div>
          <div style={{ fontSize: 12, fontWeight: 600, color: "#e2e8f0" }}>Blackbrook Team</div>
          <div style={{ fontSize: 11, color: "#64748b" }}>Pro Plan</div>
        </div>
      </div>
    </div>
  );
}
