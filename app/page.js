"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Search, Building2, Sparkles, LayoutGrid, Bot, TrendingUp,
  Mail, Linkedin, FileText, ArrowRight, Zap, Check, ChevronRight, ChevronDown,
  Shield, Users, Target, BadgeCheck
} from "lucide-react";

const features = [
  { icon: Search, title: "Verified Prospect Research", desc: "Search real decision-makers at P&C carriers, MGAs, staffing firms and RPO agencies — filtered by title, department and geography." },
  { icon: Building2, title: "Carrier & Agency Intelligence", desc: "State licenses, AM Best rating, book size, funding, hiring, RFP activity — one enriched view per account." },
  { icon: Target, title: "Intent Triggers", desc: "Get pinged when a carrier opens a claims-tech RFP or a staffing firm posts a 30% MoM hiring surge." },
  { icon: Mail, title: "Personalized Outreach", desc: "Cold email, LinkedIn, follow-ups — tuned to insurance procurement cycles and staffing sales motions." },
  { icon: LayoutGrid, title: "Pipeline CRM", desc: "Kanban stages from Discovery → Won that mirror how insurance and staffing deals actually close." },
  { icon: Bot, title: "AI Sales Assistant", desc: "ChatGPT-style copilot that already knows the account, the triggers, and how your buyer thinks." },
  { icon: FileText, title: "Proposal Generator", desc: "RFP-ready proposals for insurance procurement and MSA / placement-fee frameworks for staffing." },
  { icon: Linkedin, title: "LinkedIn Outreach", desc: "Connection notes and DMs written for VP Talent, Procurement Directors, and Claims Ops leaders." },
  { icon: TrendingUp, title: "Pipeline Analytics", desc: "Reply rate, meetings booked, placement pipeline, and revenue — tracked in real time." },
];

const workflow = ["Search", "Research", "Trigger", "Outreach", "Close"];

const pricing = [
  { name: "Free", price: "$0", period: "forever", features: ["50 prospect searches / mo", "AI Assistant (limited)", "1 workspace"], cta: "Get started" },
  { name: "Pro", price: "$49", period: "/mo", highlighted: true, features: ["Unlimited searches", "Full AI Assistant", "Outreach Generator", "CRM Pipeline", "Intent Triggers"], cta: "Start free trial" },
  { name: "Team", price: "$149", period: "/mo", features: ["Everything in Pro", "5 seats", "Team analytics", "Shared templates", "Priority support"], cta: "Start free trial" },
  { name: "Enterprise", price: "Custom", period: "", features: ["SSO / SAML", "CRM sync", "Dedicated CSM", "Custom triggers"], cta: "Book demo" }
];

const faqs = [
  { q: "Do I need a credit card to start?", a: "No. The free plan gives you 50 prospect searches per month and access to the AI Assistant — no card required." },
  { q: "Which AI model powers the Sales Assistant?", a: "Claude Sonnet 4.5 by Anthropic — currently the strongest model for persuasive B2B writing and long-context prospect analysis." },
  { q: "Can I export leads to my CRM?", a: "Yes — CSV export is available on all paid plans today. Native Salesforce and HubSpot sync are on the Team plan roadmap." },
  { q: "How fresh is the account data?", a: "Company records refresh weekly. Intent triggers (RFPs, hiring spikes, funding) refresh daily." },
  { q: "How is prospect and contact data handled?", a: "Prospect data is sourced from PeopleDataLabs and currently includes name, title, company, and LinkedIn URL only — no email or phone number at this time. Records are stored encrypted, and you can request deletion of any record at any time by emailing us. See our Privacy Policy for full details." }
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white text-slate-900 overflow-hidden">
      {/* Nav */}
      <nav className="sticky top-0 z-50 backdrop-blur-xl bg-white/80 border-b border-slate-200">
        <div className="max-w-7xl mx-auto flex items-center justify-between h-16 px-6">
          <Link href="/" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-teal-400 to-cyan-500 grid place-items-center font-bold text-white shadow-sm">Q</div>
            <span className="font-semibold tracking-tight">Quality Leads</span>
          </Link>
          <div className="hidden md:flex items-center gap-8 text-sm text-slate-600">
            <a href="#features" className="hover:text-slate-900 transition">Features</a>
            <a href="#workflow" className="hover:text-slate-900 transition">Workflow</a>
            <a href="#pricing" className="hover:text-slate-900 transition">Pricing</a>
            <a href="#faq" className="hover:text-slate-900 transition">FAQ</a>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/dashboard" className="text-sm text-slate-600 hover:text-slate-900">Log in</Link>
            <Link href="/dashboard">
              <Button className="bg-teal-500 hover:bg-teal-600 text-white h-9 rounded-lg shadow-sm">Start free</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative pt-24 pb-28 px-6">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-10%,rgba(20,184,166,0.18),transparent_60%)]" />
          <div className="absolute inset-0 grid-bg" />
        </div>

        <div className="relative max-w-6xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <Badge className="bg-teal-50 border border-teal-200 text-teal-700 mb-6 rounded-full px-3 py-1 hover:bg-teal-50">
              <Sparkles className="w-3 h-3 mr-1.5 text-teal-500" /> Built for P&C insurance & staffing sales teams
            </Badge>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.05 }}
            className="text-5xl md:text-7xl font-semibold tracking-tight leading-[1.05] text-slate-900"
          >
            Real Prospects. <br />
            <span className="brand-gradient-text">Insurance & Staffing Sales, on AI.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="mt-6 text-lg md:text-xl text-slate-600 max-w-2xl mx-auto"
          >
            Verified decision-makers at P&C carriers, MGAs and staffing firms — with the intent triggers, personalized outreach and pipeline tracking your team actually needs.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.25 }}
            className="mt-10 flex items-center justify-center gap-3 flex-wrap"
          >
            <Link href="/dashboard">
              <Button className="bg-teal-500 hover:bg-teal-600 text-white h-11 px-6 rounded-lg font-medium shadow-sm">
                Start Free Trial <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </Link>
            <Button variant="outline" className="h-11 px-6 rounded-lg border-slate-200 bg-white hover:bg-slate-50 text-slate-900">
              Book Demo
            </Button>
          </motion.div>

          {/* Example searches */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.35 }}
            className="mt-10 max-w-3xl mx-auto"
          >
            <div className="text-xs uppercase tracking-widest text-slate-500 mb-3">Try a search</div>
            <div className="flex flex-wrap justify-center gap-2">
              {[
                "Procurement Managers at P&C carriers",
                "VP Talent Acquisition at healthcare staffing firms",
                "Claims Directors at regional insurance carriers",
                "Head of Recruiting at IT staffing agencies",
              ].map(q => (
                <Link key={q} href={`/dashboard?q=${encodeURIComponent(q)}`}
                  className="text-sm px-3 py-1.5 rounded-full bg-white border border-slate-200 text-slate-700 hover:border-teal-400 hover:text-teal-700 hover:bg-teal-50/50 transition shadow-sm">
                  {q}
                </Link>
              ))}
            </div>
          </motion.div>

          {/* Product mock */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.45 }}
            className="mt-14 mx-auto max-w-5xl"
          >
            <div className="rounded-2xl border border-slate-200 bg-white p-2 shadow-xl shadow-teal-500/5">
              <div className="rounded-xl bg-slate-50 border border-slate-200 overflow-hidden">
                <div className="flex items-center gap-1.5 px-4 py-3 border-b border-slate-200 bg-white">
                  <div className="h-2.5 w-2.5 rounded-full bg-rose-400/70" />
                  <div className="h-2.5 w-2.5 rounded-full bg-amber-400/70" />
                  <div className="h-2.5 w-2.5 rounded-full bg-emerald-400/70" />
                  <div className="ml-4 text-xs text-slate-400">app.qualityleads.ai/dashboard</div>
                </div>
                <div className="grid grid-cols-12 gap-4 p-6 bg-white">
                  <div className="col-span-3 space-y-1.5">
                    {["Dashboard", "Search", "Companies", "Leads", "CRM", "AI Assistant"].map((x, i) => (
                      <div key={x} className={`px-3 py-2 rounded-md text-sm ${i===1?"bg-teal-50 text-teal-700 font-medium":"text-slate-500"}`}>{x}</div>
                    ))}
                  </div>
                  <div className="col-span-9 space-y-3">
                    <div className="h-10 rounded-lg bg-slate-50 border border-slate-200 flex items-center px-3 text-sm text-slate-500">
                      <Search className="w-4 h-4 mr-2" /> Procurement Managers at P&C insurance carriers…
                    </div>
                    {[
                      "Sarah Whitfield — VP Procurement • Chubb",
                      "Marcus Delgado — Director of Sourcing • Travelers",
                      "Rachel Bennett — VP Talent Acquisition • Aerotek"
                    ].map((x, i) => (
                      <div key={x} className="h-14 rounded-lg bg-white border border-slate-200 flex items-center px-4 text-sm text-slate-700">
                        <div className="h-8 w-8 rounded-full bg-gradient-to-br from-teal-300 to-cyan-400 mr-3" />
                        {x}
                        <div className="ml-auto flex gap-1">
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-teal-50 text-teal-700 border border-teal-200">Intent trigger</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Trust bar */}
      <section className="py-8 px-6 border-y border-slate-100 bg-slate-50/50">
        <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-center gap-x-10 gap-y-3 text-xs text-slate-500 uppercase tracking-widest">
          <span className="inline-flex items-center gap-1.5"><Shield className="w-3.5 h-3.5" /> Encrypted contact data</span>
          <span className="inline-flex items-center gap-1.5"><BadgeCheck className="w-3.5 h-3.5" /> Licensed B2B sources</span>
          <span className="inline-flex items-center gap-1.5"><Users className="w-3.5 h-3.5" /> Purpose-built for insurance & staffing</span>
          <span className="inline-flex items-center gap-1.5"><Sparkles className="w-3.5 h-3.5" /> Powered by Claude Sonnet 4.5</span>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <Badge className="bg-slate-100 border border-slate-200 text-slate-600 mb-4 hover:bg-slate-100">Features</Badge>
            <h2 className="text-4xl md:text-5xl font-semibold tracking-tight">Everything an insurance or staffing rep needs</h2>
            <p className="mt-4 text-slate-600 max-w-2xl mx-auto">Nine focused capabilities. One workspace. Built around how your industry actually sells.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-4">
            {features.map((f, i) => (
              <motion.div key={f.title} initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }}>
                <Card className="bg-white border-slate-200 rounded-xl hover:border-teal-300 hover:shadow-md hover:shadow-teal-500/5 transition p-1">
                  <CardContent className="p-6">
                    <div className="h-10 w-10 rounded-lg bg-teal-50 border border-teal-200 grid place-items-center mb-4">
                      <f.icon className="w-5 h-5 text-teal-600" />
                    </div>
                    <div className="font-medium mb-1.5 text-slate-900">{f.title}</div>
                    <div className="text-sm text-slate-600">{f.desc}</div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Workflow */}
      <section id="workflow" className="py-24 px-6 border-t border-slate-100 bg-slate-50/50">
        <div className="max-w-4xl mx-auto text-center">
          <Badge className="bg-white border border-slate-200 text-slate-600 mb-4 hover:bg-white">Workflow</Badge>
          <h2 className="text-4xl font-semibold tracking-tight">From prospect to placement or policy</h2>
          <p className="mt-4 text-slate-600">Every stage handled by AI. Your reps stay in flow.</p>

          <div className="mt-12 flex flex-col md:flex-row items-center justify-center gap-3">
            {workflow.map((step, i) => (
              <div key={step} className="flex items-center gap-3">
                <div className="px-5 py-3 rounded-xl border border-slate-200 bg-white font-medium shadow-sm">{step}</div>
                {i < workflow.length - 1 && <ChevronRight className="text-slate-300 hidden md:block" />}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <Badge className="bg-slate-100 border border-slate-200 text-slate-600 mb-4 hover:bg-slate-100">Pricing</Badge>
            <h2 className="text-4xl font-semibold tracking-tight">Simple. Transparent. Fair.</h2>
          </div>
          <div className="grid md:grid-cols-4 gap-4">
            {pricing.map(p => (
              <Card key={p.name} className={`${p.highlighted ? "bg-gradient-to-b from-teal-50 to-white border-teal-300 shadow-md shadow-teal-500/10" : "bg-white border-slate-200"} rounded-xl relative`}>
                {p.highlighted && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 text-xs px-3 py-1 rounded-full bg-teal-500 text-white font-medium shadow">Most popular</div>
                )}
                <CardContent className="p-6">
                  <div className="font-medium text-lg">{p.name}</div>
                  <div className="mt-4 flex items-baseline gap-1">
                    <span className="text-4xl font-semibold tracking-tight">{p.price}</span>
                    <span className="text-slate-500 text-sm">{p.period}</span>
                  </div>
                  <div className="mt-6 space-y-2.5">
                    {p.features.map(f => (
                      <div key={f} className="flex items-start gap-2 text-sm text-slate-700">
                        <Check className="w-4 h-4 mt-0.5 text-teal-500 shrink-0" /> {f}
                      </div>
                    ))}
                  </div>
                  <Link href={p.name === "Enterprise" ? "/dashboard" : "/dashboard/billing"}>
                    <Button className={`w-full mt-6 rounded-lg ${p.highlighted ? "bg-teal-500 hover:bg-teal-600 text-white shadow-sm" : "bg-slate-900 hover:bg-slate-800 text-white"}`}>{p.cta}</Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials — placeholder for real quotes */}
      <section className="py-24 px-6 border-t border-slate-100 bg-slate-50/50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <Badge className="bg-white border border-slate-200 text-slate-600 mb-4 hover:bg-white">Customer stories</Badge>
            <h2 className="text-4xl font-semibold tracking-tight">Reps who make quota, faster.</h2>
            <p className="mt-3 text-slate-500">Real customer stories coming soon.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-4">
            {[0,1,2].map(i => (
              <Card key={i} className="bg-white border-slate-200 rounded-xl border-dashed">
                <CardContent className="p-6 min-h-[180px] flex items-center justify-center text-slate-400 text-sm">
                  Reserved for a real customer quote
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-24 px-6">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-10">
            <Badge className="bg-slate-100 border border-slate-200 text-slate-600 mb-4 hover:bg-slate-100">FAQ</Badge>
            <h2 className="text-4xl font-semibold tracking-tight">Frequently asked</h2>
          </div>
          <div className="space-y-2">
            {faqs.map((f, i) => (
              <details key={i} className="group border border-slate-200 rounded-xl px-4 bg-white open:shadow-sm">
                <summary className="flex items-center justify-between py-4 text-sm font-medium cursor-pointer list-none text-slate-900">
                  <span>{f.q}</span>
                  <ChevronDown className="w-4 h-4 text-slate-400 transition-transform group-open:rotate-180" />
                </summary>
                <div className="pb-4 pt-0 text-sm text-slate-600 leading-relaxed">{f.a}</div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto rounded-2xl bg-gradient-to-br from-teal-500 to-cyan-500 p-12 text-center text-white shadow-lg">
          <h3 className="text-3xl md:text-4xl font-semibold tracking-tight">Ready to book more meetings?</h3>
          <p className="mt-3 text-white/85">Start free. No credit card. See the first email your AI writes in under 60 seconds.</p>
          <Link href="/dashboard">
            <Button className="mt-6 bg-white text-teal-700 hover:bg-slate-50 h-11 px-6 rounded-lg font-medium">Launch workspace <ArrowRight className="ml-2 w-4 h-4" /></Button>
          </Link>
        </div>
      </section>

      <footer className="py-10 px-6 border-t border-slate-200">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-slate-500">
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded-md bg-gradient-to-br from-teal-400 to-cyan-500 grid place-items-center font-bold text-white text-xs">Q</div>
            <span>© 2025 Quality Leads. All rights reserved.</span>
          </div>
          <nav className="flex flex-wrap gap-x-6 gap-y-2">
            <Link href="/terms" className="hover:text-slate-900">Terms</Link>
            <Link href="/privacy" className="hover:text-slate-900">Privacy</Link>
            <Link href="/refund" className="hover:text-slate-900">Refund Policy</Link>
            <a href="mailto:shibangikarmakar14@gmail.com" className="hover:text-slate-900">Support</a>
          </nav>
        </div>
      </footer>
    </div>
  );
}
