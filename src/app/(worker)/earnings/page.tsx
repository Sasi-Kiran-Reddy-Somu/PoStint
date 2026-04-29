import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { creditsToUsd, formatCredits, formatDate } from "@/lib/utils";
import { VerificationInfo } from "@/components/worker/verification-info";

export default async function EarningsPage() {
  const session = await auth();
  if (!session) return null;
  const workerId = session.user.id;

  const [pending, available, lifetime, pendingTxs, availableTxs] = await Promise.all([
    prisma.creditTransaction.aggregate({
      where: { workerId, state: "pending", direction: "earn" },
      _sum: { amountCredits: true },
    }),
    prisma.creditTransaction.aggregate({
      where: { workerId, state: "available" },
      _sum: { amountCredits: true },
    }),
    prisma.creditTransaction.aggregate({
      where: { workerId, direction: "earn" },
      _sum: { amountCredits: true },
    }),
    prisma.creditTransaction.findMany({
      where: { workerId, state: "pending" },
      include: { taskAssignment: { include: { task: { select: { targetSubreddit: true } } } } },
      orderBy: { createdAt: "desc" },
      take: 20,
    }),
    prisma.creditTransaction.findMany({
      where: { workerId, state: "available", direction: "earn" },
      include: { taskAssignment: { include: { task: { select: { targetSubreddit: true } } } } },
      orderBy: { createdAt: "desc" },
      take: 20,
    }),
  ]);

  const pendingTotal = pending._sum.amountCredits ?? 0;
  const availableTotal = available._sum.amountCredits ?? 0;
  const lifetimeTotal = lifetime._sum.amountCredits ?? 0;

  return (
    <div className="max-w-5xl space-y-6">
      <h1 className="text-2xl font-bold text-white">Earnings</h1>

      <div className="grid md:grid-cols-3 gap-4">
        <Card className="bg-slate-900 border-slate-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-slate-400 flex items-center">
              Pending credits
              <VerificationInfo />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-amber-400">{formatCredits(pendingTotal)}</div>
            <p className="text-xs text-slate-500 mt-1">{creditsToUsd(pendingTotal)} • Awaiting verification</p>
          </CardContent>
        </Card>
        <Card className="bg-slate-900 border-slate-800">
          <CardHeader className="pb-2"><CardTitle className="text-sm text-slate-400">Available credits</CardTitle></CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-400">{formatCredits(availableTotal)}</div>
            <p className="text-xs text-slate-500 mt-1">{creditsToUsd(availableTotal)} • Withdrawable</p>
          </CardContent>
        </Card>
        <Card className="bg-slate-900 border-slate-800">
          <CardHeader className="pb-2"><CardTitle className="text-sm text-slate-400">Lifetime earnings</CardTitle></CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white">{formatCredits(lifetimeTotal)}</div>
            <p className="text-xs text-slate-500 mt-1">{creditsToUsd(lifetimeTotal)} • All time</p>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-slate-900 border-slate-800">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-1">
            Pending verifications
            <VerificationInfo />
          </CardTitle>
        </CardHeader>
        <CardContent>
          {pendingTxs.length === 0 ? (
            <p className="text-slate-500 text-sm">No pending credits.</p>
          ) : (
            <div className="space-y-2">
              {pendingTxs.map((tx) => (
                <div key={tx.id} className="flex items-center justify-between py-2 border-b border-slate-800 last:border-0">
                  <div>
                    <div className="text-sm text-white">r/{tx.taskAssignment?.task.targetSubreddit ?? "—"}</div>
                    <div className="text-xs text-slate-500">
                      Releases on {tx.releasesAt ? formatDate(tx.releasesAt) : "—"}
                    </div>
                  </div>
                  <Badge variant="warning">+{tx.amountCredits} credits</Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="bg-slate-900 border-slate-800">
        <CardHeader><CardTitle className="text-white">Recent verified earnings</CardTitle></CardHeader>
        <CardContent>
          {availableTxs.length === 0 ? (
            <p className="text-slate-500 text-sm">No verified earnings yet.</p>
          ) : (
            <div className="space-y-2">
              {availableTxs.map((tx) => (
                <div key={tx.id} className="flex items-center justify-between py-2 border-b border-slate-800 last:border-0">
                  <div>
                    <div className="text-sm text-white">
                      {tx.taskAssignment?.task.targetSubreddit
                        ? `r/${tx.taskAssignment.task.targetSubreddit}`
                        : tx.reason ?? "—"}
                    </div>
                    <div className="text-xs text-slate-500">{formatDate(tx.createdAt)}</div>
                  </div>
                  <Badge variant="success">+{tx.amountCredits} credits</Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
