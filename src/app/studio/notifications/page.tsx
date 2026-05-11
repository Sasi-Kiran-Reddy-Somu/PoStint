"use client";
import { useState } from "react";
import Sidebar, { ORANGE, BORDER } from "@/components/studio/Sidebar";

const BG = "#0a0f1a";
const SURFACE = "#111827";
const TEXT = "#e2e8f0";
const MUTED = "#64748b";
const MUTED2 = "#94a3b8";

interface Notification {
  id: number;
  unread: boolean;
  iconBg: string;
  iconColor: string;
  iconSymbol: string;
  title: string;
  description: string;
  time: string;
  href: string;
}

const INITIAL_NOTIFICATIONS: Notification[] = [
  {
    id: 1, unread: true,
    iconBg: "#450a0a", iconColor: "#f87171", iconSymbol: "●",
    title: "New Brand Mention",
    description: "r/iPhone mentioned Blackbrookcase in a new post",
    time: "2 minutes ago",
    href: "/studio/reddit-mentions",
  },
  {
    id: 2, unread: true,
    iconBg: "#431407", iconColor: "#fb923c", iconSymbol: "↩",
    title: "New Reply to Your Comment",
    description: "u/techreviewer99 replied to your comment in r/iPhone",
    time: "15 minutes ago",
    href: "/studio/my-tasks",
  },
  {
    id: 3, unread: true,
    iconBg: "#14532d", iconColor: "#4ade80", iconSymbol: "✓",
    title: "Task Live",
    description: "Your comment in r/BuyItForLife is now live",
    time: "1 hour ago",
    href: "/studio/my-tasks",
  },
  {
    id: 4, unread: true,
    iconBg: "#1e3a5f", iconColor: "#60a5fa", iconSymbol: "⚑",
    title: "Competitor Mention",
    description: "Spigen was mentioned in r/Apple",
    time: "3 hours ago",
    href: "/studio/reddit-mentions",
  },
  {
    id: 5, unread: false,
    iconBg: "#450a0a", iconColor: "#f87171", iconSymbol: "!",
    title: "Task Mod Removed",
    description: "Your comment in r/minimalism was removed by a moderator. Credits refunded.",
    time: "Yesterday",
    href: "/studio/my-tasks",
  },
  {
    id: 6, unread: false,
    iconBg: "#431407", iconColor: "#fb923c", iconSymbol: "◎",
    title: "Credits Refunded",
    description: "8 credits have been returned to your balance",
    time: "Yesterday",
    href: "/studio/billing",
  },
  {
    id: 7, unread: false,
    iconBg: "#1e293b", iconColor: "#94a3b8", iconSymbol: "▦",
    title: "No New Opportunities Today",
    description: "No new opportunities on your update day. Create a post instead?",
    time: "2 days ago",
    href: "/studio/create-posts",
  },
  {
    id: 8, unread: false,
    iconBg: "#450a0a", iconColor: "#f87171", iconSymbol: "!",
    title: "Low Credit Balance",
    description: "Your balance is below 20 credits. Top up to continue placing content.",
    time: "3 days ago",
    href: "/studio/billing",
  },
];

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS);

  const markAllRead = () => setNotifications(n => n.map(item => ({ ...item, unread: false })));
  const markRead = (id: number) => setNotifications(n => n.map(item => item.id === id ? { ...item, unread: false } : item));

  const unreadCount = notifications.filter(n => n.unread).length;

  return (
    <div style={{ display: "flex", minHeight: "100vh", fontFamily: "'Inter', system-ui, sans-serif", background: BG, color: TEXT }}>
      <Sidebar activeNav="Notifications" />

      <div style={{ flex: 1, overflowY: "auto", padding: "36px 0" }}>
        <div style={{ maxWidth: 700, margin: "0 auto", padding: "0 32px" }}>

          {/* Header */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
            <div>
              <h1 style={{ margin: "0 0 2px", fontSize: 22, fontWeight: 700, color: "#fff" }}>Notifications</h1>
              {unreadCount > 0 && (
                <span style={{ fontSize: 12, color: MUTED }}>{unreadCount} unread</span>
              )}
            </div>
            <button
              onClick={markAllRead}
              disabled={unreadCount === 0}
              style={{
                background: "transparent", border: `1px solid ${BORDER}`, color: unreadCount > 0 ? MUTED2 : MUTED,
                padding: "7px 16px", borderRadius: 7, fontSize: 12, fontWeight: 600,
                cursor: unreadCount > 0 ? "pointer" : "not-allowed",
              }}
            >
              Mark all as read
            </button>
          </div>

          {/* Notification list */}
          <div style={{ display: "flex", flexDirection: "column", gap: 0, border: `1px solid ${BORDER}`, borderRadius: 10, overflow: "hidden" }}>
            {notifications.map((n, idx) => (
              <a
                key={n.id}
                href={n.href}
                onClick={() => markRead(n.id)}
                style={{
                  display: "flex", alignItems: "flex-start", gap: 14,
                  padding: "16px 20px",
                  background: n.unread ? "#0d1830" : SURFACE,
                  borderBottom: idx < notifications.length - 1 ? `1px solid ${BORDER}` : "none",
                  textDecoration: "none", cursor: "pointer",
                  position: "relative",
                  transition: "background 0.15s",
                }}
              >
                {/* Unread dot */}
                {n.unread && (
                  <div style={{
                    position: "absolute", left: 8, top: "50%", transform: "translateY(-50%)",
                    width: 6, height: 6, borderRadius: "50%", background: ORANGE, flexShrink: 0,
                  }} />
                )}

                {/* Icon */}
                <div style={{
                  width: 36, height: 36, borderRadius: 8, background: n.iconBg,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  flexShrink: 0, color: n.iconColor, fontSize: 14, fontWeight: 900,
                  marginLeft: n.unread ? 8 : 0,
                }}>
                  {n.iconSymbol}
                </div>

                {/* Content */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
                    <span style={{ fontSize: 13, fontWeight: n.unread ? 700 : 600, color: n.unread ? "#fff" : MUTED2 }}>
                      {n.title}
                    </span>
                    <span style={{ fontSize: 11, color: MUTED, whiteSpace: "nowrap", marginTop: 1 }}>{n.time}</span>
                  </div>
                  <div style={{ fontSize: 12, color: MUTED, marginTop: 3, lineHeight: 1.5 }}>{n.description}</div>
                </div>
              </a>
            ))}
          </div>

          {notifications.every(n => !n.unread) && (
            <div style={{ textAlign: "center", marginTop: 24, fontSize: 12, color: MUTED }}>
              All caught up — no unread notifications.
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
