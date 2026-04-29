import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle2 } from "lucide-react";

export default function ApplySuccessPage() {
  return (
    <main className="min-h-screen bg-slate-950 flex items-center justify-center px-6">
      <Card className="bg-slate-900 border-slate-800 max-w-md w-full">
        <CardContent className="pt-10 pb-8 text-center">
          <div className="w-16 h-16 rounded-full bg-green-900/30 border border-green-700 flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-8 h-8 text-green-400" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-3">Application received</h1>
          <p className="text-slate-400 mb-8">
            We&apos;ll email you a decision within 48 hours. Make sure to check your spam folder if you don&apos;t see it in your inbox.
          </p>
          <Link href="/">
            <Button variant="outline" className="border-slate-700 text-slate-200">Back to home</Button>
          </Link>
        </CardContent>
      </Card>
    </main>
  );
}
