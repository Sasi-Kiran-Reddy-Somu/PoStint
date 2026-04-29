"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";

const STEPS = [
  { title: "Task Feed", body: "This is where new tasks appear. Claim them quickly before others do." },
  { title: "Credit Balance", body: "Track pending and available credits in the header. 100 credits = $1." },
  { title: "Withdrawal Threshold", body: "Withdraw any time you have $20 or more in available credits." },
  { title: "Account Health", body: "Your account health affects task eligibility. Keep it healthy." },
  { title: "Tier Badge", body: "You start at Tier 1. Earn karma to unlock Tier 2 (post tasks + higher pay)." },
];

export function WelcomeTour() {
  const [step, setStep] = useState(0);
  const [dismissed, setDismissed] = useState(false);

  const finish = async () => {
    setDismissed(true);
    await fetch("/api/worker/welcome-tour", { method: "POST" });
  };

  if (dismissed) return null;

  const isLast = step === STEPS.length - 1;
  const current = STEPS[step];

  return (
    <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center px-6">
      <div className="bg-slate-900 border border-slate-700 rounded-lg max-w-md w-full p-6 shadow-xl">
        <div className="text-xs text-red-400 mb-2">Step {step + 1} of {STEPS.length}</div>
        <h3 className="text-xl font-bold text-white mb-2">{current.title}</h3>
        <p className="text-slate-400 mb-6">{current.body}</p>
        <div className="flex justify-between items-center">
          <button onClick={finish} className="text-sm text-slate-500 hover:text-slate-300">Skip Tour</button>
          <Button
            onClick={() => isLast ? finish() : setStep(step + 1)}
            className="bg-red-600 hover:bg-red-500"
          >
            {isLast ? "Got it. Let's start." : "Next"}
          </Button>
        </div>
      </div>
    </div>
  );
}
