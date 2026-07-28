"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Accordion, AccordionItem, AccordionTrigger, AccordionContent
} from "@/components/ui/accordion";
import {
  Search, Building2, Sparkles, LayoutGrid, Bot, TrendingUp,
  Mail, Linkedin, FileText, ArrowRight, Zap, Check, Star, ChevronRight
} from "lucide-react";

const features = [
  { icon: Search, title: "AI Prospect Research", desc: "Discover decision-makers by title, industry, tech stack, buying intent." },
  { icon: Building2, title: "Company Intelligence", desc: "Funding, hiring, news, tech stack — fully enriched in one view." },
  { icon: Mail, title: "Personalized Outreach", desc: "Cold email, LinkedIn, follow-ups — tuned to buying signals." },
  { icon: LayoutGrid, title: "Kanban CRM", desc: "Drag deals across New → Won without leaving your workspace." },
  { icon: Bot, title: "AI Chat Assistant", desc: "ChatGPT-style copilot that already knows the prospect." },
  { icon: Zap, title: "Buying Signals", desc: "Funding rounds, hiring surges, tech migrations — auto-surfaced." },
  { icon: FileText, title: "Proposal Generator", desc: "One click. Structured proposals ready to send." },
  { icon: Linkedin, title: "LinkedIn Generator", desc: "Connection notes and DMs that actually get replies." },
  { icon: TrendingUp, title: "Pipeline Analytics", desc: "Reply rate, conversion, revenue — tracked in real time." },
];

const workflow = ["Search", "Research", "Generate Outreach", "Track", "Close"];

const pricing = [
  { name: "Free", price: "$0", period: "forever", features: ["50 lead searches", "AI Assistant (limited)", "1 workspace"], cta: "Get started" },
  { name: "Pro", price: "$49", period: "/mo", highlighted: true, features: ["Unlimited searches", "Full AI Assistant", "Outreach Generator", "CRM Pipeline"], cta: "Start free trial" },
  { name: "Team", price: "$149", period: "/mo", features: ["Everything in Pro", "5 seats", "Team analytics", "Shared templates"], cta: "Start free trial" },
  { name: "Enterprise", price: "Custom", period: "", features: ["SSO / SAML", "Salesforce sync", "Dedicated CSM", "Custom AI models"], cta: "Book demo" }
];

const testimonials = [
  { name: "Alex Nguyen", role: "Head of Sales, SeriesB SaaS", quote: "We booked 3x more demos in month one. The AI assistant literally writes better emails than our SDRs." },
  { name: "Maria Silva", role: "Founder, RevOps Agency", quote: "Replaced Apollo + Lavender + a spreadsheet. My team is faster and happier." },
  { name: "Jordan Weiss", role: "CRO, Fintech scaleup", quote: "Buying signals surface deals I would’ve missed. This is what Clay wanted to be." }
];

const faqs = [
  { q: "Do I need a credit card to start?", a: "No. Free plan gives you 50 searches and the AI Assistant to try it out." },
  { q: "Which AI model powers the assistant?", a: "Claude Sonnet 4.5 by default — the best model for persuasive B2B copy in 2025." },
  { q: "Can I export leads to my CRM?", a: "Yes. CSV today, native Salesforce/HubSpot sync on Team and Enterprise." },
  { q: "How fresh is the lead data?", a: "Company data refreshes weekly; buying signals refresh daily." }
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#08080b] text-white overflow-hidden">
      {/* Nav */}
      <nav className="sticky top-0 z-50 backdrop-blur-xl bg-black/40 border-b border-white/5">
        <div className="max-w-7xl mx-auto flex items-center justify-between h-16 px-6">
          <Link href="/" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 grid place-items-center font-bold">Q</div>
            <span className="font-semibold tracking-tight">Quality Leads</span>
          </Link>
          <div className="hidden md:flex items-center gap-8 text-sm text-white/70">
            <a href="#features" className="hover:text-white transition">Features</a>
            <a href="#workflow" className="hover:text-white transition">Workflow</a>
            <a href="#pricing" className="hover:text-white transition">Pricing</a>
            <a href="#faq" className="hover:text-white transition">FAQ</a>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/dashboard" className="text-sm text-white/70 hover:text-white">Log in</Link>
            <Link href="/dashboard">
              <Button className="bg-white text-black hover:bg-white/90 h-9 rounded-lg">Start free</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative pt-24 pb-32 px-6">
        {/* Grid + gradient bg */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-10%,rgba(120,80,255,0.25),transparent_60%)]" />
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:44px_44px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_60%,transparent_100%)]" />
        </div>

        <div className="relative max-w-6xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <Badge className="bg-white/5 border border-white/10 text-white/80 mb-6 rounded-full px-3 py-1">
              <Sparkles className="w-3 h-3 mr-1.5 text-indigo-400" /> Powered by Claude Sonnet 4.5
            </Badge>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.05 }}
            className="text-5xl md:text-7xl font-semibold tracking-tight leading-[1.05]"
          >
            Find Smarter Leads.<br />
            <span className="bg-gradient-to-br from-indigo-300 via-purple-300 to-pink-300 bg-clip-text text-transparent">
              Close More Deals with AI.
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="mt-6 text-lg md:text-xl text-white/60 max-w-2xl mx-auto"
          >
            AI-powered sales intelligence that finds prospects, researches companies, writes personalized outreach, and tracks your pipeline — all from one workspace.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.25 }}
            className="mt-10 flex items-center justify-center gap-3"
          >
            <Link href="/dashboard">
              <Button className="bg-white text-black hover:bg-white/90 h-11 px-6 rounded-lg font-medium">
                Start Free Trial <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </Link>
            <Button variant="outline" className="h-11 px-6 rounded-lg border-white/15 bg-white/5 hover:bg-white/10 text-white">
              Book Demo
            </Button>
          </motion.div>

          {/* Product mock */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.35 }}
            className="mt-16 mx-auto max-w-5xl"
          >
            <div className="rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.03] to-transparent p-2 shadow-2xl shadow-indigo-500/10">
              <div className="rounded-xl bg-[#0c0c11] border border-white/5 overflow-hidden">
                <div className="flex items-center gap-1.5 px-4 py-3 border-b border-white/5">
                  <div className="h-2.5 w-2.5 rounded-full bg-red-500/60" />
                  <div className="h-2.5 w-2.5 rounded-full bg-yellow-500/60" />
                  <div className="h-2.5 w-2.5 rounded-full bg-green-500/60" />
                  <div className="ml-4 text-xs text-white/40">app.qualityleads.ai/dashboard</div>
                </div>
                <div className="grid grid-cols-12 gap-4 p-6">
                  <div className="col-span-3 space-y-2">
                    {["Dashboard", "Search", "Companies", "Leads", "CRM", "AI Assistant"].map((x, i) => (
                      <div key={x} className={`px-3 py-2 rounded-md text-sm ${i===1?"bg-white/10 text-white":"text-white/50"}`}>{x}</div>
                    ))}
                  </div>
                  <div className="col-span-9 space-y-3">
                    <div className="h-10 rounded-lg bg-white/5 border border-white/10 flex items-center px-3 text-sm text-white/50">
                      <Search className="w-4 h-4 mr-2" /> VP of Engineering at SaaS companies, San Francisco...
                    </div>
                    {["Sarah Chen — VP Engineering • Rippling", "Marcus Rodriguez — CRO • Notion", "Priya Anand — Head of Growth • Linear"].map((x) => (
                      <div key={x} className="h-14 rounded-lg bg-white/[0.03] border border-white/5 flex items-center px-4 text-sm text-white/70">
                        <div className="h-8 w-8 rounded-full bg-gradient-to-br from-indigo-500/50 to-purple-500/50 mr-3" />
                        {x}
                        <div className="ml-auto flex gap-1">
                          <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-400">Buying signal</span>
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

      {/* Features */}
      <section id="features" className="py-24 px-6 border-t border-white/5">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <Badge className="bg-white/5 border border-white/10 text-white/70 mb-4">Features</Badge>
            <h2 className="text-4xl md:text-5xl font-semibold tracking-tight">Everything a modern rep needs</h2>
            <p className="mt-4 text-white/60 max-w-2xl mx-auto">Nine pillars. One workspace. Zero context switching.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-4">
            {features.map((f, i) => (
              <motion.div key={f.title} initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }}>
                <Card className="bg-white/[0.02] border-white/10 rounded-xl hover:bg-white/[0.04] transition p-1">
                  <CardContent className="p-6">
                    <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-white/10 grid place-items-center mb-4">
                      <f.icon className="w-5 h-5 text-indigo-300" />
                    </div>
                    <div className="font-medium mb-1.5">{f.title}</div>
                    <div className="text-sm text-white/50">{f.desc}</div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Workflow */}
      <section id="workflow" className="py-24 px-6 border-t border-white/5">
        <div className="max-w-4xl mx-auto text-center">
          <Badge className="bg-white/5 border border-white/10 text-white/70 mb-4">Workflow</Badge>
          <h2 className="text-4xl font-semibold tracking-tight">From prospect to closed-won</h2>
          <p className="mt-4 text-white/60">Every stage handled by AI. You stay in flow.</p>

          <div className="mt-12 flex flex-col md:flex-row items-center justify-center gap-3">
            {workflow.map((step, i) => (
              <div key={step} className="flex items-center gap-3">
                <div className="px-5 py-3 rounded-xl border border-white/10 bg-white/[0.03] font-medium">{step}</div>
                {i < workflow.length - 1 && <ChevronRight className="text-white/30 hidden md:block" />}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-24 px-6 border-t border-white/5">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <Badge className="bg-white/5 border border-white/10 text-white/70 mb-4">Pricing</Badge>
            <h2 className="text-4xl font-semibold tracking-tight">Simple. Transparent. Fair.</h2>
          </div>
          <div className="grid md:grid-cols-4 gap-4">
            {pricing.map(p => (
              <Card key={p.name} className={`${p.highlighted ? "bg-gradient-to-b from-indigo-500/10 to-transparent border-indigo-500/40" : "bg-white/[0.02] border-white/10"} rounded-xl relative`}>
                {p.highlighted && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 text-xs px-3 py-1 rounded-full bg-indigo-500 text-white font-medium">Most popular</div>
                )}
                <CardContent className="p-6">
                  <div className="font-medium text-lg">{p.name}</div>
                  <div className="mt-4 flex items-baseline gap-1">
                    <span className="text-4xl font-semibold tracking-tight">{p.price}</span>
                    <span className="text-white/50 text-sm">{p.period}</span>
                  </div>
                  <div className="mt-6 space-y-2.5">
                    {p.features.map(f => (
                      <div key={f} className="flex items-start gap-2 text-sm text-white/70">
                        <Check className="w-4 h-4 mt-0.5 text-emerald-400 shrink-0" /> {f}
                      </div>
                    ))}
                  </div>
                  <Link href="/dashboard">
                    <Button className={`w-full mt-6 rounded-lg ${p.highlighted ? "bg-white text-black hover:bg-white/90" : "bg-white/10 hover:bg-white/15 text-white"}`}>{p.cta}</Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 px-6 border-t border-white/5">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <Badge className="bg-white/5 border border-white/10 text-white/70 mb-4">Loved by revenue teams</Badge>
            <h2 className="text-4xl font-semibold tracking-tight">Reps who make quota, faster.</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-4">
            {testimonials.map(t => (
              <Card key={t.name} className="bg-white/[0.02] border-white/10 rounded-xl">
                <CardContent className="p-6">
                  <div className="flex gap-0.5 text-amber-400 mb-4">
                    {[...Array(5)].map((_,i) => <Star key={i} className="w-4 h-4 fill-amber-400" />)}
                  </div>
                  <p className="text-white/80 text-[15px] leading-relaxed">“{t.quote}”</p>
                  <div className="mt-4 pt-4 border-t border-white/5">
                    <div className="font-medium">{t.name}</div>
                    <div className="text-sm text-white/50">{t.role}</div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-24 px-6 border-t border-white/5">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-10">
            <Badge className="bg-white/5 border border-white/10 text-white/70 mb-4">FAQ</Badge>
            <h2 className="text-4xl font-semibold tracking-tight">Frequently asked</h2>
          </div>
          <Accordion type="single" collapsible className="space-y-2">
            {faqs.map((f, i) => (
              <AccordionItem key={i} value={String(i)} className="border border-white/10 rounded-xl px-4 bg-white/[0.02]">
                <AccordionTrigger className="text-left hover:no-underline">{f.q}</AccordionTrigger>
                <AccordionContent className="text-white/60">{f.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* Footer CTA */}
      <section className="py-24 px-6 border-t border-white/5">
        <div className="max-w-4xl mx-auto rounded-2xl bg-gradient-to-br from-indigo-500/20 via-purple-500/10 to-transparent border border-white/10 p-12 text-center">
          <h3 className="text-3xl md:text-4xl font-semibold tracking-tight">Ready to close more?</h3>
          <p className="mt-3 text-white/60">Start free. No credit card. See the first email your AI writes in under 60 seconds.</p>
          <Link href="/dashboard">
            <Button className="mt-6 bg-white text-black hover:bg-white/90 h-11 px-6 rounded-lg">Launch workspace <ArrowRight className="ml-2 w-4 h-4" /></Button>
          </Link>
        </div>
      </section>

      <footer className="py-12 px-6 border-t border-white/5 text-center text-white/40 text-sm">
        © 2025 Quality Leads. Built with Claude Sonnet 4.5.
      </footer>
    </div>
  );
}
