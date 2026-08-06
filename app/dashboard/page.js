"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Search, Filter, TrendingUp, Users, Mail, Target, Sparkles, Bookmark, ArrowUpRight,
  ShieldCheck, Linkedin, Bot
} from "lucide-react";
import { toast } from "sonner";

const PRESET_QUERIES = [
  "Procurement Managers at P&C carriers",
  "VP Talent Acquisition at healthcare staffing",
  "Claims Directors at regional insurers",
  "Head of Recruiting at IT staffing firms",
  "Chief Underwriting Officer at MGAs",
];

function DashboardInner() {
  const searchParams = useSearchParams();
  const initialQ = searchParams.get("q") || "";

  const [query, setQuery] = useState(initialQ);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [lastSource, setLastSource] = useState(null);
  const [quota, setQuota] = useState(null);
  const [parsedFilters, setParsedFilters] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

  useEffect(() => {
    if (initialQ) doSearch(null, initialQ);
    else fetch("/api/leads").then(r => r.json()).then(d => setResults(d.results || []));
    fetch("/api/quota").then(r => r.json()).then(d => setQuota(d.quota));
  }, []);

  async function doSearch(e, override) {
    e?.preventDefault();
    const q = override ?? query;
    setQuery(q);
    setLoading(true);
    setResults([]);
    setErrorMsg(null);
    const r = await fetch(`/api/leads?q=${encodeURIComponent(q)}`);
    const d = await r.json();
    setResults(d.results || []);
    setLastSource(d.source || null);
    setParsedFilters(d.parsedFilters || null);
    if (d.quota) setQuota(d.quota);
    if (d.error) setErrorMsg(d.error);
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
    { icon: Users, label: "New Prospects", value: results.length || 0, delta: "+12%" },
    { icon: Mail, label: "Emails Sent", value: 148, delta: "+8%" },
    { icon: Target, label: "Reply Rate", value: "34%", delta: "+4%" },
    { icon: TrendingUp, label: "Pipeline Value", value: "$285K", delta: "+22%" }
  ];

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Welcome back</h1>
          <p className="text-slate-500 mt-1">Verified prospects for insurance & staffing sales teams.</p>
        </div>
        <Badge className="bg-teal-50 text-teal-700 border-teal-200 hover:bg-teal-50">
          <Sparkles className="w-3 h-3 mr-1" /> AI Assistant online
        </Badge>
      </div>

      {/* Widgets */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        {widgets.map((w, i) => (
          <motion.div key={w.label} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            <Card className="bg-white border-slate-200 rounded-xl shadow-sm hover:shadow-md transition">
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div className="h-9 w-9 rounded-lg bg-teal-50 border border-teal-200 grid place-items-center">
                    <w.icon className="w-4 h-4 text-teal-600" />
                  </div>
                  <span className="text-xs font-medium text-teal-600">{w.delta}</span>
                </div>
                <div className="mt-4">
                  <div className="text-2xl font-semibold tracking-tight text-slate-900">{w.value}</div>
                  <div className="text-sm text-slate-500 mt-0.5">{w.label}</div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Universal search */}
      <Card className="bg-white border-slate-200 rounded-xl mb-6 shadow-sm">
        <CardContent className="p-4">
          <form onSubmit={doSearch} className="flex items-center gap-2">
            <div className="flex-1 flex items-center gap-2 rounded-lg bg-slate-50 border border-slate-200 focus-within:border-teal-400 focus-within:bg-white transition px-3 h-11">
              <Search className="w-4 h-4 text-slate-400" />
              <Input
                value={query} onChange={(e) => setQuery(e.target.value)}
                placeholder="e.g. Procurement Managers at P&C carriers, VP Talent at staffing firms..."
                className="bg-transparent border-0 h-10 focus-visible:ring-0 focus-visible:ring-offset-0 text-slate-900 placeholder:text-slate-400"
              />
            </div>
            <Button type="submit" disabled={loading} className="bg-teal-500 hover:bg-teal-600 text-white h-11 rounded-lg px-5 shadow-sm">
              {loading ? "Searching..." : "Search"}
            </Button>
            <Button type="button" variant="outline" className="h-11 rounded-lg border-slate-200 bg-white text-slate-700 hover:bg-slate-50">
              <Filter className="w-4 h-4 mr-1" /> Filters
            </Button>
          </form>

          <div className="mt-3 flex flex-wrap gap-2">
            {PRESET_QUERIES.map(s => (
              <button key={s} onClick={() => doSearch(null, s)}
                className="text-xs px-2.5 py-1 rounded-full bg-slate-50 border border-slate-200 text-slate-600 hover:border-teal-300 hover:text-teal-700 hover:bg-teal-50/50 transition">
                {s}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* PDL Credit indicator */}
      {quota && quota.monthlyRemaining !== null && (
        <Card className="bg-white border-slate-200 rounded-xl mb-4 shadow-sm">
          <CardContent className="p-3 flex items-center justify-between text-sm">
            <div className="flex items-center gap-2 text-slate-700">
              <ShieldCheck className="w-4 h-4 text-teal-600" />
              <span className="font-medium">PeopleDataLabs Free</span>
              <span className="text-slate-400">&bull;</span>
              <span>
                <span className={`font-semibold ${quota.monthlyRemaining < 10 ? "text-rose-600" : "text-slate-700"}`}>
                  {quota.monthlyRemaining}
                </span>
                <span className="text-slate-500"> / {quota.monthlyLimit || 100} monthly credits left</span>
              </span>
            </div>
            <div className="text-xs text-slate-500">
              {quota.minuteRemaining !== null && (
                <span>Rate: {quota.minuteRemaining}/{quota.minuteLimit || 10} req/min</span>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Results */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="text-sm text-slate-500 flex items-center gap-2 flex-wrap">
            <span>{loading ? "Searching..." : `${results.length} results`}</span>
            {lastSource === "pdl" && !loading && (
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-teal-50 text-teal-700 border border-teal-200 inline-flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" /> Verified &mdash; PeopleDataLabs
              </span>
            )}
            {lastSource === "cached" && !loading && (
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 border border-slate-200 text-slate-600">cached (no credit spent)</span>
            )}
            {lastSource === "seeded" && !loading && (
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 border border-slate-200 text-slate-600">demo data</span>
            )}
            {parsedFilters && parsedFilters.humanized && !loading && (
              <span className="text-[10px] text-slate-400">filters: {parsedFilters.humanized}</span>
            )}
          </div>
          <Link href="/dashboard/crm" className="text-xs text-teal-600 hover:text-teal-700 hover:underline">Open pipeline &rarr;</Link>
        </div>

        {errorMsg && !loading && (
          <Card className="bg-rose-50 border-rose-200 rounded-xl">
            <CardContent className="p-4 text-sm text-rose-700">
              {errorMsg}
            </CardContent>
          </Card>
        )}

        {loading && (
          <Card className="bg-gradient-to-b from-teal-50 to-white border-teal-200 rounded-xl">
            <CardContent className="p-8 text-center">
              <div className="inline-flex items-center gap-2 text-teal-700 mb-2">
                <ShieldCheck className="w-4 h-4 animate-pulse" />
                <span className="text-sm font-medium">Querying PeopleDataLabs for verified profiles...</span>
              </div>
              <div className="text-xs text-slate-500">Real records only. Usually returns in 1-3 seconds.</div>
            </CardContent>
          </Card>
        )}

        {results.map((lead, i) => {
          const isVerified = lead.source === "pdl" || lead.verified;
          return (
          <motion.div key={lead.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
            <Card className="bg-white border-slate-200 rounded-xl hover:border-teal-300 hover:shadow-md transition">
              <CardContent className="p-5 flex items-center gap-4">
                {lead.avatar ? (
                  <img src={lead.avatar} alt={lead.name} className="h-12 w-12 rounded-full object-cover ring-2 ring-slate-100" />
                ) : (
                  <div className="h-12 w-12 rounded-full bg-gradient-to-br from-teal-400 to-cyan-500 grid place-items-center text-white font-medium ring-2 ring-slate-100">
                    {lead.initials || (lead.name || "?")[0]}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <div className="font-medium text-slate-900">{lead.name}</div>
                    {isVerified ? (
                      <Badge className="bg-teal-50 text-teal-700 border-teal-200 text-[10px] hover:bg-teal-50 inline-flex items-center gap-0.5">
                        <ShieldCheck className="w-2.5 h-2.5" /> Verified
                      </Badge>
                    ) : lead.seniority ? (
                      <Badge className="bg-slate-100 border border-slate-200 text-slate-600 text-[10px] hover:bg-slate-100">{lead.seniority}</Badge>
                    ) : null}
                  </div>
                  <div className="text-sm text-slate-600 mt-0.5">
                    {lead.title}{lead.company ? <> &bull; {lead.company}</> : null}
                  </div>
                  <div className="text-xs text-slate-400 mt-1">
                    {lead.industry || ""}
                    {isVerified && <span className="ml-2 text-slate-400">&bull; Source: PeopleDataLabs</span>}
                  </div>
                </div>

                {!isVerified && (
                  <div className="hidden md:flex flex-col items-end gap-1.5 text-right mr-2">
                    {(lead.buyingSignals || []).slice(0, 2).map(sig => (
                      <span key={sig} className="text-[10px] px-2 py-0.5 rounded-full bg-teal-50 text-teal-700 border border-teal-200">{sig}</span>
                    ))}
                  </div>
                )}

                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" className="border-slate-200 bg-white hover:bg-slate-50 text-slate-700" onClick={() => saveLead(lead.id)}>
                    <Bookmark className="w-3.5 h-3.5" />
                  </Button>
                  {lead.linkedinUrl ? (
                    <a href={lead.linkedinUrl} target="_blank" rel="noreferrer">
                      <Button size="sm" className="bg-teal-500 hover:bg-teal-600 text-white shadow-sm">
                        <Linkedin className="w-3.5 h-3.5 mr-1" /> View on LinkedIn
                      </Button>
                    </a>
                  ) : (
                    <Link href={`/dashboard/lead/${lead.id}`}>
                      <Button size="sm" className="bg-teal-500 hover:bg-teal-600 text-white shadow-sm">
                        View <ArrowUpRight className="w-3.5 h-3.5 ml-1" />
                      </Button>
                    </Link>
                  )}
                  {lead.linkedinUrl && (
                    <Link href={`/dashboard/lead/${lead.id}`}>
                      <Button size="sm" variant="outline" className="border-slate-200 bg-white text-slate-700 hover:bg-slate-50">
                        AI <Bot className="w-3.5 h-3.5 ml-1" />
                      </Button>
                    </Link>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
          );
        })}

        {results.length === 0 && !loading && !errorMsg && (
          <Card className="bg-white border-slate-200 rounded-xl border-dashed">
            <CardContent className="p-12 text-center text-slate-500">
              {lastSource === "pdl" ? (
                <>
                  <div className="font-medium text-slate-700 mb-1">No verified profiles matched.</div>
                  <div className="text-sm">Try a broader query &mdash; e.g. drop the specific title, or search by company alone (e.g. &ldquo;Chubb&rdquo;, &ldquo;Aerotek&rdquo;).</div>
                </>
              ) : (
                <>No prospects yet. Try a preset above or search for a specific role and industry.</>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

export default function DashboardHome() {
  return (
    <Suspense fallback={<div className="p-8 text-slate-500">Loading...</div>}>
      <DashboardInner />
    </Suspense>
  );
}
