"use client";
import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { ORANGE, BORDER } from "./Sidebar";

const NOTIFS = [
  { id: 1, title: "New Brand Mention", desc: "r/iPhone mentioned Blackbrookcase", time: "2 min ago", read: false },
  { id: 2, title: "New Reply", desc: "u/techreviewer99 replied to your comment", time: "15 min ago", read: false },
  { id: 3, title: "Task Live", desc: "Your comment in r/BuyItForLife is live", time: "1 hour ago", read: false },
  { id: 4, title: "Competitor Mention", desc: "Spigen mentioned in r/Apple", time: "3 hours ago", read: false },
  { id: 5, title: "Mod Removed", desc: "Comment in r/minimalism was removed. Credits refunded.", time: "Yesterday", read: true },
];

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [notifs, setNotifs] = useState(NOTIFS);
  const ref = useRef<HTMLDivElement>(null);

  const unread = notifs.filter(n => !n.read).length;

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleOpen = () => {
    setOpen(o => !o);
    // Mark all as read when opened
    if (!open) setNotifs(n => n.map(item => ({ ...item, read: true })));
  };

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <button
        onClick={handleOpen}
        style={{ position: "relative", background: "transparent", border: "none", cursor: "pointer", padding: "6px 8px", display: "flex", alignItems: "center" }}
      >
        {/* Bell icon */}
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
        {unread > 0 && (
          <span style={{
            position: "absolute", top: 2, right: 2,
            background: "#ef4444", color: "#fff", borderRadius: 99,
            fontSize: 9, fontWeight: 800, minWidth: 16, height: 16,
            display: "flex", alignItems: "center", justifyContent: "center",
            padding: "0 4px", lineHeight: 1,
          }}>
            {unread}
          </span>
        )}
      </button>

      {open && (
        <div style={{
          position: "absolute", top: "calc(100% + 8px)", right: 0,
          width: 300, background: "#1e2a3b", border: `1px solid ${BORDER}`,
          borderRadius: 10, boxShadow: "0 12px 32px rgba(0,0,0,0.5)", zIndex: 200, overflow: "hidden",
        }}>
          <div style={{ padding: "12px 16px", borderBottom: `1px solid ${BORDER}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: "#fff" }}>Notifications</span>
          </div>

          {notifs.map((n, i) => (
            <div
              key={n.id}
              style={{
                padding: "11px 16px",
                background: n.read ? "transparent" : "rgba(59,130,246,0.06)",
                borderBottom: i < notifs.length - 1 ? `1px solid ${BORDER}` : "none",
                display: "flex", alignItems: "flex-start", gap: 10,
              }}
            >
              {/* Unread dot */}
              <div style={{ width: 7, height: 7, borderRadius: "50%", background: n.read ? "transparent" : "#3b82f6", flexShrink: 0, marginTop: 5 }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 12, fontWeight: n.read ? 500 : 700, color: n.read ? "#94a3b8" : "#fff", marginBottom: 2 }}>{n.title}</div>
                <div style={{ fontSize: 11, color: "#64748b", lineHeight: 1.4, marginBottom: 3 }}>{n.desc}</div>
                <div style={{ fontSize: 10, color: "#475569" }}>{n.time}</div>
              </div>
            </div>
          ))}

          <div style={{ padding: "10px 16px", borderTop: `1px solid ${BORDER}`, textAlign: "center" }}>
            <Link href="/studio/notifications" onClick={() => setOpen(false)} style={{ fontSize: 12, color: ORANGE, textDecoration: "none", fontWeight: 600 }}>
              View all notifications →
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
