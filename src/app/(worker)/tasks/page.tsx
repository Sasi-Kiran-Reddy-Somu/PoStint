"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

import { creditsToUsd } from "@/lib/utils";
import { Clock } from "lucide-react";

interface Task {
  id: string;
  targetSubreddit: string;
  type: string;
  brief: { threadTitle?: string; postTitle?: string } | string;
  creditValue: number;
  expiresAt: string;
  createdAt: string;
}

const typeBadgeColor: Record<string, string> = {
  comment: "bg-blue-900/40 text-blue-300 border-blue-800",
  upvote: "bg-green-900/40 text-green-300 border-green-800",
  post: "bg-amber-900/40 text-amber-300 border-amber-800",
};

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [capReached, setCapReached] = useState(false);
  const [dailyCap, setDailyCap] = useState(1);
  const [claimed, setClaimed] = useState(0);
  const [typeFilter, setTypeFilter] = useState<"all" | "comment" | "upvote" | "post">("all");
  const [tier, setTier] = useState<string>("tier_1");
  const [loading, setLoading] = useState(true);

  const fetchTasks = async () => {
    try {
      const res = await fetch(`/api/worker/tasks?sort=random&type=${typeFilter}`);
      const data = await res.json();
      setTasks(data.tasks ?? []);
      setCapReached(data.capReached ?? false);
      setDailyCap(data.dailyCap ?? 1);
      setClaimed(data.claimed ?? 0);
      setTier(data.tier ?? "tier_1");
    } catch {/* ignore */}
    finally { setLoading(false); }
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { fetchTasks(); }, [typeFilter]);
  useEffect(() => {
    const t = setInterval(fetchTasks, 30000);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [typeFilter]);

  const briefPreview = (brief: Task["brief"]): string => {
    if (typeof brief === "string") return brief.slice(0, 120);
    return (brief?.threadTitle ?? brief?.postTitle ?? "Task brief available after claim").slice(0, 120);
  };

  if (loading) return <div className="text-slate-400">Loading tasks...</div>;

  if (capReached) {
    return (
      <div className="max-w-3xl mx-auto text-center py-16">
        <Clock className="w-16 h-16 mx-auto text-slate-600 mb-4" />
        <h2 className="text-2xl font-bold text-white mb-2">Daily cap reached.</h2>
        <p className="text-slate-400">Your cap resets at midnight UTC. Check back then.</p>
        <p className="text-xs text-slate-600 mt-4">{claimed} of {dailyCap} used today</p>
      </div>
    );
  }

  const typeOptions: { value: "all" | "comment" | "upvote" | "post"; label: string }[] = [
    { value: "all", label: "All types" },
    { value: "comment", label: "Comments" },
    { value: "upvote", label: "Upvotes" },
    ...(tier === "tier_2" ? [{ value: "post" as const, label: "Posts" }] : []),
  ];

  return (
    <div className="max-w-5xl space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white">Available tasks</h1>
          <p className="text-slate-400 text-sm">{claimed} of {dailyCap} used today</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          {/* Type filter */}
          <div className="flex gap-1.5">
            {typeOptions.map((opt) => (
              <Button
                key={opt.value}
                size="sm"
                variant={typeFilter === opt.value ? "default" : "outline"}
                onClick={() => setTypeFilter(opt.value)}
                className={typeFilter === opt.value ? "bg-red-600 hover:bg-red-500 text-white" : "text-black"}
              >
                {opt.label}
              </Button>
            ))}
          </div>

        </div>
      </div>

      {tasks.length === 0 ? (
        <Card className="bg-slate-900 border-slate-800">
          <CardContent className="py-16 text-center">
            <p className="text-slate-400">No tasks right now. We&apos;ll notify you when new ones appear.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3">
          {tasks.map((task) => (
            <Card key={task.id} className="bg-slate-900 border-slate-800 hover:border-red-800 transition-colors">
              <CardContent className="p-5 flex items-center justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="text-white font-semibold">r/{task.targetSubreddit}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${typeBadgeColor[task.type] ?? "bg-slate-800 text-slate-300"}`}>
                      {task.type}
                    </span>
                  </div>
                  <p className="text-sm text-slate-400 line-clamp-2">{briefPreview(task.brief)}</p>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-xl font-bold text-red-400">{task.creditValue}</div>
                  <div className="text-xs text-slate-500">{creditsToUsd(task.creditValue)}</div>
                  <Link href={`/tasks/${task.id}`}>
                    <Button size="sm" className="mt-2 bg-red-600 hover:bg-red-500">Open</Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
