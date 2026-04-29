"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ArrowLeft, ExternalLink } from "lucide-react";

interface AppDetail {
  id: string;
  redditUsername: string;
  email: string;
  country: string;
  filterResults: Record<string, { value: unknown; required: unknown; passed: boolean }>;
  llmScore: number | null;
  llmScoreCategory: string | null;
  llmScoreDetails: { scores?: { comment: string; subreddit: string; score: number; reason: string }[] } | null;
}

export default function ApplicationDetail() {
  const { applicationId } = useParams() as { applicationId: string };
  const router = useRouter();
  const [app, setApp] = useState<AppDetail | null>(null);
  const [notes, setNotes] = useState("");
  const [rejectModal, setRejectModal] = useState(false);
  const [rejectionCategory, setRejectionCategory] = useState("low_quality_comments");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetch(`/api/ops/applications/${applicationId}`).then(async (r) => {
      if (r.ok) setApp(await r.json());
    });
  }, [applicationId]);

  const approve = async () => {
    setSubmitting(true);
    const res = await fetch(`/api/ops/applications/${applicationId}/approve`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ notes }),
    });
    setSubmitting(false);
    if (res.ok) router.push("/ops/vetting");
  };

  const reject = async () => {
    setSubmitting(true);
    const res = await fetch(`/api/ops/applications/${applicationId}/reject`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ rejectionCategory, notes }),
    });
    setSubmitting(false);
    if (res.ok) router.push("/ops/vetting");
  };

  if (!app) return <div className="text-slate-400">Loading...</div>;

  return (
    <div className="max-w-4xl space-y-6">
      <Link href="/ops/vetting" className="text-slate-400 hover:text-white text-sm inline-flex items-center gap-1.5">
        <ArrowLeft className="w-4 h-4" /> Back to queue
      </Link>

      <div>
        <h1 className="text-2xl font-bold text-white">u/{app.redditUsername}</h1>
        <div className="flex gap-3 items-center mt-1 text-sm text-slate-400">
          <span>{app.email}</span>
          <span>•</span>
          <span>{app.country}</span>
          <a href={`https://www.reddit.com/u/${app.redditUsername}`} target="_blank" rel="noreferrer" className="text-red-400 hover:underline inline-flex items-center gap-1">
            View on Reddit <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>

      <Card className="bg-slate-900 border-slate-800">
        <CardHeader><CardTitle className="text-white">Filter results</CardTitle></CardHeader>
        <CardContent>
          {app.filterResults ? (
            <div className="space-y-2">
              {Object.entries(app.filterResults).map(([key, val]) => (
                <div key={key} className="flex justify-between items-center text-sm">
                  <span className="text-slate-300">{key}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-500">{JSON.stringify(val.value)}</span>
                    {val.passed ? <Badge variant="success">Pass</Badge> : <Badge variant="destructive">Fail</Badge>}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-slate-500 text-sm">Filter still running.</p>
          )}
        </CardContent>
      </Card>

      <Card className="bg-slate-900 border-slate-800">
        <CardHeader>
          <CardTitle className="text-white flex justify-between items-center">
            LLM Quality Score
            {app.llmScore !== null && (
              <Badge variant={app.llmScoreCategory === "high" ? "success" : app.llmScoreCategory === "low" ? "destructive" : "warning"}>
                {app.llmScore.toFixed(1)} / 10 — {app.llmScoreCategory}
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {app.llmScoreDetails?.scores ? (
            <div className="space-y-3">
              {app.llmScoreDetails.scores.slice(0, 5).map((s, i) => (
                <div key={i} className="bg-slate-800 rounded-md p-3">
                  <div className="flex justify-between items-start mb-1">
                    <span className="text-xs text-slate-500">r/{s.subreddit}</span>
                    <Badge>{s.score.toFixed(1)}</Badge>
                  </div>
                  <p className="text-sm text-slate-300">{s.comment}</p>
                  <p className="text-xs italic text-slate-500 mt-1">{s.reason}</p>
                </div>
              ))}
            </div>
          ) : <p className="text-slate-500 text-sm">LLM scoring pending.</p>}
        </CardContent>
      </Card>

      <Card className="bg-slate-900 border-slate-800">
        <CardHeader><CardTitle className="text-white">Reviewer notes</CardTitle></CardHeader>
        <CardContent>
          <Textarea
            placeholder="Add internal notes (visible only to ops)..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="bg-slate-800 border-slate-700 text-white"
          />
        </CardContent>
      </Card>

      <div className="flex gap-3">
        <Button onClick={approve} disabled={submitting} className="bg-green-700 hover:bg-green-600">Approve</Button>
        <Button onClick={() => setRejectModal(true)} disabled={submitting} variant="destructive">Reject</Button>
      </div>

      <Dialog open={rejectModal} onOpenChange={setRejectModal}>
        <DialogContent className="bg-slate-900 border-slate-800 text-white">
          <DialogHeader>
            <DialogTitle>Reject this application?</DialogTitle>
            <DialogDescription className="text-slate-400">This cannot be undone.</DialogDescription>
          </DialogHeader>
          <Select value={rejectionCategory} onValueChange={setRejectionCategory}>
            <SelectTrigger className="bg-slate-800 border-slate-700 text-white"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="low_quality_comments">Low quality comments</SelectItem>
              <SelectItem value="account_too_new">Account too new</SelectItem>
              <SelectItem value="bot_pattern_detected">Bot pattern detected</SelectItem>
              <SelectItem value="insufficient_activity">Insufficient activity</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setRejectModal(false)}>Cancel</Button>
            <Button onClick={reject} disabled={submitting} variant="destructive">Confirm Reject</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
