"use client";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface Report {
  activeWorkers: number;
  taskThroughput: number;
  t3SurvivalRate: string;
  avgFirstEarningDays: string;
  pendingWithdrawals: { count: number; totalDollars: number };
  workerStatusDistribution: { status: string; _count: number }[];
  verificationBreakdown: { verificationState: string; _count: number }[];
}

export default function ReportsPage() {
  const [days, setDays] = useState(30);
  const [report, setReport] = useState<Report | null>(null);

  useEffect(() => {
    fetch(`/api/ops/reports?days=${days}`).then(async (r) => {
      if (r.ok) setReport(await r.json());
    });
  }, [days]);

  if (!report) return <div className="text-slate-400">Loading...</div>;

  return (
    <div className="max-w-6xl space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Platform Reports</h1>
        <div className="flex gap-2">
          {[7, 30, 90].map((d) => (
            <Button
              key={d}
              size="sm"
              variant={days === d ? "default" : "outline"}
              onClick={() => setDays(d)}
              className={days === d ? "bg-red-600 hover:bg-red-500" : ""}
            >
              {d}d
            </Button>
          ))}
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <Card className="bg-slate-900 border-slate-800">
          <CardHeader className="pb-2"><CardTitle className="text-sm text-slate-400">Active workers</CardTitle></CardHeader>
          <CardContent><div className="text-3xl font-bold text-white">{report.activeWorkers}</div></CardContent>
        </Card>
        <Card className="bg-slate-900 border-slate-800">
          <CardHeader className="pb-2"><CardTitle className="text-sm text-slate-400">Task throughput</CardTitle></CardHeader>
          <CardContent><div className="text-3xl font-bold text-white">{report.taskThroughput}</div><p className="text-xs text-slate-500">verified + failed in window</p></CardContent>
        </Card>
        <Card className="bg-slate-900 border-slate-800">
          <CardHeader className="pb-2"><CardTitle className="text-sm text-slate-400">T+3 Survival Rate</CardTitle></CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-400">{report.t3SurvivalRate}%</div>
            <p className="text-xs text-slate-500">target: 90%+</p>
          </CardContent>
        </Card>
        <Card className="bg-slate-900 border-slate-800">
          <CardHeader className="pb-2"><CardTitle className="text-sm text-slate-400">Time to first earning</CardTitle></CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white">{report.avgFirstEarningDays}</div>
            <p className="text-xs text-slate-500">days (target &lt;5)</p>
          </CardContent>
        </Card>
        <Card className="bg-slate-900 border-slate-800">
          <CardHeader className="pb-2"><CardTitle className="text-sm text-slate-400">Pending withdrawals</CardTitle></CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-amber-400">${report.pendingWithdrawals.totalDollars.toFixed(0)}</div>
            <p className="text-xs text-slate-500">{report.pendingWithdrawals.count} in flight</p>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-slate-900 border-slate-800">
        <CardHeader><CardTitle className="text-white text-base">Worker status distribution</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-2">
            {report.workerStatusDistribution.map((s) => (
              <div key={s.status} className="flex justify-between text-sm">
                <span className="text-slate-300">{s.status}</span>
                <span className="text-white font-medium">{s._count}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="bg-slate-900 border-slate-800">
        <CardHeader><CardTitle className="text-white text-base">Verification breakdown</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-2">
            {report.verificationBreakdown.map((s) => (
              <div key={s.verificationState ?? "null"} className="flex justify-between text-sm">
                <span className="text-slate-300">{s.verificationState ?? "pending"}</span>
                <span className="text-white font-medium">{s._count}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
