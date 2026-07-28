"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, Search, Building2, Users, Kanban, Bot,
  BookmarkCheck, BarChart3, Settings, CreditCard, Zap, Upload
} from "lucide-react";

const nav = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/crm", label: "CRM Pipeline", icon: Kanban },
  { href: "/dashboard/bulk", label: "Bulk Outreach", icon: Zap, badge: "New" },
  { href: "/dashboard/import", label: "CSV Import", icon: Upload, badge: "New" },
  { href: "/dashboard/saved", label: "Saved Leads", icon: BookmarkCheck },
  { href: "/dashboard/analytics", label: "Analytics", icon: BarChart3 },
];

const bottomNav = [
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
  { href: "/dashboard/billing", label: "Billing", icon: CreditCard },
];

export default function Sidebar() {
  const pathname = usePathname();
  return (
    <aside className="w-60 shrink-0 border-r border-white/5 bg-[#0a0a0e] flex flex-col">
      <Link href="/" className="h-16 flex items-center gap-2 px-5 border-b border-white/5">
        <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 grid place-items-center font-bold text-white">Q</div>
        <span className="font-semibold tracking-tight">Quality Leads</span>
      </Link>
      <nav className="flex-1 p-3 space-y-0.5">
        {nav.map(item => {
          const active = pathname === item.href || (item.href !== "/dashboard" && pathname?.startsWith(item.href));
          return (
            <Link key={item.href} href={item.href}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition ${active ? "bg-white/[0.06] text-white" : "text-white/60 hover:text-white hover:bg-white/[0.03]"}`}>
              <item.icon className="w-4 h-4" /> <span className="flex-1">{item.label}</span>
              {item.badge && <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-medium">{item.badge}</span>}
            </Link>
          );
        })}
      </nav>
      <div className="p-3 border-t border-white/5 space-y-0.5">
        {bottomNav.map(item => (
          <Link key={item.href} href={item.href}
            className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-white/60 hover:text-white hover:bg-white/[0.03]">
            <item.icon className="w-4 h-4" /> {item.label}
          </Link>
        ))}
        <div className="mt-2 p-3 rounded-lg bg-white/[0.03] border border-white/5">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500" />
            <div className="text-xs">
              <div className="font-medium">You</div>
              <div className="text-white/50">Pro plan</div>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
