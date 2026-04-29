"use client";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { creditsToUsd, formatDate } from "@/lib/utils";
import { Tabs } from "@/components/ui/simple-tabs";

interface Assignment {
  id: string;
  status: string;
  task: { targetSubreddit: string; creditValue: number };
  claimedAt: string;
  submittedAt?: string;
  verifiedAt?: string;
  postedUrl?: string;
  verificationState?: string;
  disputeId?: string;
}

interface Withdrawal {
  id: string;
  amountCredits: number;
  amountDollars: number;
  status: string;
  initiatedAt: string;
  completedAt?: string;
  failureReason?: string;
}

interface TaxDoc {
  id: string;
  year: number;
  docType: string;
  storageUrl: string;
  generatedAt: string;
}

const statusBadge = (s: string) => {
  if (s === "verified") return <Badge variant="success">Verified</Badge>;
  if (s === "failed") return <Badge variant="destructive">Failed</Badge>;
  if (s === "expired") return <Badge variant="secondary">Expired</Badge>;
  if (s === "submitted" || s === "pending_verification") return <Badge variant="warning">Pending Verification</Badge>;
  return <Badge variant="secondary">{s}</Badge>;
};

export default function HistoryPage() {
  const [tab, setTab] = useState<"tasks" | "withdrawals" | "taxes">("tasks");
  const [filter, setFilter] = useState<string>("all");
  const [tasks, setTasks] = useState<Assignment[]>([]);
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [taxDocs, setTaxDocs] = useState<TaxDoc[]>([]);

  // Dispute modal state
  const [disputeTarget, setDisputeTarget] = useState<Assignment | null>(null);
  const [reasonCategory, setReasonCategory] = useState("task_not_credited");
  const [explanation, setExplanation] = useState("");
  const [evidenceUrl, setEvidenceUrl] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [disputeSuccess, setDisputeSuccess] = useState(false);

  const loadTasks = async () => {
    const r = await fetch("/api/worker/history");
    if (r.ok) {
      const data = await r.json();
      setTasks(data.assignments ?? []);
    }
  };

  useEffect(() => {
    loadTasks();
    fetch("/api/worker/withdrawals").then(async (r) => {
      if (r.ok) setWithdrawals((await r.json()).withdrawals ?? []);
    });
    fetch("/api/worker/tax-documents").then(async (r) => {
      if (r.ok) setTaxDocs((await r.json()).documents ?? []);
    });
  }, []);

  const filteredTasks = tasks.filter((t) => {
    if (filter === "all") return true;
    if (filter === "verified") return t.status === "verified";
    if (filter === "failed") return t.status === "failed";
    if (filter === "pending") return t.status === "submitted" || t.status === "pending_verification";
    if (filter === "expired") return t.status === "expired";
    return true;
  });

  const submitDispute = async () => {
    if (!disputeTarget || !explanation.trim()) return;
    setSubmitting(true);
    const res = await fetch("/api/worker/disputes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        taskAssignmentId: disputeTarget.id,
        reasonCategory,
        workerExplanation: explanation,
        evidenceUrl,
      }),
    });
    setSubmitting(false);
    if (res.ok) {
      setDisputeSuccess(true);
      await loadTasks();
    }
  };

  const closeDisputeModal = () => {
    setDisputeTarget(null);
    setExplanation("");
    setEvidenceUrl("");
    setReasonCategory("task_not_credited");
    setDisputeSuccess(false);
  };

  return (
    <div className="max-w-5xl space-y-6">
      <h1 className="text-2xl font-bold text-white">History</h1>

      <Tabs value={tab} onChange={(v) => setTab(v as "tasks" | "withdrawals" | "taxes")} options={[
        { value: "tasks", label: "Tasks" },
        { value: "withdrawals", label: "Withdrawals" },
        { value: "taxes", label: "Tax Documents" },
      ]} />

      {tab === "tasks" && (
        <>
          <div className="flex gap-2 flex-wrap">
            {["all", "verified", "failed", "pending", "expired"].map((f) => (
              <Button
                key={f}
                size="sm"
                variant={filter === f ? "default" : "outline"}
                onClick={() => setFilter(f)}
                className={filter === f ? "bg-red-600 hover:bg-red-500 text-white" : "text-black"}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </Button>
            ))}
          </div>

          <Card className="bg-slate-900 border-slate-800">
            <CardContent className="p-0">
              {filteredTasks.length === 0 ? (
                <div className="p-12 text-center text-slate-500">No tasks match this filter.</div>
              ) : (
                <table className="w-full text-sm">
                  <thead className="border-b border-slate-800 text-xs text-slate-500">
                    <tr>
                      <th className="text-left p-3">Subreddit</th>
                      <th className="text-left p-3">Submitted</th>
                      <th className="text-left p-3">Verified</th>
                      <th className="text-left p-3">Status</th>
                      <th className="text-right p-3">Credits</th>
                      <th className="p-3"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTasks.map((a) => (
                      <tr key={a.id} className="border-b border-slate-800 hover:bg-slate-800/50">
                        <td className="p-3 text-white">r/{a.task.targetSubreddit}</td>
                        <td className="p-3 text-slate-400">{a.submittedAt ? formatDate(a.submittedAt) : "—"}</td>
                        <td className="p-3 text-slate-400">{a.verifiedAt ? formatDate(a.verifiedAt) : "—"}</td>
                        <td className="p-3">{statusBadge(a.status)}</td>
                        <td className="p-3 text-right">
                          {a.status === "verified" ? (
                            <span className="text-green-400">+{a.task.creditValue}</span>
                          ) : (
                            <span className="text-slate-600">—</span>
                          )}
                        </td>
                        <td className="p-3 text-right">
                          {(a.status === "failed" || a.status === "expired") && !a.disputeId && (
                            <Button size="sm" variant="ghost" className="text-red-400 hover:text-red-300 text-xs" onClick={() => setDisputeTarget(a)}>
                              Dispute
                            </Button>
                          )}
                          {a.disputeId && (
                            <span className="text-xs text-slate-500">Disputed</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </CardContent>
          </Card>
        </>
      )}

      {tab === "withdrawals" && (
        <Card className="bg-slate-900 border-slate-800">
          <CardContent className="p-0">
            {withdrawals.length === 0 ? (
              <div className="p-12 text-center text-slate-500">
                No withdrawals yet. Earn 2,000 credits to make your first withdrawal.
              </div>
            ) : (
              <table className="w-full text-sm">
                <thead className="border-b border-slate-800 text-xs text-slate-500">
                  <tr>
                    <th className="text-left p-3">Date</th>
                    <th className="text-left p-3">Amount</th>
                    <th className="text-left p-3">Status</th>
                    <th className="text-left p-3">Reference</th>
                  </tr>
                </thead>
                <tbody>
                  {withdrawals.map((w) => (
                    <tr key={w.id} className="border-b border-slate-800">
                      <td className="p-3 text-slate-400">{formatDate(w.initiatedAt)}</td>
                      <td className="p-3 text-white">{w.amountCredits} credits ({creditsToUsd(w.amountCredits)})</td>
                      <td className="p-3">
                        <Badge variant={w.status === "completed" ? "success" : w.status === "failed" ? "destructive" : "warning"}>
                          {w.status}
                        </Badge>
                      </td>
                      <td className="p-3 text-xs text-slate-500 font-mono">{w.id.slice(0, 12)}...</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </CardContent>
        </Card>
      )}

      {tab === "taxes" && (
        <Card className="bg-slate-900 border-slate-800">
          <CardHeader><CardTitle className="text-white text-base">Tax Documents</CardTitle></CardHeader>
          <CardContent>
            {taxDocs.length === 0 ? (
              <p className="text-slate-500 text-sm">No tax documents available yet. Documents are generated on January 31 for the prior tax year if you earned above the reporting threshold.</p>
            ) : (
              <div className="space-y-3">
                {taxDocs.map((doc) => (
                  <div key={doc.id} className="flex items-center justify-between bg-slate-800 rounded-md p-3">
                    <div>
                      <p className="text-white font-medium">{doc.year} {doc.docType}</p>
                      <p className="text-xs text-slate-400">Generated {formatDate(doc.generatedAt)}</p>
                    </div>
                    <Badge variant="success">Available</Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Dispute modal */}
      <Dialog open={!!disputeTarget} onOpenChange={(o) => { if (!o) closeDisputeModal(); }}>
        <DialogContent className="bg-slate-900 border-slate-800 text-white">
          <DialogHeader>
            <DialogTitle>Submit a Dispute</DialogTitle>
            <DialogDescription className="text-slate-400">
              {disputeTarget && `r/${disputeTarget.task.targetSubreddit} • ${disputeTarget.status}`}
            </DialogDescription>
          </DialogHeader>

          {disputeSuccess ? (
            <div className="py-4 text-center">
              <p className="text-green-400 font-medium">Dispute submitted successfully.</p>
              <p className="text-slate-400 text-sm mt-1">Our team will review your dispute and respond within 5 business days.</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="text-sm text-slate-400 mb-1 block">Reason</label>
                <Select value={reasonCategory} onValueChange={setReasonCategory}>
                  <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="task_not_credited">Task completed but not credited</SelectItem>
                    <SelectItem value="incorrect_rejection">Verification failed incorrectly</SelectItem>
                    <SelectItem value="technical_issue">Technical issue prevented submission</SelectItem>
                    <SelectItem value="timer_expired_early">Timer expired prematurely</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm text-slate-400 mb-1 block">Explanation <span className="text-red-400">*</span></label>
                <Textarea
                  value={explanation}
                  onChange={(e) => setExplanation(e.target.value)}
                  placeholder="Describe what happened in detail..."
                  className="bg-slate-800 border-slate-700 text-white"
                  rows={4}
                />
              </div>
              <div>
                <label className="text-sm text-slate-400 mb-1 block">Evidence URL (optional)</label>
                <Input
                  value={evidenceUrl}
                  onChange={(e) => setEvidenceUrl(e.target.value)}
                  placeholder="https://reddit.com/..."
                  className="bg-slate-800 border-slate-700 text-white"
                />
              </div>
            </div>
          )}

          <DialogFooter className="gap-2">
            <Button variant="outline" className="text-black" onClick={closeDisputeModal}>
              {disputeSuccess ? "Close" : "Cancel"}
            </Button>
            {!disputeSuccess && (
              <Button
                onClick={submitDispute}
                disabled={submitting || !explanation.trim()}
                className="bg-red-600 hover:bg-red-500"
              >
                {submitting ? "Submitting..." : "Submit Dispute"}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
