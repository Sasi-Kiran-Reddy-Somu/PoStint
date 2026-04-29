"use client";
import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatRelativeTime } from "@/lib/utils";

interface Flag {
  id: string;
  ipAddress: string;
  workerIds: string[];
  eventCounts: Record<string, number>;
  severity: string;
  createdAt: string;
}

export default function IpOverlapPage() {
  const [flags, setFlags] = useState<Flag[]>([]);

  const refresh = async () => {
    const res = await fetch("/api/ops/ip-overlap");
    const data = await res.json();
    setFlags(data.flags ?? []);
  };
  useEffect(() => { refresh(); }, []);

  const resolve = async (flagId: string, resolution: "false_positive" | "confirmed_multi_account" | "trusted_shared", workerIds: string[]) => {
    const reason = prompt("Reason?") ?? "";
    if (!reason) return;
    await fetch("/api/ops/ip-overlap", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ flagId, resolution, reason, workerIds: resolution === "confirmed_multi_account" ? workerIds : [] }),
    });
    refresh();
  };

  const sev = (s: string) => {
    if (s === "critical") return "destructive";
    if (s === "high") return "destructive";
    if (s === "medium") return "warning";
    return "secondary";
  };

  return (
    <div className="max-w-6xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">IP Overlap Investigations</h1>
        <p className="text-slate-400 text-sm">{flags.length} open flags</p>
      </div>

      {flags.length === 0 ? (
        <Card className="bg-slate-900 border-slate-800">
          <CardContent className="py-12 text-center text-slate-500">No open IP overlap flags.</CardContent>
        </Card>
      ) : flags.map((f) => (
        <Card key={f.id} className="bg-slate-900 border-slate-800">
          <CardContent className="p-5">
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="font-mono text-white">{f.ipAddress}</div>
                <p className="text-xs text-slate-500 mt-1">Detected {formatRelativeTime(f.createdAt)} • {f.workerIds.length} workers involved</p>
              </div>
              <Badge variant={sev(f.severity) as "destructive" | "warning" | "secondary"}>{f.severity}</Badge>
            </div>
            <div className="space-y-1 mb-4">
              {f.workerIds.map((wid) => (
                <div key={wid} className="flex justify-between items-center text-sm">
                  <a href={`/ops/workers/${wid}`} className="text-red-400 hover:underline font-mono text-xs">{wid}</a>
                  <span className="text-slate-500 text-xs">{f.eventCounts[wid] ?? 0} events</span>
                </div>
              ))}
            </div>
            <div className="flex gap-2 flex-wrap">
              <Button size="sm" variant="outline" onClick={() => resolve(f.id, "false_positive", [])}>Mark False Positive</Button>
              <Button size="sm" variant="outline" onClick={() => resolve(f.id, "trusted_shared", [])}>Trusted Shared</Button>
              <Button size="sm" variant="destructive" onClick={() => resolve(f.id, "confirmed_multi_account", f.workerIds)}>Confirm Multi-Account (suspends all)</Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
