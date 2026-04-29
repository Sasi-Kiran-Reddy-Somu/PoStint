"use client";
import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { formatRelativeTime } from "@/lib/utils";

interface Notif { id: string; title: string; body: string; read: boolean; createdAt: string; type: string }

export default function NotificationsPage() {
  const [notifs, setNotifs] = useState<Notif[]>([]);

  useEffect(() => {
    fetch("/api/worker/notifications").then(async (r) => {
      if (r.ok) {
        const data = await r.json();
        setNotifs(data.notifications);
      }
    });
    fetch("/api/worker/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ all: true }),
    });
  }, []);

  return (
    <div className="max-w-3xl space-y-4">
      <h1 className="text-2xl font-bold text-white">Notifications</h1>
      {notifs.length === 0 ? (
        <Card className="bg-slate-900 border-slate-800">
          <CardContent className="py-16 text-center text-slate-500">
            You&apos;re all caught up. New notifications will appear here.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {notifs.map((n) => (
            <Card key={n.id} className="bg-slate-900 border-slate-800">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="text-white font-medium">{n.title}</div>
                    <div className="text-sm text-slate-400 mt-1">{n.body}</div>
                  </div>
                  <div className="text-xs text-slate-600">{formatRelativeTime(n.createdAt)}</div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
