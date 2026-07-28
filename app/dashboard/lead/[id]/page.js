"use client";

import { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { toast } from "sonner";
import {
  ArrowLeft, Building2, MapPin, Briefcase, GraduationCap, Sparkles,
  Mail, Linkedin, Phone, FileText, MessageSquare, Send, Copy, RefreshCw,
  Zap, Bookmark, Users, TrendingUp, Newspaper, Code2, Target, Bot
} from "lucide-react";

const OUTREACH_TYPES = [
  { key: "cold_email", label: "Cold Email", icon: Mail },
  { key: "linkedin_message", label: "LinkedIn", icon: Linkedin },
  { key: "follow_up", label: "Follow-up", icon: RefreshCw },
  { key: "call_script", label: "Call Script", icon: Phone },
  { key: "voicemail", label: "Voicemail", icon: Phone },
  { key: "breakup_email", label: "Break-up", icon: Mail },
  { key: "proposal_outline", label: "Proposal", icon: FileText }
];

const QUICK_PROMPTS = [
  "Write a cold email that references their recent funding",
  "Generate a LinkedIn connection request under 300 chars",
  "Create a follow-up after 5 days of no reply",
  "Suggest 5 discovery call questions tailored to them",
  "What objections might they raise and how do I handle them?",
  "Summarize this company in 3 sentences"
];

export default function LeadProfilePage() {
  const { id } = useParams();
  const [lead, setLead] = useState(null);
  const [loading, setLoading] = useState(true);

  // Chat state
  const [sessionId, setSessionId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [tone, setTone] = useState("consultative");
  const chatBottomRef = useRef(null);

  // Outreach state
  const [outreachType, setOutreachType] = useState("cold_email");
  const [outreachText, setOutreachText] = useState("");
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    fetch(`/api/leads/${id}`).then(r => r.json()).then(d => {
      setLead(d.lead);
      setLoading(false);
      setMessages([{
        role: "assistant",
        content: `Hi 👋 I've loaded ${d.lead?.name}'s full profile — role at ${d.lead?.company}, recent posts, buying signals, and company context. Ask me to write outreach, spot objections, or plan a discovery call.`
      }]);
    });
  }, [id]);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, sending]);

  async function sendMessage(text) {
    const content = (text ?? input).trim();
    if (!content || sending) return;
    setInput("");
    setMessages(m => [...m, { role: "user", content }]);
    setSending(true);
    try {
      const r = await fetch("/api/chat", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId, leadId: id, message: `[Tone: ${tone}] ${content}` })
      });
      const d = await r.json();
      if (d.error) throw new Error(d.error);
      setSessionId(d.sessionId);
      setMessages(m => [...m, { role: "assistant", content: d.reply }]);
    } catch (e) {
      toast.error("AI error: " + e.message);
    } finally {
      setSending(false);
    }
  }

  async function generateOutreach(type = outreachType) {
    setGenerating(true);
    setOutreachType(type);
    setOutreachText("");
    try {
      const r = await fetch("/api/outreach", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ leadId: id, type, tone })
      });
      const d = await r.json();
      if (d.error) throw new Error(d.error);
      setOutreachText(d.content);
    } catch (e) {
      toast.error("Generation failed: " + e.message);
    } finally {
      setGenerating(false);
    }
  }

  async function saveLead() {
    const r = await fetch("/api/saved", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ leadId: id })
    });
    const d = await r.json();
    toast.success(d.alreadySaved ? "Already saved" : "Lead saved");
  }

  async function addToCRM() {
    const r = await fetch("/api/crm/add", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ leadId: id, stage: "new", note: "Added from profile", value: 25000 })
    });
    if (r.ok) toast.success("Added to CRM pipeline");
  }

  function copyText(t) {
    navigator.clipboard.writeText(t);
    toast.success("Copied to clipboard");
  }

  if (loading) return <div className="p-12 text-white/50">Loading profile…</div>;
  if (!lead) return <div className="p-12">Not found</div>;

  const c = lead.companyDetails || {};

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_460px] h-screen">
      {/* LEFT: PROFILE */}
      <div className="overflow-y-auto p-8 border-r border-white/5">
        <Link href="/dashboard" className="inline-flex items-center gap-1.5 text-sm text-white/50 hover:text-white mb-6">
          <ArrowLeft className="w-4 h-4" /> Back to search
        </Link>

        {/* Header card */}
        <Card className="bg-gradient-to-br from-indigo-500/10 via-purple-500/5 to-transparent border-white/10 rounded-2xl mb-6">
          <CardContent className="p-6">
            <div className="flex items-start gap-5">
              <img src={lead.avatar} alt={lead.name} className="h-20 w-20 rounded-2xl object-cover ring-2 ring-white/10" />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-semibold tracking-tight">{lead.name}</h1>
                  <Badge className="bg-emerald-500/15 text-emerald-400 border-emerald-500/20">Active</Badge>
                </div>
                <div className="text-white/70 mt-1">{lead.title} • {lead.company}</div>
                <div className="flex flex-wrap gap-4 mt-3 text-sm text-white/50">
                  <span className="inline-flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" /> {lead.location}</span>
                  <span className="inline-flex items-center gap-1.5"><Briefcase className="w-3.5 h-3.5" /> {lead.industry}</span>
                  <a href={`https://${lead.linkedin}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 hover:text-white">
                    <Linkedin className="w-3.5 h-3.5" /> LinkedIn
                  </a>
                  <span className="inline-flex items-center gap-1.5"><Mail className="w-3.5 h-3.5" /> {lead.email}</span>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="border-white/10 bg-white/[0.02] text-white hover:bg-white/10" onClick={saveLead}>
                  <Bookmark className="w-3.5 h-3.5 mr-1" /> Save
                </Button>
                <Button size="sm" className="bg-white text-black hover:bg-white/90" onClick={addToCRM}>
                  <Zap className="w-3.5 h-3.5 mr-1" /> Add to CRM
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Buying signals */}
        <Card className="bg-white/[0.02] border-white/10 rounded-xl mb-6">
          <CardContent className="p-5">
            <div className="flex items-center gap-2 mb-3">
              <Target className="w-4 h-4 text-emerald-400" />
              <h3 className="font-medium">Buying Signals</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {(lead.buyingSignals || []).map(s => (
                <span key={s} className="text-xs px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">{s}</span>
              ))}
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="profile">
          <TabsList className="bg-white/[0.03] border border-white/10 rounded-lg">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="company">Company</TabsTrigger>
            <TabsTrigger value="activity">Activity</TabsTrigger>
            <TabsTrigger value="outreach">Outreach</TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="mt-5 space-y-4">
            <Card className="bg-white/[0.02] border-white/10 rounded-xl">
              <CardContent className="p-5">
                <h3 className="font-medium mb-3 flex items-center gap-2"><Briefcase className="w-4 h-4 text-indigo-300" /> Experience</h3>
                <div className="space-y-3">
                  {(lead.experience || []).map((e, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <div className="h-8 w-8 rounded-lg bg-white/5 border border-white/10 grid place-items-center text-xs">{e.company[0]}</div>
                      <div>
                        <div className="font-medium text-sm">{e.role}</div>
                        <div className="text-xs text-white/50">{e.company} • {e.years}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            <Card className="bg-white/[0.02] border-white/10 rounded-xl">
              <CardContent className="p-5">
                <h3 className="font-medium mb-3 flex items-center gap-2"><GraduationCap className="w-4 h-4 text-indigo-300" /> Education</h3>
                <div className="text-sm text-white/70 space-y-1">
                  {(lead.education || []).map(ed => <div key={ed}>• {ed}</div>)}
                </div>
              </CardContent>
            </Card>
            <Card className="bg-white/[0.02] border-white/10 rounded-xl">
              <CardContent className="p-5">
                <h3 className="font-medium mb-3">Skills</h3>
                <div className="flex flex-wrap gap-2">
                  {(lead.skills || []).map(s => (
                    <span key={s} className="text-xs px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-white/70">{s}</span>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="company" className="mt-5 space-y-4">
            <Card className="bg-white/[0.02] border-white/10 rounded-xl">
              <CardContent className="p-5">
                <div className="flex items-center gap-4">
                  <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 grid place-items-center text-xl font-bold">{c.logo}</div>
                  <div>
                    <div className="text-lg font-medium">{c.name}</div>
                    <div className="text-sm text-white/50">{c.industry} • {c.employees} employees • {c.hq}</div>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3 mt-5">
                  <div className="rounded-lg bg-white/[0.03] border border-white/5 p-3">
                    <div className="text-xs text-white/50">Revenue</div>
                    <div className="font-medium mt-0.5">{c.revenue}</div>
                  </div>
                  <div className="rounded-lg bg-white/[0.03] border border-white/5 p-3">
                    <div className="text-xs text-white/50">Growth</div>
                    <div className="font-medium mt-0.5 text-emerald-400">{c.growth}</div>
                  </div>
                  <div className="rounded-lg bg-white/[0.03] border border-white/5 p-3">
                    <div className="text-xs text-white/50">Funding</div>
                    <div className="font-medium mt-0.5 text-xs">{c.funding}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-white/[0.02] border-white/10 rounded-xl">
              <CardContent className="p-5">
                <h3 className="font-medium mb-3 flex items-center gap-2"><Code2 className="w-4 h-4 text-indigo-300" /> Tech Stack</h3>
                <div className="flex flex-wrap gap-2">
                  {(c.techStack || []).map(t => (
                    <span key={t} className="text-xs px-2.5 py-1 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">{t}</span>
                  ))}
                </div>
              </CardContent>
            </Card>
            <Card className="bg-white/[0.02] border-white/10 rounded-xl">
              <CardContent className="p-5">
                <h3 className="font-medium mb-3 flex items-center gap-2"><Newspaper className="w-4 h-4 text-indigo-300" /> Recent News</h3>
                <ul className="space-y-2 text-sm text-white/70">
                  {(c.news || []).map(n => <li key={n}>• {n}</li>)}
                </ul>
              </CardContent>
            </Card>
            <Card className="bg-white/[0.02] border-white/10 rounded-xl">
              <CardContent className="p-5">
                <h3 className="font-medium mb-3 flex items-center gap-2"><Users className="w-4 h-4 text-indigo-300" /> Competitors</h3>
                <div className="flex flex-wrap gap-2">
                  {(c.competitors || []).map(x => (
                    <span key={x} className="text-xs px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-white/70">{x}</span>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="activity" className="mt-5 space-y-4">
            <Card className="bg-white/[0.02] border-white/10 rounded-xl">
              <CardContent className="p-5">
                <h3 className="font-medium mb-3">Recent LinkedIn posts</h3>
                <div className="space-y-3">
                  {(lead.recentPosts || []).map((p, i) => (
                    <div key={i} className="rounded-lg bg-white/[0.03] border border-white/5 p-4 text-sm text-white/80">
                      “{p}”
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="outreach" className="mt-5">
            <Card className="bg-white/[0.02] border-white/10 rounded-xl">
              <CardContent className="p-5 space-y-4">
                <div className="flex flex-wrap items-center gap-2">
                  {OUTREACH_TYPES.map(t => (
                    <Button key={t.key} onClick={() => generateOutreach(t.key)} disabled={generating}
                      variant={outreachType === t.key ? "default" : "outline"}
                      className={outreachType === t.key ? "bg-white text-black hover:bg-white/90" : "border-white/10 bg-white/[0.02] text-white hover:bg-white/10"}
                      size="sm">
                      <t.icon className="w-3.5 h-3.5 mr-1.5" /> {t.label}
                    </Button>
                  ))}
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-sm text-white/50">Tone:</span>
                  <Select value={tone} onValueChange={setTone}>
                    <SelectTrigger className="w-40 bg-white/[0.03] border-white/10"><SelectValue /></SelectTrigger>
                    <SelectContent className="bg-[#0c0c11] border-white/10 text-white">
                      {["consultative", "professional", "friendly", "executive", "direct", "casual"].map(x => (
                        <SelectItem key={x} value={x}>{x[0].toUpperCase() + x.slice(1)}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button onClick={() => generateOutreach(outreachType)} disabled={generating}
                    className="bg-gradient-to-br from-indigo-500 to-purple-600 hover:opacity-90 text-white ml-auto" size="sm">
                    <Sparkles className="w-3.5 h-3.5 mr-1.5" /> {generating ? "Generating…" : "Generate"}
                  </Button>
                </div>

                <div className="rounded-lg bg-black/40 border border-white/10 p-4 min-h-[220px] whitespace-pre-wrap text-sm text-white/85">
                  {generating ? (
                    <div className="flex items-center gap-2 text-white/50">
                      <RefreshCw className="w-4 h-4 animate-spin" /> Claude Sonnet 4.5 is writing personalized copy…
                    </div>
                  ) : outreachText || <span className="text-white/40">Pick a format above and hit Generate. The AI already knows this prospect.</span>}
                </div>

                {outreachText && (
                  <Button variant="outline" size="sm" onClick={() => copyText(outreachText)}
                    className="border-white/10 bg-white/[0.02] text-white hover:bg-white/10">
                    <Copy className="w-3.5 h-3.5 mr-1.5" /> Copy
                  </Button>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* RIGHT: AI ASSISTANT */}
      <div className="flex flex-col bg-[#0a0a0e] h-screen">
        <div className="h-16 flex items-center justify-between px-5 border-b border-white/5">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 grid place-items-center">
              <Bot className="w-4 h-4 text-white" />
            </div>
            <div>
              <div className="font-medium text-sm">AI Sales Assistant</div>
              <div className="text-[11px] text-emerald-400">• Context loaded</div>
            </div>
          </div>
          <Select value={tone} onValueChange={setTone}>
            <SelectTrigger className="w-32 h-8 bg-white/[0.03] border-white/10 text-xs"><SelectValue /></SelectTrigger>
            <SelectContent className="bg-[#0c0c11] border-white/10 text-white">
              {["consultative", "professional", "friendly", "executive", "direct", "casual"].map(x => (
                <SelectItem key={x} value={x}>{x[0].toUpperCase() + x.slice(1)}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          <AnimatePresence initial={false}>
            {messages.map((m, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm whitespace-pre-wrap ${
                  m.role === "user" ? "bg-white text-black" : "bg-white/[0.04] border border-white/10 text-white/90"
                }`}>
                  {m.content}
                  {m.role === "assistant" && i > 0 && (
                    <div className="mt-2 flex gap-1.5">
                      <button onClick={() => copyText(m.content)} className="text-[10px] text-white/40 hover:text-white/70 inline-flex items-center gap-1">
                        <Copy className="w-3 h-3" /> Copy
                      </button>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          {sending && (
            <div className="flex justify-start">
              <div className="rounded-2xl px-4 py-2.5 bg-white/[0.04] border border-white/10 text-white/60 text-sm inline-flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-white/60 animate-pulse" />
                <span className="h-1.5 w-1.5 rounded-full bg-white/60 animate-pulse [animation-delay:150ms]" />
                <span className="h-1.5 w-1.5 rounded-full bg-white/60 animate-pulse [animation-delay:300ms]" />
              </div>
            </div>
          )}
          <div ref={chatBottomRef} />
        </div>

        {/* Quick prompts */}
        <div className="px-4 pb-2">
          <div className="flex flex-wrap gap-1.5">
            {QUICK_PROMPTS.slice(0, 3).map(p => (
              <button key={p} onClick={() => sendMessage(p)} disabled={sending}
                className="text-[11px] px-2.5 py-1 rounded-full bg-white/[0.03] border border-white/10 text-white/60 hover:text-white hover:bg-white/[0.06]">
                {p}
              </button>
            ))}
          </div>
        </div>

        <form onSubmit={(e) => { e.preventDefault(); sendMessage(); }} className="p-4 border-t border-white/5">
          <div className="flex items-center gap-2 rounded-xl bg-white/[0.04] border border-white/10 px-3 focus-within:border-white/25 transition">
            <MessageSquare className="w-4 h-4 text-white/40" />
            <Input
              value={input} onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about this prospect…"
              className="flex-1 bg-transparent border-0 h-11 focus-visible:ring-0 focus-visible:ring-offset-0 text-white placeholder:text-white/40"
              disabled={sending}
            />
            <Button type="submit" size="sm" disabled={sending || !input.trim()} className="bg-white text-black hover:bg-white/90 h-8">
              <Send className="w-3.5 h-3.5" />
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
