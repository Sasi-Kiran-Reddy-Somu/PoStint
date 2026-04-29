"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";

export function OnboardingBanner() {
  const [loading, setLoading] = useState(false);

  const startOnboarding = async () => {
    setLoading(true);
    const res = await fetch("/api/worker/stripe/onboarding", { method: "POST" });
    const data = await res.json();
    if (data.url) window.location.href = data.url;
    else setLoading(false);
  };

  return (
    <div className="bg-amber-950/50 border-b border-amber-900 px-6 py-3 flex items-center justify-between">
      <div className="text-sm text-amber-200">
        <strong>Complete Stripe onboarding to start earning.</strong> Verify your identity and add a bank account.
      </div>
      <Button size="sm" onClick={startOnboarding} disabled={loading} className="bg-amber-600 hover:bg-amber-500">
        {loading ? "Loading..." : "Complete Onboarding"}
      </Button>
    </div>
  );
}
