"use client";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { formatRelativeTime, creditsToUsd } from "@/lib/utils";

interface Dispute {
  id: string;
  reasonCategory: string;
  workerExplanation: string;
  evidenceUrl?: string;
  status: string;
  openedAt: string;
  worker: { redditUsername: string; tier: string; accountHealthScore: number };
  taskAssignment: { id: string; postedUrl?: string; task: { targetSubreddit: string; creditValue: number } };
}

export default function DisputesPage() {
  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [notes, setNotes] = useState("");

  const refresh = async () => {
    const r = await fetch("/api/ops/disputes");
    const data = await r.json();
    setDisputes(data.disputes ?? []);
  };
  useEffect(() => { refresh(); }, []);

  const resolve = async (id: string, resolution: "upheld" | "reversed" | "partial", credits?: number) => {
    await fetch(`/api/ops/disputes/${id}/resolve`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ resolution, creditsPaid: credits, notes }),
    });
    setNotes("");
    setActiveId(null);
    refresh();
  };

  return (
    <div className="max-w-5xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Disputes</h1>
        <p className="text-slate-400 text-sm">{disputes.length} open disputes</p>
      </div>

      {disputes.length === 0 ? (
        <Card className="bg-slate-900 border-slate-800">
          <CardContent className="py-12 text-center text-slate-500">No open disputes.</CardContent>
        </Card>
      ) : disputes.map((d) => (
        <Card key={d.id} className="bg-slate-900 border-slate-800">
          <CardHeader>
            <CardTitle className="text-white text-base flex items-center justify-between">
              <span>u/{d.worker.redditUsername}</span>
              <Badge>{d.reasonCategory}</Badge>
            </CardTitle>
            <p className="text-xs text-slate-500">{formatRelativeTime(d.openedAt)} • r/{d.taskAssignment.task.targetSubreddit} • {d.taskAssignment.task.creditValue} credits ({creditsToUsd(d.taskAssignment.task.creditValue)})</p>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-slate-300 mb-3">{d.workerExplanation}</p>
            {d.evidenceUrl && <a href={d.evidenceUrl} target="_blank" rel="noreferrer" className="text-xs text-red-400 hover:underline">Evidence: {d.evidenceUrl}</a>}
            {d.taskAssignment.postedUrl && <p className="text-xs text-slate-500 mt-2">Posted URL: <a href={d.taskAssignment.postedUrl} target="_blank" rel="noreferrer" className="text-red-400">{d.taskAssignment.postedUrl}</a></p>}

            {activeId === d.id ? (
              <div className="space-y-3 mt-4">
                <Textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Reviewer notes (required)..."
                  className="bg-slate-800 border-slate-700 text-white"
                />
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => resolve(d.id, "upheld")}>Uphold (no change)</Button>
                  <Button size="sm" className="bg-green-700 hover:bg-green-600" onClick={() => resolve(d.id, "reversed", d.taskAssignment.task.creditValue)}>Reverse (pay credits)</Button>
                  <Button size="sm" variant="ghost" onClick={() => { setActiveId(null); setNotes(""); }}>Cancel</Button>
                </div>
              </div>
            ) : (
              <Button size="sm" className="mt-4" onClick={() => setActiveId(d.id)}>Resolve</Button>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
