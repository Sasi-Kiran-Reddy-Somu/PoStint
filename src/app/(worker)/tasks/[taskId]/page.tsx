"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { creditsToUsd } from "@/lib/utils";
import { ArrowLeft, Copy, ExternalLink, Check } from "lucide-react";

interface TaskBrief {
  subreddit?: string;
  threadTitle?: string;
  threadUrl?: string;
  commentText?: string;
  subredditUrl?: string;
  postTitle?: string;
  postBody?: string;
}

interface Task {
  id: string;
  targetSubreddit: string;
  targetThreadUrl?: string;
  threadTitle?: string;
  creditValue: number;
  brief: TaskBrief;
  type: string;
  minTier: string;
}

function CopyButton({ text, label = "Copy" }: { text: string; label?: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <Button variant="outline" size="sm" onClick={handleCopy} className="text-black">
      {copied ? <Check className="w-4 h-4 mr-1.5 text-green-500" /> : <Copy className="w-4 h-4 mr-1.5" />}
      {copied ? "Copied!" : label}
    </Button>
  );
}

function CommentTaskDetail({ task }: { task: Task }) {
  const brief = task.brief;
  return (
    <div className="space-y-4">
      {/* Subreddit */}
      <div className="flex items-center gap-3 bg-slate-800 rounded-md px-4 py-3">
        <span className="text-white font-semibold text-lg">r/{brief.subreddit ?? task.targetSubreddit}</span>
        <Badge variant="secondary">comment</Badge>
      </div>

      {/* Thread */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-slate-400">Target thread</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <p className="text-white text-sm">{brief.threadTitle ?? task.threadTitle}</p>
          {brief.threadUrl && (
            <div className="flex gap-2">
              <a href={brief.threadUrl} target="_blank" rel="noreferrer">
                <Button variant="outline" size="sm" className="text-black">
                  <ExternalLink className="w-4 h-4 mr-1.5" /> Open thread
                </Button>
              </a>
              <CopyButton text={brief.threadUrl} label="Copy URL" />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Comment text */}
      {brief.commentText && (
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-slate-400">Comment text — paste this exactly</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="bg-slate-900 rounded-md p-4 text-sm text-slate-200 whitespace-pre-wrap leading-relaxed">
              {brief.commentText}
            </div>
            <CopyButton text={brief.commentText} label="Copy comment" />
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function UpvoteTaskDetail({ task }: { task: Task }) {
  const brief = task.brief;
  return (
    <div className="space-y-4">
      {/* Subreddit */}
      <div className="flex items-center gap-3 bg-slate-800 rounded-md px-4 py-3">
        <span className="text-white font-semibold text-lg">r/{brief.subreddit ?? task.targetSubreddit}</span>
        <Badge variant="secondary">upvote</Badge>
      </div>

      {/* Thread */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-slate-400">Thread to upvote</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <p className="text-white text-sm">{brief.threadTitle ?? task.threadTitle}</p>
          {brief.threadUrl && (
            <div className="flex gap-2">
              <a href={brief.threadUrl} target="_blank" rel="noreferrer">
                <Button variant="outline" size="sm" className="text-black">
                  <ExternalLink className="w-4 h-4 mr-1.5" /> Open thread
                </Button>
              </a>
              <CopyButton text={brief.threadUrl} label="Copy URL" />
            </div>
          )}
        </CardContent>
      </Card>

      <p className="text-sm text-slate-400">Upvote the thread above, then submit the thread URL below to confirm.</p>
    </div>
  );
}

function PostTaskDetail({ task }: { task: Task }) {
  const brief = task.brief;
  return (
    <div className="space-y-4">
      {/* Subreddit */}
      <div className="flex items-center gap-3 bg-slate-800 rounded-md px-4 py-3">
        <span className="text-white font-semibold text-lg">r/{brief.subreddit ?? task.targetSubreddit}</span>
        <Badge variant="secondary">post</Badge>
        <Badge variant="warning" className="text-xs">Tier 2</Badge>
      </div>

      {/* Subreddit link */}
      {brief.subredditUrl && (
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-slate-400">Post in this subreddit</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <a href={brief.subredditUrl} target="_blank" rel="noreferrer">
                <Button variant="outline" size="sm" className="text-black">
                  <ExternalLink className="w-4 h-4 mr-1.5" /> Open subreddit
                </Button>
              </a>
              <CopyButton text={brief.subredditUrl} label="Copy URL" />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Post title */}
      {brief.postTitle && (
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-slate-400">Post title</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="bg-slate-900 rounded-md p-4 text-sm text-white font-medium">
              {brief.postTitle}
            </div>
            <CopyButton text={brief.postTitle} label="Copy title" />
          </CardContent>
        </Card>
      )}

      {/* Post body */}
      {brief.postBody && (
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-slate-400">Post body</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="bg-slate-900 rounded-md p-4 text-sm text-slate-200 whitespace-pre-wrap leading-relaxed">
              {brief.postBody}
            </div>
            <CopyButton text={brief.postBody} label="Copy body" />
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default function TaskDetailPage() {
  const { taskId } = useParams() as { taskId: string };
  const router = useRouter();
  const [task, setTask] = useState<Task | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [claiming, setClaiming] = useState(false);

  const [assignmentId, setAssignmentId] = useState<string | null>(null);
  const [submitDeadline, setSubmitDeadline] = useState<Date | null>(null);
  const [postedUrl, setPostedUrl] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [secondsLeft, setSecondsLeft] = useState(300);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    fetch("/api/worker/tasks").then(async (r) => {
      const data = await r.json();
      const t = (data.tasks ?? []).find((x: { id: string }) => x.id === taskId);
      if (t) setTask(t);
    });
  }, [taskId]);

  useEffect(() => {
    if (!submitDeadline) return;
    const interval = setInterval(() => {
      const left = Math.max(0, Math.floor((submitDeadline.getTime() - Date.now()) / 1000));
      setSecondsLeft(left);
      if (left === 0) clearInterval(interval);
    }, 250);
    return () => clearInterval(interval);
  }, [submitDeadline]);

  const handleClaim = async () => {
    setClaiming(true);
    const res = await fetch(`/api/worker/tasks/${taskId}/claim`, { method: "POST" });
    const data = await res.json();
    setClaiming(false);
    setConfirmOpen(false);
    if (!res.ok) {
      alert(data.error ?? "Claim failed");
      router.push("/tasks");
      return;
    }
    setAssignmentId(data.assignmentId);
    setSubmitDeadline(new Date(data.submitDeadline));
  };

  const validateUrl = (url: string) =>
    /^https?:\/\/(www\.|old\.)?reddit\.com\/.*\/comments\//.test(url);

  const handleSubmit = async () => {
    setSubmitError("");
    if (!validateUrl(postedUrl)) {
      setSubmitError("Please paste a valid Reddit URL.");
      return;
    }
    setSubmitting(true);
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 10000);
      const res = await fetch(`/api/worker/tasks/${taskId}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: postedUrl, assignmentId }),
        signal: controller.signal,
      });
      clearTimeout(timeout);
      const data = await res.json();
      setSubmitting(false);
      if (!res.ok) { setSubmitError(data.error ?? "Submission failed."); return; }
      setSubmitted(true);
    } catch {
      setSubmitting(false);
      setSubmitError("Request timed out. Please try again.");
    }
  };

  if (!task) return <div className="text-slate-400">Loading...</div>;

  // ── Submitted confirmation ──
  if (submitted) {
    return (
      <div className="max-w-md mx-auto py-16 text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-green-900/30 border border-green-700 flex items-center justify-center mx-auto">
          <Check className="w-8 h-8 text-green-400" />
        </div>
        <h2 className="text-2xl font-bold text-white">Task submitted!</h2>
        <p className="text-slate-400">Your submission is pending verification. Credits will appear in your earnings once verified.</p>
        <div className="flex gap-3 justify-center pt-2">
          <Link href="/earnings"><Button variant="outline" className="text-black">View earnings</Button></Link>
          <Link href="/tasks"><Button className="bg-red-600 hover:bg-red-500">Back to tasks</Button></Link>
        </div>
      </div>
    );
  }

  // ── Active submission view (timer running) ──
  if (assignmentId) {
    const timerColor = secondsLeft > 120 ? "text-green-400" : secondsLeft > 30 ? "text-yellow-400" : "text-red-400 animate-pulse";
    const mm = Math.floor(secondsLeft / 60).toString().padStart(2, "0");
    const ss = (secondsLeft % 60).toString().padStart(2, "0");

    return (
      <div className="max-w-2xl space-y-6">
        <div className="sticky top-0 bg-slate-950 -mx-6 px-6 py-4 border-b border-slate-800 z-10">
          <div className={`text-4xl font-mono font-bold text-center ${timerColor}`}>{mm}:{ss}</div>
          <p className="text-center text-xs text-slate-500 mt-1">Time remaining to submit</p>
        </div>

        {task.type === "comment" && <CommentTaskDetail task={task} />}
        {task.type === "upvote" && <UpvoteTaskDetail task={task} />}
        {task.type === "post" && <PostTaskDetail task={task} />}

        <Card className="bg-slate-900 border-slate-800">
          <CardHeader>
            <CardTitle className="text-white text-sm">
              {task.type === "post" ? "Paste the URL of your new post" : "Paste the URL of your comment/upvote"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Input
              placeholder="https://www.reddit.com/r/.../comments/..."
              value={postedUrl}
              onChange={(e) => setPostedUrl(e.target.value)}
              className="bg-slate-800 border-slate-700 text-white"
            />
            {submitError && <p className="text-sm text-red-400">{submitError}</p>}
            <Button
              onClick={handleSubmit}
              disabled={!validateUrl(postedUrl) || submitting || secondsLeft === 0}
              className="w-full bg-red-600 hover:bg-red-500"
            >
              {submitting ? "Submitting..." : "Submit"}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ── Detail view (before claim) ──
  return (
    <div className="max-w-3xl space-y-6">
      <Link href="/tasks" className="text-slate-400 hover:text-white inline-flex items-center gap-1.5 text-sm">
        <ArrowLeft className="w-4 h-4" /> Back to tasks
      </Link>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">r/{task.targetSubreddit}</h1>
          <p className="text-slate-400 text-sm mt-0.5">5 minutes to complete after claiming</p>
        </div>
        <div className="text-right">
          <div className="text-3xl font-bold text-red-400">{task.creditValue}</div>
          <div className="text-sm text-slate-400">{creditsToUsd(task.creditValue)}</div>
        </div>
      </div>

      {task.type === "comment" && <CommentTaskDetail task={task} />}
      {task.type === "upvote" && <UpvoteTaskDetail task={task} />}
      {task.type === "post" && <PostTaskDetail task={task} />}

      <Button onClick={() => setConfirmOpen(true)} className="w-full bg-red-600 hover:bg-red-500 text-lg py-6">
        Claim Task — Timer starts now
      </Button>

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent className="bg-slate-900 border-slate-800 text-white">
          <DialogHeader>
            <DialogTitle>Claim this task?</DialogTitle>
            <DialogDescription className="text-slate-400">
              You&apos;ll have <strong className="text-white">5 minutes</strong> to complete and submit the URL. The timer starts immediately.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button variant="outline" className="text-black" onClick={() => setConfirmOpen(false)}>Cancel</Button>
            <Button onClick={handleClaim} disabled={claiming} className="bg-red-600 hover:bg-red-500">
              {claiming ? "Claiming..." : "Start timer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
