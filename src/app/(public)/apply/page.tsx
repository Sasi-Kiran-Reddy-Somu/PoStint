"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft } from "lucide-react";

export default function ApplyPage() {
  const router = useRouter();
  const [redditUsername, setRedditUsername] = useState("");
  const [email, setEmail] = useState("");
  const [country, setCountry] = useState("US");
  const [referralCode, setReferralCode] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [globalError, setGlobalError] = useState("");

  const handleUsernameChange = (v: string) => {
    setRedditUsername(v.replace(/^\/?(u\/)?/, "").replace(/\s/g, ""));
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!redditUsername || redditUsername.length < 3 || redditUsername.length > 20) {
      e.redditUsername = "Reddit username must be 3 to 20 characters.";
    } else if (!/^[a-zA-Z0-9_-]+$/.test(redditUsername)) {
      e.redditUsername = "Reddit username can contain letters, numbers, underscores, and hyphens only.";
    }
    if (!email) e.email = "Email is required.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = "Invalid email format.";
    if (!country) e.country = "Please select your country.";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGlobalError("");
    if (!validate()) return;
    setSubmitting(true);

    try {
      const res = await fetch("/api/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ redditUsername, email, country, referralCode: referralCode || undefined }),
      });
      const data = await res.json();
      if (!res.ok) {
        setGlobalError(data.error ?? "Submission failed. Please try again.");
        setSubmitting(false);
        return;
      }
      router.push("/apply/success");
    } catch {
      setGlobalError("Submission failed. Please try again.");
      setSubmitting(false);
    }
  };

  const isValid = redditUsername && email && country && Object.keys(errors).length === 0;

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <nav className="px-6 py-4 max-w-6xl mx-auto">
        <Link href="/" className="text-slate-400 hover:text-white inline-flex items-center gap-2">
          <ArrowLeft className="w-4 h-4" /> Back to home
        </Link>
      </nav>

      <div className="max-w-md mx-auto px-6 py-8">
        <Card className="bg-slate-900 border-slate-800">
          <CardHeader>
            <CardTitle className="text-white">Apply to the platform</CardTitle>
            <CardDescription className="text-slate-400">
              Tell us about your Reddit account. We&apos;ll review and email a decision within 48 hours.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="reddit" className="text-slate-200">Reddit Username</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm">u/</span>
                  <Input
                    id="reddit"
                    placeholder="your_username"
                    value={redditUsername}
                    onChange={(e) => handleUsernameChange(e.target.value)}
                    onBlur={validate}
                    className="pl-9 bg-slate-800 border-slate-700 text-white"
                    required
                  />
                </div>
                {errors.redditUsername && <p className="text-sm text-red-400">{errors.redditUsername}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-slate-200">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onBlur={validate}
                  className="bg-slate-800 border-slate-700 text-white"
                  required
                />
                {errors.email && <p className="text-sm text-red-400">{errors.email}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="country" className="text-slate-200">Country</Label>
                <Select value={country} onValueChange={setCountry}>
                  <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="US">United States</SelectItem>
                    <SelectItem value="Canada">Canada</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="ref" className="text-slate-200">
                  Referral Code <span className="text-slate-500 text-xs">(optional)</span>
                </Label>
                <Input
                  id="ref"
                  value={referralCode}
                  onChange={(e) => setReferralCode(e.target.value)}
                  className="bg-slate-800 border-slate-700 text-white"
                />
              </div>

              {globalError && (
                <div className="p-3 rounded-md bg-red-950/50 border border-red-900 text-red-300 text-sm">
                  {globalError}
                </div>
              )}

              <Button
                type="submit"
                disabled={!isValid || submitting}
                className="w-full bg-red-600 hover:bg-red-500"
              >
                {submitting ? "Submitting..." : "Submit Application"}
              </Button>

              <p className="text-xs text-slate-500 text-center">
                By submitting, you agree to our <Link href="/terms" className="underline">Terms</Link> and{" "}
                <Link href="/privacy" className="underline">Privacy Policy</Link>.
              </p>
            </form>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
