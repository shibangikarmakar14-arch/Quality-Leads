"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Search, Filter, TrendingUp, Users, Mail, Target, Sparkles, Bookmark, ArrowUpRight
} from "lucide-react";
import { toast } from "sonner";

export default function DashboardHome() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    fetch("/api/leads").then(r => r.json()).then(d => setResults(d.results || []));
    fetch("/api/analytics").then(r => r.json()).then(d => setStats(d.stats));
  }, []);

  async function doSearch(e) {
    e?.preventDefault();
    setLoading(true);
    const r = await fetch(`/api/leads?q=${encodeURIComponent(query)}`);
    const d = await r.json();
    setResults(d.results || []);
    setLoading(false);
  }

  async function saveLead(id) {
    const r = await fetch("/api/saved", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ leadId: id })
    });
    const d = await r.json();
    if (d.saved) toast.success(d.alreadySaved ? "Already saved" : "Lead saved");
  }

  const widgets = [
    { icon: Users, label: "New Leads", value: results.length || 0, delta: "+12%", color: "from-indigo-500/20 to-indigo-500/5" },
    { icon: Mail, label: "Emails Sent", value: 148, delta: "+8%", color: "from-emerald-500/20 to-emerald-500/5" },
    { icon: Target, label: "Reply Rate", value: "34%", delta: "+4%", color: "from-amber-500/20 to-amber-500/5" },
    { icon: TrendingUp, label: "Pipeline Value", value: "$285K", delta: "+22%", color: "from-purple-500/20 to-purple-500/5" }
  ];

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Welcome back</h1>
          <p className="text-white/50 mt-1">Here’s what’s happening in your pipeline today.</p>
        </div>
        <Badge className="bg-emerald-500/15 text-emerald-400 border-emerald-500/20">
          <Sparkles className="w-3 h-3 mr-1" /> AI Assistant online
        </Badge>
      </div>

      {/* Widgets */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        {widgets.map((w, i) => (
          <motion.div key={w.label} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            <Card className={`bg-gradient-to-b ${w.color} border-white/10 rounded-xl`}>
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <w.icon className="w-5 h-5 text-white/70" />
                  <span className="text-xs text-emerald-400">{w.delta}</span>
                </div>
                <div className="mt-4">
                  <div className="text-2xl font-semibold tracking-tight">{w.value}</div>
                  <div className="text-sm text-white/50 mt-0.5">{w.label}</div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Universal search */}
      <Card className="bg-white/[0.02] border-white/10 rounded-xl mb-6">
        <CardContent className="p-4">
          <form onSubmit={doSearch} className="flex items-center gap-2">
            <div className="flex-1 flex items-center gap-2 rounded-lg bg-white/[0.03] border border-white/10 px-3 h-11">
              <Search className="w-4 h-4 text-white/50" />
              <Input
                value={query} onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by company, person, title, industry, tech stack, location..."
                className="bg-transparent border-0 h-10 focus-visible:ring-0 focus-visible:ring-offset-0 text-white placeholder:text-white/40"
              />
            </div>
            <Button type="submit" disabled={loading} className="bg-white text-black hover:bg-white/90 h-11 rounded-lg px-5">
              {loading ? "Searching..." : "Search"}
            </Button>
            <Button type="button" variant="outline" className="h-11 rounded-lg border-white/10 bg-white/[0.02] text-white hover:bg-white/10">
              <Filter className="w-4 h-4 mr-1" /> Filters
            </Button>
          </form>

          <div className="mt-3 flex flex-wrap gap-2">
            {["VP Engineering", "CRO SaaS", "Head of Growth", "CTO fintech", "Founder"].map(s => (
              <button key={s} onClick={() => { setQuery(s); setTimeout(doSearch, 0); }}
                className="text-xs px-2.5 py-1 rounded-full bg-white/[0.03] border border-white/10 text-white/70 hover:bg-white/10">
                {s}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="text-sm text-white/50">{results.length} results</div>
          <Link href="/dashboard/crm" className="text-xs text-indigo-300 hover:underline">Open pipeline →</Link>
        </div>

        {results.map((lead, i) => (
          <motion.div key={lead.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
            <Card className="bg-white/[0.02] border-white/10 rounded-xl hover:bg-white/[0.04] transition group">
              <CardContent className="p-5 flex items-center gap-4">
                <img src={lead.avatar} alt={lead.name} className="h-12 w-12 rounded-full object-cover ring-2 ring-white/10" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <div className="font-medium">{lead.name}</div>
                    <Badge className="bg-white/5 border border-white/10 text-white/60 text-[10px]">{lead.seniority}</Badge>
                  </div>
                  <div className="text-sm text-white/60 mt-0.5">{lead.title} • {lead.company}</div>
                  <div className="text-xs text-white/40 mt-1">{lead.location} • {lead.industry}</div>
                </div>

                <div className="hidden md:flex flex-col items-end gap-1.5 text-right mr-2">
                  {(lead.buyingSignals || []).slice(0, 2).map(sig => (
                    <span key={sig} className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/20">{sig}</span>
                  ))}
                </div>

                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" className="border-white/10 bg-white/[0.02] hover:bg-white/10 text-white" onClick={() => saveLead(lead.id)}>
                    <Bookmark className="w-3.5 h-3.5" />
                  </Button>
                  <Link href={`/dashboard/lead/${lead.id}`}>
                    <Button size="sm" className="bg-white text-black hover:bg-white/90">
                      View <ArrowUpRight className="w-3.5 h-3.5 ml-1" />
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}

        {results.length === 0 && !loading && (
          <Card className="bg-white/[0.02] border-white/10 rounded-xl">
            <CardContent className="p-12 text-center text-white/50">
              No leads yet. Try a search above.
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
