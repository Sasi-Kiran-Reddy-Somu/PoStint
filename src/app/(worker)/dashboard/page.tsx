import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { formatRelativeTime } from "@/lib/utils";
import Link from "next/link";

export default async function DashboardPage() {
  const session = await auth();
  if (!session) return null;
  const workerId = session.user.id;

  const [worker, recentTasks, availableTaskCount] = await Promise.all([
    prisma.worker.findUnique({ where: { id: workerId } }),
    prisma.taskAssignment.findMany({
      where: { workerId },
      include: { task: true },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
    prisma.task.count({ where: { status: "available", expiresAt: { gt: new Date() } } }),
  ]);

  if (!worker) return null;

  // Karma to T2 progress
  const t2Threshold = 5000;
  const currentKarma = (worker.karmaSnapshot as { total?: number } | null)?.total ?? 0;

  const healthColor = worker.accountHealthScore >= 70 ? "text-green-400" : worker.accountHealthScore >= 50 ? "text-yellow-400" : "text-red-400";
  const healthLabel = worker.accountHealthScore >= 70 ? "Healthy" : worker.accountHealthScore >= 50 ? "Watch" : "At risk";

  return (
    <div className="max-w-6xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Welcome back, {worker.displayName ?? worker.redditUsername}</h1>
        <p className="text-slate-400 mt-1">Here&apos;s what&apos;s happening with your account.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <Card className="bg-slate-900 border-slate-800">
          <CardHeader className="pb-2"><CardTitle className="text-sm text-slate-400">Tier</CardTitle></CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <Badge className={worker.tier === "tier_2" ? "bg-slate-300 text-slate-900" : "bg-amber-700 text-amber-100"}>
                {worker.tier === "tier_2" ? "Tier 2" : "Tier 1"}
              </Badge>
            </div>
            <p className="text-xs text-slate-500 mt-2">
              {worker.tier === "tier_2" ? "2 daily comments, posts unlocked" : "1 comment per day"}
            </p>
            {worker.tier === "tier_1" && (
              <div className="mt-3 space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500">Progress to Tier 2</span>
                  <span className="text-slate-400">{currentKarma} / {t2Threshold}</span>
                </div>
                <Progress value={Math.min(100, (currentKarma / t2Threshold) * 100)} className="h-1" />
                <p className="text-[10px] text-slate-600">T2 unlocks 2 daily tasks, posts, and higher pay</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-slate-800">
          <CardHeader className="pb-2"><CardTitle className="text-sm text-slate-400">Account Health</CardTitle></CardHeader>
          <CardContent>
            <div className={`text-3xl font-bold ${healthColor}`}>{worker.accountHealthScore}</div>
            <Progress value={worker.accountHealthScore} className="mt-2 h-2" />
            <p className="text-xs text-slate-500 mt-2">{healthLabel}</p>
          </CardContent>
        </Card>

      </div>

      <Card className="bg-slate-900 border-slate-800">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-white">Available tasks</CardTitle>
          <Link href="/tasks" className="text-sm text-red-400 hover:underline">View all →</Link>
        </CardHeader>
        <CardContent>
          {availableTaskCount > 0 ? (
            <p className="text-slate-400">
              <span className="text-2xl font-bold text-white">{availableTaskCount}</span> tasks waiting for you.
            </p>
          ) : (
            <p className="text-slate-500">No tasks available right now. We&apos;ll notify you when new ones appear.</p>
          )}
        </CardContent>
      </Card>

      <Card className="bg-slate-900 border-slate-800">
        <CardHeader><CardTitle className="text-white">Recent activity</CardTitle></CardHeader>
        <CardContent>
          {recentTasks.length === 0 ? (
            <p className="text-slate-500 text-sm">No tasks yet. Available tasks will appear on your dashboard.</p>
          ) : (
            <div className="space-y-2">
              {recentTasks.map((a) => (
                <div key={a.id} className="flex items-center justify-between py-2 border-b border-slate-800 last:border-0">
                  <div>
                    <div className="text-sm text-white">r/{a.task.targetSubreddit}</div>
                    <div className="text-xs text-slate-500">{formatRelativeTime(a.createdAt)} • {a.status}</div>
                  </div>
                  <div className="text-sm">
                    {a.status === "verified" ? <span className="text-green-400">+{a.task.creditValue} credits</span> :
                     a.status === "failed" || a.status === "expired" ? <span className="text-slate-500">—</span> :
                     <span className="text-amber-400">pending</span>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
