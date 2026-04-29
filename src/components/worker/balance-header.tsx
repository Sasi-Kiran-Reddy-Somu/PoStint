"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { creditsToUsd, formatCredits, WITHDRAWAL_THRESHOLD_CREDITS } from "@/lib/utils";
import { NotificationBell } from "@/components/worker/notification-bell";

interface Earnings {
  pendingCredits: number;
  availableCredits: number;
  lifetimeCredits: number;
  pendingBonusCredits: number;
}

export function BalanceHeader() {
  const [earnings, setEarnings] = useState<Earnings | null>(null);

  const refresh = async () => {
    try {
      const res = await fetch("/api/worker/earnings");
      if (res.ok) setEarnings(await res.json());
    } catch {/* ignore */}
  };

  useEffect(() => {
    refresh();
    const t = setInterval(refresh, 15000);
    return () => clearInterval(t);
  }, []);

  if (!earnings) {
    return <div className="h-16 border-b border-slate-800 bg-slate-950 px-6 flex items-center" />;
  }

  const canWithdraw = earnings.availableCredits >= WITHDRAWAL_THRESHOLD_CREDITS;

  return (
    <header className="h-16 border-b border-slate-800 bg-slate-950 px-6 flex items-center justify-between sticky top-0 z-20">
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2" title="Credits past T+3 verification, withdrawable">
          <span className="text-xs text-slate-500">Available</span>
          <span className="font-semibold text-green-400">{formatCredits(earnings.availableCredits)}</span>
          <span className="text-xs text-slate-500">{creditsToUsd(earnings.availableCredits)}</span>
        </div>
        <div className="h-6 w-px bg-slate-800" />
        <div className="flex items-center gap-2" title="Credits earned but in T+3 verification window">
          <span className="text-xs text-slate-500">Pending</span>
          <span className="font-semibold text-amber-400">{formatCredits(earnings.pendingCredits)}</span>
          <span className="text-xs text-slate-500">{creditsToUsd(earnings.pendingCredits)}</span>
        </div>
        {earnings.pendingBonusCredits > 0 && (
          <>
            <div className="h-6 w-px bg-slate-800" />
            <div className="text-xs text-slate-400">
              Bonus pending: <span className="text-red-400 font-medium">{earnings.pendingBonusCredits}</span> (applied at first withdrawal)
            </div>
          </>
        )}
      </div>
      <div className="flex items-center gap-3">
        <NotificationBell />
        <Link href="/withdraw">
          <Button
            disabled={!canWithdraw}
            size="sm"
            title={canWithdraw ? "Withdraw to bank" : `Reach ${WITHDRAWAL_THRESHOLD_CREDITS} credits ($20) to withdraw. ${earnings.availableCredits} of ${WITHDRAWAL_THRESHOLD_CREDITS}.`}
            className="bg-red-600 hover:bg-red-500 disabled:opacity-50"
          >
            Withdraw
          </Button>
        </Link>
      </div>
    </header>
  );
}
