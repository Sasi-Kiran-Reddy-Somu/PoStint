"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { formatRelativeTime } from "@/lib/utils";

interface Worker {
  id: string;
  redditUsername: string;
  email: string;
  tier: string;
  status: string;
  accountHealthScore: number;
  createdAt: string;
  country: string;
  _count: { taskAssignments: number };
}

export default function WorkersPage() {
  const [q, setQ] = useState("");
  const [workers, setWorkers] = useState<Worker[]>([]);

  useEffect(() => {
    const t = setTimeout(() => {
      fetch(`/api/ops/workers?q=${encodeURIComponent(q)}`).then(async (r) => {
        const data = await r.json();
        setWorkers(data.workers ?? []);
      });
    }, 200);
    return () => clearTimeout(t);
  }, [q]);

  const statusColor = (s: string) => {
    if (s === "active") return "success";
    if (s === "paused") return "warning";
    if (s === "suspended") return "destructive";
    return "secondary";
  };

  return (
    <div className="max-w-7xl space-y-6">
      <h1 className="text-2xl font-bold text-white">Workers</h1>

      <Input
        placeholder="Search by username, email, or worker ID..."
        value={q}
        onChange={(e) => setQ(e.target.value)}
        className="bg-slate-900 border-slate-800 text-white max-w-md"
      />

      <Card className="bg-slate-900 border-slate-800">
        <CardContent className="p-0">
          <table className="w-full text-sm">
            <thead className="border-b border-slate-800 text-xs text-slate-500">
              <tr>
                <th className="text-left p-3">Worker</th>
                <th className="text-left p-3">Tier</th>
                <th className="text-left p-3">Status</th>
                <th className="text-left p-3">Health</th>
                <th className="text-left p-3">Tasks</th>
                <th className="text-left p-3">Joined</th>
              </tr>
            </thead>
            <tbody>
              {workers.map((w) => (
                <tr key={w.id} className="border-b border-slate-800 hover:bg-slate-800/40">
                  <td className="p-3">
                    <Link href={`/ops/workers/${w.id}`} className="text-white hover:underline">u/{w.redditUsername}</Link>
                    <div className="text-xs text-slate-500">{w.email}</div>
                  </td>
                  <td className="p-3"><Badge variant="secondary">{w.tier === "tier_2" ? "T2" : "T1"}</Badge></td>
                  <td className="p-3"><Badge variant={statusColor(w.status) as "success" | "warning" | "destructive" | "secondary"}>{w.status}</Badge></td>
                  <td className="p-3 text-slate-300">{w.accountHealthScore}</td>
                  <td className="p-3 text-slate-400">{w._count.taskAssignments}</td>
                  <td className="p-3 text-slate-400">{formatRelativeTime(w.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
