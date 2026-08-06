"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, Kanban, Bot, BookmarkCheck, BarChart3,
  Settings, CreditCard, Zap, Upload, LogOut, Sparkles
} from "lucide-react";

const nav = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/crm", label: "CRM Pipeline", icon: Kanban },
  { href: "/dashboard/bulk", label: "Bulk Outreach", icon: Zap },
  { href: "/dashboard/import", label: "CSV Import", icon: Upload },
  { href: "/dashboard/saved", label: "Saved Leads", icon: BookmarkCheck },
  { href: "/dashboard/analytics", label: "Analytics", icon: BarChart3 },
];

const bottomNav = [
  { href: "/dashboard/billing", label: "Billing", icon: CreditCard },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();
  return (
    <aside className="w-60 shrink-0 border-r border-slate-200 bg-white flex flex-col">
      <Link href="/" className="h-16 flex items-center gap-2 px-5 border-b border-slate-200">
        <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-teal-400 to-cyan-500 grid place-items-center font-bold text-white shadow-sm">Q</div>
        <span className="font-semibold tracking-tight text-slate-900">Quality Leads</span>
      </Link>

      <nav className="flex-1 p-3 space-y-0.5">
        {nav.map(item => {
          const active = pathname === item.href || (item.href !== "/dashboard" && pathname?.startsWith(item.href));
          return (
            <Link key={item.href} href={item.href}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition ${active ? "bg-teal-50 text-teal-700 font-medium" : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"}`}>
              <item.icon className="w-4 h-4" /> <span className="flex-1">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-3 border-t border-slate-200 space-y-0.5">
        {bottomNav.map(item => {
          const active = pathname?.startsWith(item.href);
          return (
            <Link key={item.href} href={item.href}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition ${active ? "bg-teal-50 text-teal-700 font-medium" : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"}`}>
              <item.icon className="w-4 h-4" /> {item.label}
            </Link>
          );
        })}
        <div className="mt-2 p-3 rounded-lg bg-gradient-to-b from-teal-50 to-white border border-teal-200">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-teal-300 to-cyan-400 grid place-items-center text-white text-xs font-semibold">Y</div>
            <div className="text-xs">
              <div className="font-medium text-slate-900">You</div>
              <div className="text-slate-500">Free plan</div>
            </div>
          </div>
          <Link href="/dashboard/billing">
            <button className="mt-2 w-full text-[11px] font-medium text-teal-700 bg-white border border-teal-300 hover:bg-teal-50 rounded-md py-1.5 transition inline-flex items-center justify-center gap-1">
              <Sparkles className="w-3 h-3" /> Upgrade to Pro
            </button>
          </Link>
        </div>
      </div>
    </aside>
  );
}
