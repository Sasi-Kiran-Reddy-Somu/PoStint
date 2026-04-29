"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatRelativeTime } from "@/lib/utils";

interface Application {
  id: string;
  redditUsername: string;
  email: string;
  country: string;
  filterPassed: boolean | null;
  llmScore: number | null;
  llmScoreCategory: string | null;
  status: string;
  createdAt: string;
}

export default function VettingPage() {
  const [filter, setFilter] = useState<"all" | "passed" | "failed">("all");
  const [applications, setApplications] = useState<Application[]>([]);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    fetch(`/api/ops/applications?filter=${filter}`).then(async (r) => {
      const data = await r.json();
      setApplications(data.applications);
      setTotal(data.total);
    });
  }, [filter]);

  return (
    <div className="max-w-7xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Vetting Queue</h1>
        <p className="text-slate-400 text-sm mt-1">{total} applications waiting for review</p>
      </div>

      <div className="flex gap-2">
        {(["all", "passed", "failed"] as const).map((f) => (
          <Button
            key={f}
            size="sm"
            variant={filter === f ? "default" : "outline"}
            onClick={() => setFilter(f)}
            className={filter === f ? "bg-red-600 hover:bg-red-500" : ""}
          >
            {f === "all" ? "All" : f === "passed" ? "Filter Passed" : "Filter Failed"}
          </Button>
        ))}
      </div>

      <Card className="bg-slate-900 border-slate-800">
        <CardContent className="p-0">
          {applications.length === 0 ? (
            <div className="p-12 text-center text-slate-500">No applications match this filter.</div>
          ) : (
            <table className="w-full text-sm">
              <thead className="border-b border-slate-800 text-xs text-slate-500">
                <tr>
                  <th className="text-left p-3">Applicant</th>
                  <th className="text-left p-3">Filter</th>
                  <th className="text-left p-3">LLM Score</th>
                  <th className="text-left p-3">Country</th>
                  <th className="text-left p-3">Submitted</th>
                  <th className="text-right p-3"></th>
                </tr>
              </thead>
              <tbody>
                {applications.map((app) => (
                  <tr key={app.id} className="border-b border-slate-800 hover:bg-slate-800/40">
                    <td className="p-3">
                      <div className="text-white">u/{app.redditUsername}</div>
                      <div className="text-xs text-slate-500">{app.email}</div>
                    </td>
                    <td className="p-3">
                      {app.filterPassed === true ? <Badge variant="success">Passed</Badge> :
                       app.filterPassed === false ? <Badge variant="destructive">Failed</Badge> :
                       <Badge variant="secondary">Running...</Badge>}
                    </td>
                    <td className="p-3">
                      {app.llmScore !== null ? (
                        <div>
                          <span className="text-white font-medium">{app.llmScore.toFixed(1)}</span>
                          <Badge className="ml-2" variant={app.llmScoreCategory === "high" ? "success" : app.llmScoreCategory === "low" ? "destructive" : "warning"}>
                            {app.llmScoreCategory}
                          </Badge>
                        </div>
                      ) : <span className="text-slate-500 text-xs">Pending</span>}
                    </td>
                    <td className="p-3 text-slate-400">{app.country}</td>
                    <td className="p-3 text-slate-400">{formatRelativeTime(app.createdAt)}</td>
                    <td className="p-3 text-right">
                      <Link href={`/ops/vetting/${app.id}`}>
                        <Button size="sm" variant="outline">Open</Button>
                      </Link>
                    </td>
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
