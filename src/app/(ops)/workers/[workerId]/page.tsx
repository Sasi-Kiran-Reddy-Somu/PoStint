"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ArrowLeft } from "lucide-react";
import { formatDate, creditsToUsd } from "@/lib/utils";

interface WorkerDetail {
  id: string;
  redditUsername: string;
  email: string;
  tier: string;
  status: string;
  accountHealthScore: number;
  createdAt: string;
  country: string;
  payoutsEnabled: boolean;
  totalEarned: number;
  pending: number;
  available: number;
  recentAssignments: { id: string; task: { targetSubreddit: string }; status: string; claimedAt: string }[];
  recentIpEvents: { id: string; ipAddress: string; eventType: string; createdAt: string }[];
}

export default function WorkerDetailPage() {
  const { workerId } = useParams() as { workerId: string };
  const [w, setW] = useState<WorkerDetail | null>(null);
  const [adjAmount, setAdjAmount] = useState("");
  const [adjReason, setAdjReason] = useState("");

  const refresh = async () => {
    const r = await fetch(`/api/ops/workers/${workerId}`);
    if (r.ok) setW(await r.json());
  };

  useEffect(() => { refresh(); }, [workerId]);

  const action = async (path: string, body: object) => {
    const reason = prompt("Reason?") ?? "";
    if (!reason) return;
    await fetch(`/api/ops/workers/${workerId}/${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...body, reason }),
    });
    refresh();
  };

  const adjustCredits = async () => {
    const amount = parseInt(adjAmount);
    if (!amount || !adjReason) return;
    await fetch(`/api/ops/workers/${workerId}/adjust-credits`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount, reason: adjReason }),
    });
    setAdjAmount("");
    setAdjReason("");
    refresh();
  };

  if (!w) return <div className="text-slate-400">Loading...</div>;

  return (
    <div className="max-w-5xl space-y-6">
      <Link href="/ops/workers" className="text-slate-400 hover:text-white text-sm inline-flex items-center gap-1.5">
        <ArrowLeft className="w-4 h-4" /> Back to workers
      </Link>

      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">u/{w.redditUsername}</h1>
          <div className="flex gap-2 items-center mt-2 text-sm text-slate-400">
            <span>{w.email}</span><span>•</span><span>{w.country}</span><span>•</span>
            <span>Joined {formatDate(w.createdAt)}</span>
          </div>
        </div>
        <div className="flex gap-2">
          <Badge variant="secondary">{w.tier === "tier_2" ? "Tier 2" : "Tier 1"}</Badge>
          <Badge variant={w.status === "active" ? "success" : w.status === "paused" ? "warning" : w.status === "suspended" ? "destructive" : "secondary"}>{w.status}</Badge>
        </div>
      </div>

      {/* Quick actions */}
      <div className="flex flex-wrap gap-2">
        {w.status === "active" && (
          <>
            <Button size="sm" variant="outline" onClick={() => action("suspend", {})}>Suspend</Button>
            <Button size="sm" variant="outline" onClick={() => action("tier", { tier: w.tier === "tier_2" ? "tier_1" : "tier_2" })}>
              {w.tier === "tier_2" ? "Demote to T1" : "Promote to T2"}
            </Button>
          </>
        )}
        {(w.status === "paused" || w.status === "suspended") && (
          <Button size="sm" variant="outline" onClick={() => action("reactivate", {})}>Reactivate</Button>
        )}
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <Card className="bg-slate-900 border-slate-800">
          <CardHeader className="pb-2"><CardTitle className="text-sm text-slate-400">Health Score</CardTitle></CardHeader>
          <CardContent><div className="text-3xl font-bold text-white">{w.accountHealthScore}</div></CardContent>
        </Card>
        <Card className="bg-slate-900 border-slate-800">
          <CardHeader className="pb-2"><CardTitle className="text-sm text-slate-400">Pending Credits</CardTitle></CardHeader>
          <CardContent><div className="text-3xl font-bold text-amber-400">{w.pending}</div><p className="text-xs text-slate-500">{creditsToUsd(w.pending)}</p></CardContent>
        </Card>
        <Card className="bg-slate-900 border-slate-800">
          <CardHeader className="pb-2"><CardTitle className="text-sm text-slate-400">Available Credits</CardTitle></CardHeader>
          <CardContent><div className="text-3xl font-bold text-green-400">{w.available}</div><p className="text-xs text-slate-500">{creditsToUsd(w.available)}</p></CardContent>
        </Card>
      </div>

      <Card className="bg-slate-900 border-slate-800">
        <CardHeader><CardTitle className="text-white text-base">Adjust credits</CardTitle></CardHeader>
        <CardContent className="flex gap-2">
          <Input placeholder="Amount (negative to deduct)" type="number" value={adjAmount} onChange={(e) => setAdjAmount(e.target.value)} className="bg-slate-800 border-slate-700 text-white" />
          <Input placeholder="Reason" value={adjReason} onChange={(e) => setAdjReason(e.target.value)} className="bg-slate-800 border-slate-700 text-white" />
          <Button onClick={adjustCredits} className="bg-red-600 hover:bg-red-500">Apply</Button>
        </CardContent>
      </Card>

      <Card className="bg-slate-900 border-slate-800">
        <CardHeader><CardTitle className="text-white text-base">Recent task assignments</CardTitle></CardHeader>
        <CardContent>
          {w.recentAssignments.length === 0 ? <p className="text-slate-500 text-sm">No tasks yet.</p> : (
            <table className="w-full text-sm">
              <tbody>
                {w.recentAssignments.map((a) => (
                  <tr key={a.id} className="border-b border-slate-800">
                    <td className="py-2 text-slate-300">r/{a.task.targetSubreddit}</td>
                    <td className="py-2"><Badge>{a.status}</Badge></td>
                    <td className="py-2 text-slate-500 text-right">{formatDate(a.claimedAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>

      <Card className="bg-slate-900 border-slate-800">
        <CardHeader><CardTitle className="text-white text-base">Recent IP events</CardTitle></CardHeader>
        <CardContent>
          {w.recentIpEvents.length === 0 ? <p className="text-slate-500 text-sm">No IP events.</p> : (
            <table className="w-full text-sm">
              <tbody>
                {w.recentIpEvents.map((e) => (
                  <tr key={e.id} className="border-b border-slate-800">
                    <td className="py-2 font-mono text-xs text-slate-300">{e.ipAddress}</td>
                    <td className="py-2 text-slate-400">{e.eventType}</td>
                    <td className="py-2 text-slate-500 text-right">{formatDate(e.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
