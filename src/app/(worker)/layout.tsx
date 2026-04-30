import { prisma } from "@/lib/prisma";
import { WorkerSidebar } from "@/components/layout/worker-sidebar";
import { BalanceHeader } from "@/components/worker/balance-header";
import { WelcomeTour } from "@/components/worker/welcome-tour";
import { OnboardingBanner } from "@/components/worker/onboarding-banner";
import { StatusBanner } from "@/components/worker/status-banner";

const WORKER_ID = "cmokektv0002srgywx6xnim0j";

export default async function WorkerLayout({ children }: { children: React.ReactNode }) {
  const worker = await prisma.worker.findUnique({
    where: { id: WORKER_ID },
    select: {
      id: true, status: true, hasSeenWelcomeTour: true, payoutsEnabled: true,
      tier: true, theme: true,
    },
  });

  return (
    <div className={`min-h-screen bg-slate-950 text-white flex ${worker?.theme === "dark" ? "dark" : ""}`}>
      <WorkerSidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <BalanceHeader />
        {!worker?.payoutsEnabled && worker?.status === "pending_stripe" && <OnboardingBanner />}
        {(worker?.status === "paused" || worker?.status === "suspended") && <StatusBanner status={worker.status} />}
        <main className="flex-1 p-6 overflow-auto">{children}</main>
        {!worker?.hasSeenWelcomeTour && worker?.payoutsEnabled && <WelcomeTour />}
      </div>
    </div>
  );
}
