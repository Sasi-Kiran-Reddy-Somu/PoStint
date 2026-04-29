"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { creditsToUsd, WITHDRAWAL_THRESHOLD_CREDITS, CREDITS_PER_DOLLAR } from "@/lib/utils";
import Link from "next/link";

export default function WithdrawPage() {
  const router = useRouter();
  const [available, setAvailable] = useState(0);
  const [bonusCredits, setBonusCredits] = useState(0);
  const [mode, setMode] = useState<"all" | "custom">("all");
  const [customAmount, setCustomAmount] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [withdrawalsHistory, setWithdrawalsHistory] = useState<{ id: string; amountDollars: number; status: string; initiatedAt: string }[]>([]);

  useEffect(() => {
    fetch("/api/worker/earnings").then(async (r) => {
      const data = await r.json();
      setAvailable(data.availableCredits ?? 0);
      setBonusCredits(data.pendingBonusCredits ?? 0);
    });
    fetch("/api/worker/withdrawals").then(async (r) => {
      if (r.ok) {
        const data = await r.json();
        setWithdrawalsHistory(data.withdrawals ?? []);
      }
    });
  }, []);

  const requestedCredits = mode === "all" ? available : Math.min(parseInt(customAmount) || 0, available);
  const requestedDollars = requestedCredits / CREDITS_PER_DOLLAR;
  const validRequest = requestedCredits >= WITHDRAWAL_THRESHOLD_CREDITS && requestedCredits <= available;

  const handleWithdraw = async () => {
    setError("");
    setSubmitting(true);
    const res = await fetch("/api/worker/withdraw", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amountCredits: requestedCredits }),
    });
    const data = await res.json();
    setSubmitting(false);
    if (!res.ok) {
      setError(data.error ?? "Withdrawal failed.");
      return;
    }
    router.push("/withdraw?initiated=1");
  };

  if (available < WITHDRAWAL_THRESHOLD_CREDITS) {
    return (
      <div className="max-w-md mx-auto py-16 text-center">
        <h2 className="text-2xl font-bold text-white mb-3">Not enough credits to withdraw</h2>
        <p className="text-slate-400 mb-6">You need at least {WITHDRAWAL_THRESHOLD_CREDITS} credits ($20) to withdraw. You have {available} credits.</p>
        <Link href="/tasks"><Button className="bg-red-600 hover:bg-red-500">Find Tasks</Button></Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="text-2xl font-bold text-white">Withdraw</h1>

      <Card className="bg-slate-900 border-slate-800">
        <CardHeader><CardTitle className="text-white">How much would you like to withdraw?</CardTitle></CardHeader>
        <CardContent className="space-y-5">
          <div className="bg-slate-800 rounded-md p-4">
            <div className="text-xs text-slate-500">Available balance</div>
            <div className="flex items-baseline gap-2">
              <div className="text-3xl font-bold text-white">{available.toLocaleString()}</div>
              <span className="text-sm text-slate-400">credits</span>
              <span className="text-lg text-green-400 ml-auto">{creditsToUsd(available)}</span>
            </div>
            <p className="text-[10px] text-slate-600 mt-2">Conversion rate: 100 credits = $1 (fixed)</p>
          </div>

          {bonusCredits > 0 && (
            <div className="p-3 rounded-md bg-red-950/40 border border-red-950 text-sm text-indigo-200">
              <strong>Welcome bonus of {bonusCredits} credits</strong> will be added to this withdrawal.
            </div>
          )}

          <div className="space-y-3">
            <Label className="text-slate-200">Amount</Label>
            <div className="space-y-2">
              <label className="flex items-start gap-3 p-3 rounded-md border border-slate-700 cursor-pointer hover:bg-slate-800/50">
                <input type="radio" checked={mode === "all"} onChange={() => setMode("all")} className="mt-1" />
                <div>
                  <div className="text-sm text-white">Withdraw all</div>
                  <div className="text-xs text-slate-500">{available.toLocaleString()} credits ({creditsToUsd(available)})</div>
                </div>
              </label>
              <label className="flex items-start gap-3 p-3 rounded-md border border-slate-700 cursor-pointer hover:bg-slate-800/50">
                <input type="radio" checked={mode === "custom"} onChange={() => setMode("custom")} className="mt-1" />
                <div className="flex-1">
                  <div className="text-sm text-white mb-1">Custom amount</div>
                  {mode === "custom" && (
                    <Input
                      type="number"
                      placeholder="2000"
                      value={customAmount}
                      onChange={(e) => setCustomAmount(e.target.value)}
                      max={available}
                      min={WITHDRAWAL_THRESHOLD_CREDITS}
                      className="bg-slate-800 border-slate-700 text-white mt-1"
                    />
                  )}
                </div>
              </label>
            </div>
            {mode === "custom" && customAmount && parseInt(customAmount) < WITHDRAWAL_THRESHOLD_CREDITS && (
              <p className="text-sm text-red-400">Minimum withdrawal is {WITHDRAWAL_THRESHOLD_CREDITS} credits ($20).</p>
            )}
          </div>

          <div className="bg-slate-800 rounded-md p-4">
            <div className="text-xs text-slate-500 mb-1">You will receive</div>
            <div className="text-2xl font-bold text-green-400">${requestedDollars.toFixed(2)}</div>
            <p className="text-xs text-slate-500 mt-1">in your bank account (1–3 business days)</p>
          </div>

          {error && <p className="text-sm text-red-400">{error}</p>}

          <Button
            onClick={handleWithdraw}
            disabled={!validRequest || submitting}
            className="w-full bg-red-600 hover:bg-red-500"
          >
            {submitting ? "Initiating..." : "Confirm Withdrawal"}
          </Button>
        </CardContent>
      </Card>

      {withdrawalsHistory.length > 0 && (
        <Card className="bg-slate-900 border-slate-800">
          <CardHeader><CardTitle className="text-white">Recent withdrawals</CardTitle></CardHeader>
          <CardContent>
            <div className="divide-y divide-slate-800">
              {withdrawalsHistory.slice(0, 5).map((w) => (
                <div key={w.id} className="py-3 flex items-center justify-between">
                  <div>
                    <div className="text-sm text-white">${w.amountDollars.toFixed(2)}</div>
                    <div className="text-xs text-slate-500">{new Date(w.initiatedAt).toLocaleDateString()}</div>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded ${w.status === "completed" ? "bg-green-900/40 text-green-300" : w.status === "failed" ? "bg-red-900/40 text-red-300" : "bg-amber-900/40 text-amber-300"}`}>
                    {w.status}
                  </span>
                </div>
              ))}
            </div>
            <Link href="/history" className="block mt-3 text-sm text-red-400 hover:underline">View full history →</Link>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
