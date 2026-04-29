"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { ClipboardCheck, Users, Network, Flag, BarChart3, LogOut } from "lucide-react";
import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";

const links = [
  { href: "/ops/vetting", label: "Vetting Queue", icon: ClipboardCheck },
  { href: "/ops/workers", label: "Workers", icon: Users },
  { href: "/ops/ip-overlap", label: "IP Overlap", icon: Network },
  { href: "/ops/disputes", label: "Disputes", icon: Flag },
  { href: "/ops/reports", label: "Reports", icon: BarChart3 },
];

export function OpsSidebar() {
  const pathname = usePathname();
  return (
    <aside className="w-60 border-r border-slate-800 bg-slate-950 flex flex-col h-screen sticky top-0">
      <div className="p-6">
        <Link href="/ops/vetting" className="text-xl font-bold text-red-400">PoStint Ops</Link>
      </div>
      <nav className="flex-1 px-3 space-y-1">
        {links.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors",
                active ? "bg-purple-900/40 text-purple-200" : "text-slate-400 hover:bg-slate-900 hover:text-slate-200"
              )}
            >
              <Icon className="w-4 h-4" />
              {label}
            </Link>
          );
        })}
      </nav>
      <div className="p-3 border-t border-slate-800">
        <Button
          variant="ghost"
          className="w-full justify-start text-slate-400 hover:text-white"
          onClick={() => signOut({ callbackUrl: "/" })}
        >
          <LogOut className="w-4 h-4 mr-3" /> Sign out
        </Button>
      </div>
    </aside>
  );
}
