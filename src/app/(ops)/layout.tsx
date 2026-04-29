import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { OpsSidebar } from "@/components/layout/ops-sidebar";

export default async function OpsLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session || session.user.role !== "ops") redirect("/login");

  return (
    <div className="min-h-screen bg-slate-950 text-white flex">
      <OpsSidebar />
      <main className="flex-1 p-8 overflow-auto">{children}</main>
    </div>
  );
}
