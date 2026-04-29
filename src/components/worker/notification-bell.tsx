"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Bell } from "lucide-react";
import { formatRelativeTime } from "@/lib/utils";

interface Notif {
  id: string;
  title: string;
  body: string;
  read: boolean;
  createdAt: string;
  type: string;
}

export function NotificationBell() {
  const [notifs, setNotifs] = useState<Notif[]>([]);
  const [open, setOpen] = useState(false);

  const fetchNotifs = async () => {
    try {
      const res = await fetch("/api/worker/notifications");
      if (res.ok) {
        const data = await res.json();
        setNotifs(data.notifications);
      }
    } catch {/* ignore */}
  };

  useEffect(() => {
    fetchNotifs();
    // Poll every 60s as websocket fallback
    const t = setInterval(fetchNotifs, 60_000);
    // Listen via SSE for real-time
    const sse = new EventSource("/api/worker/notifications?stream=true");
    sse.onmessage = () => fetchNotifs();
    return () => { clearInterval(t); sse.close(); };
  }, []);

  const unreadCount = notifs.filter((n) => !n.read).length;

  const markAllRead = async () => {
    await fetch("/api/worker/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ all: true }),
    });
    fetchNotifs();
  };

  return (
    <div className="relative">
      <button
        onClick={() => { setOpen((o) => !o); if (!open && unreadCount > 0) markAllRead(); }}
        className="relative p-2 hover:bg-slate-800 rounded-md text-slate-400 hover:text-white transition-colors"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-red-500 text-[10px] font-bold flex items-center justify-center text-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-12 w-80 bg-slate-900 border border-slate-800 rounded-md shadow-xl z-50 max-h-[500px] overflow-y-auto">
          <div className="p-3 border-b border-slate-800 flex items-center justify-between">
            <span className="text-sm font-semibold text-white">Notifications</span>
            <Link href="/notifications" className="text-xs text-red-400 hover:underline">View all</Link>
          </div>
          {notifs.length === 0 ? (
            <div className="p-6 text-center text-sm text-slate-500">
              You&apos;re all caught up. New notifications will appear here.
            </div>
          ) : (
            <div className="divide-y divide-slate-800">
              {notifs.slice(0, 10).map((n) => (
                <div key={n.id} className={`p-3 ${n.read ? "opacity-60" : ""}`}>
                  <div className="text-sm font-medium text-white">{n.title}</div>
                  <div className="text-xs text-slate-400 mt-0.5">{n.body}</div>
                  <div className="text-[10px] text-slate-600 mt-1">{formatRelativeTime(n.createdAt)}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
