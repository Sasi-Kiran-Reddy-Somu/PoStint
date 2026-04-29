import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, DollarSign, Shield, Zap } from "lucide-react";

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-950 to-slate-900 text-white">
      {/* Navbar */}
      <nav className="flex items-center justify-between px-6 py-4 max-w-6xl mx-auto">
        <span className="font-bold text-xl text-red-400">PoStint</span>
        <div className="flex gap-4">
          <Link href="/login"><Button variant="ghost" className="text-slate-300 hover:text-slate-900 hover:bg-white">Sign in</Button></Link>
          <Link href="/apply"><Button className="bg-red-600 hover:bg-red-500">Apply Now</Button></Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="text-center px-6 pt-24 pb-16 max-w-4xl mx-auto">
        <Badge className="mb-6 bg-red-950/60 text-red-300 border border-red-800">Invite-only Beta</Badge>
        <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
          Turn your Reddit karma<br />into real money
        </h1>
        <p className="text-xl text-slate-400 mb-10 max-w-2xl mx-auto">
          Earn credits for every comment and post you make using your established Reddit account.
          100 credits = $1. Withdraw anytime you hit $20.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/apply">
            <Button size="lg" className="bg-red-600 hover:bg-red-500 text-lg px-8">
              Apply to Join
            </Button>
          </Link>
          <Link href="#how-it-works">
            <Button size="lg" className="bg-white text-black hover:bg-slate-100 border border-white text-lg px-8">
              How it works
            </Button>
          </Link>
        </div>
      </section>

      {/* Credit values */}
      <section className="px-6 pb-16 max-w-3xl mx-auto">
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: "Per comment", credits: 250, usd: "$2.50" },
            { label: "Per post (Tier 2)", credits: 400, usd: "$4.00" },
            { label: "Per upvote", credits: 20, usd: "$0.20" },
          ].map((item) => (
            <Card key={item.label} className="bg-slate-800/50 border-slate-700 text-center">
              <CardContent className="pt-6 pb-4">
                <div className="text-3xl font-bold text-red-400 mb-1">{item.credits}</div>
                <div className="text-sm text-slate-400">credits</div>
                <div className="text-lg font-semibold text-white mt-1">{item.usd}</div>
                <div className="text-xs text-slate-500 mt-1">{item.label}</div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="px-6 py-16 max-w-5xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-12">How it works</h2>
        <div className="grid md:grid-cols-3 gap-8">
          {[
            { icon: Shield, step: "1", title: "Apply & get vetted", desc: "Submit your Reddit username. We check account age, karma, and posting history. Approved accounts gain instant access." },
            { icon: Zap, step: "2", title: "Claim & complete tasks", desc: "Browse available tasks. Claim one, paste pre-written content into the target Reddit thread, and submit the URL. Done in minutes." },
            { icon: DollarSign, step: "3", title: "Earn & withdraw", desc: "Credits release after your comment survives 3 days. Once you hit 2,000 credits ($20), withdraw to your bank via ACH." },
          ].map(({ icon: Icon, step, title, desc }) => (
            <div key={step} className="text-center">
              <div className="w-16 h-16 rounded-full bg-red-950/50 border border-red-800 flex items-center justify-center mx-auto mb-4">
                <Icon className="w-7 h-7 text-red-400" />
              </div>
              <h3 className="text-xl font-semibold mb-3">{title}</h3>
              <p className="text-slate-400">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Requirements */}
      <section className="px-6 py-16 bg-slate-800/30">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-8">Account requirements</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {[
              "Reddit account at least 12 months old",
              "Minimum 1,000 total karma",
              "Active across multiple subreddits",
              "No recent bans or suspensions",
              "US or Canada resident",
              "One account per person",
            ].map((req) => (
              <div key={req} className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-green-400 shrink-0" />
                <span className="text-slate-300">{req}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 py-24 text-center">
        <h2 className="text-4xl font-bold mb-4">Ready to earn?</h2>
        <p className="text-slate-400 mb-8 text-lg">Join hundreds of Redditors monetizing their established accounts.</p>
        <Link href="/apply">
          <Button size="lg" className="bg-red-600 hover:bg-red-500 text-lg px-10">Apply Now — It&apos;s Free</Button>
        </Link>
      </section>

      <footer className="border-t border-slate-800 px-6 py-8 text-center text-slate-500 text-sm">
        <div className="flex justify-center gap-6 mb-4">
          <Link href="/terms" className="hover:text-slate-300">Terms</Link>
          <Link href="/privacy" className="hover:text-slate-300">Privacy</Link>
        </div>
        <p>© 2026 PoStint. All rights reserved.</p>
      </footer>
    </main>
  );
}
