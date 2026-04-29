"use client";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs } from "@/components/ui/simple-tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface WorkerSettings {
  displayName: string;
  email: string;
  redditUsername: string;
  country: string;
  theme: string;
  compactMode: boolean;
  notifTaskInApp: boolean;
  notifVerifyInApp: boolean;
  notifCreditsInApp: boolean;
  notifHealthInApp: boolean;
  notifTierInApp: boolean;
  notifWithdrawInApp: boolean;
  notifBonusInApp: boolean;
  notifWeeklyEmail: boolean;
  notifMonthlyEmail: boolean;
  notifHighValueEmail: boolean;
  notifTierEmail: boolean;
  notifHealthEmail: boolean;
  notifWithdrawEmail: boolean;
  notifTaxEmail: boolean;
  twoFactorEnabled: boolean;
  loginAlertsEnabled: boolean;
}

export default function SettingsPage() {
  const [tab, setTab] = useState<"account" | "notifications" | "security" | "appearance" | "payouts">("account");
  const [data, setData] = useState<WorkerSettings | null>(null);
  const [savedMsg, setSavedMsg] = useState("");

  useEffect(() => {
    fetch("/api/worker/settings").then(async (r) => {
      if (r.ok) setData(await r.json());
    });
  }, []);

  const update = async (patch: Partial<WorkerSettings>) => {
    const res = await fetch("/api/worker/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    });
    if (res.ok) {
      setData((d) => d ? { ...d, ...patch } : d);
      setSavedMsg("Preferences updated");
      setTimeout(() => setSavedMsg(""), 2000);
    }
  };

  if (!data) return <div className="text-slate-400">Loading...</div>;

  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Settings</h1>
        {savedMsg && <span className="text-sm text-green-400">{savedMsg}</span>}
      </div>

      <Tabs value={tab} onChange={(v) => setTab(v as typeof tab)} options={[
        { value: "account", label: "Account" },
        { value: "notifications", label: "Notifications" },
        { value: "security", label: "Security" },
        { value: "payouts", label: "Payouts" },
        { value: "appearance", label: "Appearance" },
      ]} />

      {tab === "account" && (
        <Card className="bg-slate-900 border-slate-800">
          <CardHeader><CardTitle className="text-white">Account details</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-slate-200">Display name</Label>
              <Input
                defaultValue={data.displayName}
                onBlur={(e) => update({ displayName: e.target.value })}
                className="bg-slate-800 border-slate-700 text-white mt-1.5"
              />
            </div>
            <div>
              <Label className="text-slate-200">Email</Label>
              <Input
                defaultValue={data.email}
                onBlur={(e) => e.target.value !== data.email && update({ email: e.target.value })}
                className="bg-slate-800 border-slate-700 text-white mt-1.5"
              />
              <p className="text-xs text-slate-500 mt-1">Email changes require verification.</p>
            </div>
            <div>
              <Label className="text-slate-200">Reddit username</Label>
              <Input value={data.redditUsername} disabled className="bg-slate-800 border-slate-700 text-slate-500 mt-1.5" />
              <p className="text-xs text-slate-500 mt-1">Reddit username is permanent. Contact support if you need to change it.</p>
            </div>
            <div>
              <Label className="text-slate-200">Country</Label>
              <Input value={data.country} disabled className="bg-slate-800 border-slate-700 text-slate-500 mt-1.5" />
            </div>
          </CardContent>
        </Card>
      )}

      {tab === "notifications" && (
        <div className="space-y-4">
          <Card className="bg-slate-900 border-slate-800">
            <CardHeader><CardTitle className="text-white text-base">In-app notifications</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {[
                { key: "notifTaskInApp" as const, label: "New task available" },
                { key: "notifVerifyInApp" as const, label: "Verification result" },
                { key: "notifCreditsInApp" as const, label: "Credits released" },
                { key: "notifHealthInApp" as const, label: "Account health changes" },
                { key: "notifTierInApp" as const, label: "Tier promotion" },
                { key: "notifBonusInApp" as const, label: "Bonus awarded" },
              ].map(({ key, label }) => (
                <div key={key} className="flex items-center justify-between">
                  <span className="text-sm text-slate-200">{label}</span>
                  <Switch checked={data[key] as boolean} onCheckedChange={(v) => update({ [key]: v } as Partial<WorkerSettings>)} />
                </div>
              ))}
              <div className="flex items-center justify-between opacity-50">
                <span className="text-sm text-slate-200">Withdrawal status (always on)</span>
                <Switch checked disabled />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900 border-slate-800">
            <CardHeader><CardTitle className="text-white text-base">Email notifications</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {[
                { key: "notifWeeklyEmail" as const, label: "Weekly digest" },
                { key: "notifMonthlyEmail" as const, label: "Monthly summary" },
                { key: "notifHighValueEmail" as const, label: "High-value task alerts" },
                { key: "notifTierEmail" as const, label: "Tier promotion" },
                { key: "notifHealthEmail" as const, label: "Account health changes" },
              ].map(({ key, label }) => (
                <div key={key} className="flex items-center justify-between">
                  <span className="text-sm text-slate-200">{label}</span>
                  <Switch checked={data[key] as boolean} onCheckedChange={(v) => update({ [key]: v } as Partial<WorkerSettings>)} />
                </div>
              ))}
              <div className="flex items-center justify-between opacity-50">
                <span className="text-sm text-slate-200">Withdrawal confirmation (legal requirement)</span>
                <Switch checked disabled />
              </div>
              <div className="flex items-center justify-between opacity-50">
                <span className="text-sm text-slate-200">Tax document availability (legal requirement)</span>
                <Switch checked disabled />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {tab === "security" && (
        <Card className="bg-slate-900 border-slate-800">
          <CardHeader><CardTitle className="text-white">Security</CardTitle></CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="text-white font-medium mb-3">Password</h3>
              <Button variant="outline">Change password</Button>
            </div>
            <div>
              <h3 className="text-white font-medium mb-3">Two-factor authentication</h3>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-400">{data.twoFactorEnabled ? "Enabled" : "Disabled"}</span>
                <Switch checked={data.twoFactorEnabled} onCheckedChange={(v) => update({ twoFactorEnabled: v })} />
              </div>
            </div>
            <div>
              <h3 className="text-white font-medium mb-3">Login alerts</h3>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-400">Email me when my account is logged in from a new device</span>
                <Switch checked={data.loginAlertsEnabled} onCheckedChange={(v) => update({ loginAlertsEnabled: v })} />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {tab === "payouts" && (
        <Card className="bg-slate-900 border-slate-800">
          <CardHeader><CardTitle className="text-white">Payouts</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <Button variant="outline" onClick={async () => {
              const res = await fetch("/api/worker/stripe/onboarding", { method: "POST" });
              const d = await res.json();
              if (d.url) window.location.href = d.url;
            }}>
              Manage payout method
            </Button>
            <div>
              <h3 className="text-white font-medium mt-4 mb-2">Tax documents</h3>
              <p className="text-sm text-slate-400">Annual tax documents (1099/T4A) appear here in February each year.</p>
            </div>
          </CardContent>
        </Card>
      )}

      {tab === "appearance" && (
        <Card className="bg-slate-900 border-slate-800">
          <CardHeader><CardTitle className="text-white">Appearance</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-slate-200">Theme</Label>
              <Select value={data.theme} onValueChange={(v) => update({ theme: v })}>
                <SelectTrigger className="bg-slate-800 border-slate-700 text-white mt-1.5"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">Light</SelectItem>
                  <SelectItem value="dark">Dark</SelectItem>
                  <SelectItem value="system">System</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-200">Compact mode</span>
              <Switch checked={data.compactMode} onCheckedChange={(v) => update({ compactMode: v })} />
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
