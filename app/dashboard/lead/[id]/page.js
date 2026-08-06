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
  ArrowLeft, MapPin, Briefcase, GraduationCap, Sparkles,
  Mail, Linkedin, Phone, FileText, MessageSquare, Send, Copy, RefreshCw,
  Zap, Bookmark, Users, Newspaper, Code2, Target, Bot
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
  "Write a cold email that references their recent intent trigger",
  "Generate a LinkedIn connection request under 300 chars",
  "Suggest 5 discovery questions tailored to their role and industry",
  "Summarize this account and the buyer's likely priorities"
];

export default function LeadProfilePage() {
  const { id } = useParams();
  const [lead, setLead] = useState(null);
  const [loading, setLoading] = useState(true);

  const [sessionId, setSessionId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [tone, setTone] = useState("consultative");
  const chatBottomRef = useRef(null);

  const [outreachType, setOutreachType] = useState("cold_email");
  const [outreachText, setOutreachText] = useState("");
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    fetch(`/api/leads/${id}`).then(r => r.json()).then(d => {
      setLead(d.lead);
      setLoading(false);
      setMessages([{
        role: "assistant",
        content: `Hi 👋 I've loaded ${d.lead?.name}'s full account context — their role at ${d.lead?.company}, recent posts, intent triggers, and account details. Ask me for outreach, objection handling, discovery questions, or a proposal outline.`
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

  if (loading) return <div className="p-12 text-slate-500">Loading profile…</div>;
  if (!lead) return <div className="p-12">Not found</div>;

  const c = lead.companyDetails || {};

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_460px] h-screen bg-slate-50">
      {/* LEFT: PROFILE */}
      <div className="overflow-y-auto p-8 border-r border-slate-200">
        <Link href="/dashboard" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-900 mb-6">
          <ArrowLeft className="w-4 h-4" /> Back to search
        </Link>

        {/* Header card */}
        <Card className="bg-gradient-to-br from-teal-50 to-white border-teal-200 rounded-2xl mb-6 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-start gap-5">
              <img src={lead.avatar} alt={lead.name} className="h-20 w-20 rounded-2xl object-cover ring-2 ring-white shadow-sm" />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-semibold tracking-tight text-slate-900">{lead.name}</h1>
                  <Badge className="bg-teal-500 text-white border-0 hover:bg-teal-500">Active</Badge>
                </div>
                <div className="text-slate-700 mt-1">{lead.title} • {lead.company}</div>
                <div className="flex flex-wrap gap-4 mt-3 text-sm text-slate-500">
                  <span className="inline-flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" /> {lead.location}</span>
                  <span className="inline-flex items-center gap-1.5"><Briefcase className="w-3.5 h-3.5" /> {lead.industry}</span>
                  <a href={`https://${lead.linkedin}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 hover:text-teal-700">
                    <Linkedin className="w-3.5 h-3.5" /> LinkedIn
                  </a>
                  <span className="inline-flex items-center gap-1.5"><Mail className="w-3.5 h-3.5" /> {lead.email}</span>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="border-slate-200 bg-white text-slate-700 hover:bg-slate-50" onClick={saveLead}>
                  <Bookmark className="w-3.5 h-3.5 mr-1" /> Save
                </Button>
                <Button size="sm" className="bg-teal-500 hover:bg-teal-600 text-white shadow-sm" onClick={addToCRM}>
                  <Zap className="w-3.5 h-3.5 mr-1" /> Add to CRM
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Intent triggers */}
        <Card className="bg-white border-slate-200 rounded-xl mb-6 shadow-sm">
          <CardContent className="p-5">
            <div className="flex items-center gap-2 mb-3">
              <Target className="w-4 h-4 text-teal-600" />
              <h3 className="font-medium text-slate-900">Intent Triggers</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {(lead.buyingSignals || []).map(s => (
                <span key={s} className="text-xs px-2.5 py-1 rounded-full bg-teal-50 text-teal-700 border border-teal-200">{s}</span>
              ))}
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="profile">
          <TabsList className="bg-white border border-slate-200 rounded-lg">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="company">Company</TabsTrigger>
            <TabsTrigger value="activity">Activity</TabsTrigger>
            <TabsTrigger value="outreach">Outreach</TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="mt-5 space-y-4">
            <Card className="bg-white border-slate-200 rounded-xl shadow-sm">
              <CardContent className="p-5">
                <h3 className="font-medium mb-3 flex items-center gap-2 text-slate-900"><Briefcase className="w-4 h-4 text-teal-600" /> Experience</h3>
                <div className="space-y-3">
                  {(lead.experience || []).map((e, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <div className="h-8 w-8 rounded-lg bg-slate-100 border border-slate-200 grid place-items-center text-xs text-slate-700 font-medium">{e.company[0]}</div>
                      <div>
                        <div className="font-medium text-sm text-slate-900">{e.role}</div>
                        <div className="text-xs text-slate-500">{e.company} • {e.years}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            <Card className="bg-white border-slate-200 rounded-xl shadow-sm">
              <CardContent className="p-5">
                <h3 className="font-medium mb-3 flex items-center gap-2 text-slate-900"><GraduationCap className="w-4 h-4 text-teal-600" /> Education & Certifications</h3>
                <div className="text-sm text-slate-700 space-y-1">
                  {(lead.education || []).map(ed => <div key={ed}>• {ed}</div>)}
                </div>
              </CardContent>
            </Card>
            <Card className="bg-white border-slate-200 rounded-xl shadow-sm">
              <CardContent className="p-5">
                <h3 className="font-medium mb-3 text-slate-900">Skills</h3>
                <div className="flex flex-wrap gap-2">
                  {(lead.skills || []).map(s => (
                    <span key={s} className="text-xs px-2.5 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-700">{s}</span>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="company" className="mt-5 space-y-4">
            <Card className="bg-white border-slate-200 rounded-xl shadow-sm">
              <CardContent className="p-5">
                <div className="flex items-center gap-4">
                  <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-teal-400 to-cyan-500 grid place-items-center text-xl font-bold text-white shadow-sm">{c.logo}</div>
                  <div>
                    <div className="text-lg font-medium text-slate-900">{c.name}</div>
                    <div className="text-sm text-slate-500">{c.industry} • {c.employees} employees • {c.hq}</div>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3 mt-5">
                  <div className="rounded-lg bg-slate-50 border border-slate-200 p-3">
                    <div className="text-xs text-slate-500">Revenue / GWP</div>
                    <div className="font-medium mt-0.5 text-slate-900">{c.revenue}</div>
                  </div>
                  <div className="rounded-lg bg-slate-50 border border-slate-200 p-3">
                    <div className="text-xs text-slate-500">Growth</div>
                    <div className="font-medium mt-0.5 text-teal-600">{c.growth}</div>
                  </div>
                  <div className="rounded-lg bg-slate-50 border border-slate-200 p-3">
                    <div className="text-xs text-slate-500">Funding</div>
                    <div className="font-medium mt-0.5 text-xs text-slate-700">{c.funding}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-white border-slate-200 rounded-xl shadow-sm">
              <CardContent className="p-5">
                <h3 className="font-medium mb-3 flex items-center gap-2 text-slate-900"><Code2 className="w-4 h-4 text-teal-600" /> Tech Stack</h3>
                <div className="flex flex-wrap gap-2">
                  {(c.techStack || []).map(t => (
                    <span key={t} className="text-xs px-2.5 py-1 rounded-full bg-teal-50 text-teal-700 border border-teal-200">{t}</span>
                  ))}
                </div>
              </CardContent>
            </Card>
            <Card className="bg-white border-slate-200 rounded-xl shadow-sm">
              <CardContent className="p-5">
                <h3 className="font-medium mb-3 flex items-center gap-2 text-slate-900"><Newspaper className="w-4 h-4 text-teal-600" /> Recent News</h3>
                <ul className="space-y-2 text-sm text-slate-700">
                  {(c.news || []).map(n => <li key={n}>• {n}</li>)}
                </ul>
              </CardContent>
            </Card>
            <Card className="bg-white border-slate-200 rounded-xl shadow-sm">
              <CardContent className="p-5">
                <h3 className="font-medium mb-3 flex items-center gap-2 text-slate-900"><Users className="w-4 h-4 text-teal-600" /> Competitors</h3>
                <div className="flex flex-wrap gap-2">
                  {(c.competitors || []).map(x => (
                    <span key={x} className="text-xs px-2.5 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-700">{x}</span>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="activity" className="mt-5 space-y-4">
            <Card className="bg-white border-slate-200 rounded-xl shadow-sm">
              <CardContent className="p-5">
                <h3 className="font-medium mb-3 text-slate-900">Recent LinkedIn posts</h3>
                <div className="space-y-3">
                  {(lead.recentPosts || []).map((p, i) => (
                    <div key={i} className="rounded-lg bg-slate-50 border border-slate-200 p-4 text-sm text-slate-700">
                      “{p}”
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="outreach" className="mt-5">
            <Card className="bg-white border-slate-200 rounded-xl shadow-sm">
              <CardContent className="p-5 space-y-4">
                <div className="flex flex-wrap items-center gap-2">
                  {OUTREACH_TYPES.map(t => (
                    <Button key={t.key} onClick={() => generateOutreach(t.key)} disabled={generating}
                      variant={outreachType === t.key ? "default" : "outline"}
                      className={outreachType === t.key ? "bg-teal-500 text-white hover:bg-teal-600 shadow-sm" : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"}
                      size="sm">
                      <t.icon className="w-3.5 h-3.5 mr-1.5" /> {t.label}
                    </Button>
                  ))}
                </div>

                <div className="flex items-center gap-3 flex-wrap">
                  <span className="text-sm text-slate-500">Tone:</span>
                  <Select value={tone} onValueChange={setTone}>
                    <SelectTrigger className="w-40 bg-white border-slate-200"><SelectValue /></SelectTrigger>
                    <SelectContent className="bg-white border-slate-200">
                      {["consultative", "professional", "friendly", "executive", "direct", "casual"].map(x => (
                        <SelectItem key={x} value={x}>{x[0].toUpperCase() + x.slice(1)}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button onClick={() => generateOutreach(outreachType)} disabled={generating}
                    className="bg-gradient-to-br from-teal-500 to-cyan-500 hover:opacity-90 text-white ml-auto shadow-sm" size="sm">
                    <Sparkles className="w-3.5 h-3.5 mr-1.5" /> {generating ? "Generating…" : "Generate"}
                  </Button>
                </div>

                <div className="rounded-lg bg-slate-50 border border-slate-200 p-4 min-h-[220px] whitespace-pre-wrap text-sm text-slate-800">
                  {generating ? (
                    <div className="flex items-center gap-2 text-slate-500">
                      <RefreshCw className="w-4 h-4 animate-spin" /> Claude Sonnet 4.5 is writing personalized copy…
                    </div>
                  ) : outreachText || <span className="text-slate-400">Pick a format above and hit Generate. The AI already knows this prospect.</span>}
                </div>

                {outreachText && (
                  <Button variant="outline" size="sm" onClick={() => copyText(outreachText)}
                    className="border-slate-200 bg-white text-slate-700 hover:bg-slate-50">
                    <Copy className="w-3.5 h-3.5 mr-1.5" /> Copy
                  </Button>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* RIGHT: AI ASSISTANT */}
      <div className="flex flex-col bg-white h-screen border-l border-slate-200">
        <div className="h-16 flex items-center justify-between px-5 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-teal-400 to-cyan-500 grid place-items-center shadow-sm">
              <Bot className="w-4 h-4 text-white" />
            </div>
            <div>
              <div className="font-medium text-sm text-slate-900">AI Sales Assistant</div>
              <div className="text-[11px] text-teal-600">• Context loaded</div>
            </div>
          </div>
          <Select value={tone} onValueChange={setTone}>
            <SelectTrigger className="w-32 h-8 bg-slate-50 border-slate-200 text-xs"><SelectValue /></SelectTrigger>
            <SelectContent className="bg-white border-slate-200">
              {["consultative", "professional", "friendly", "executive", "direct", "casual"].map(x => (
                <SelectItem key={x} value={x}>{x[0].toUpperCase() + x.slice(1)}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50/50">
          <AnimatePresence initial={false}>
            {messages.map((m, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm whitespace-pre-wrap ${
                  m.role === "user" ? "bg-teal-500 text-white shadow-sm" : "bg-white border border-slate-200 text-slate-800 shadow-sm"
                }`}>
                  {m.content}
                  {m.role === "assistant" && i > 0 && (
                    <div className="mt-2 flex gap-1.5">
                      <button onClick={() => copyText(m.content)} className="text-[10px] text-slate-400 hover:text-slate-700 inline-flex items-center gap-1">
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
              <div className="rounded-2xl px-4 py-2.5 bg-white border border-slate-200 text-slate-500 text-sm inline-flex items-center gap-2 shadow-sm">
                <span className="h-1.5 w-1.5 rounded-full bg-slate-400 animate-pulse" />
                <span className="h-1.5 w-1.5 rounded-full bg-slate-400 animate-pulse [animation-delay:150ms]" />
                <span className="h-1.5 w-1.5 rounded-full bg-slate-400 animate-pulse [animation-delay:300ms]" />
              </div>
            </div>
          )}
          <div ref={chatBottomRef} />
        </div>

        <div className="px-4 pb-2">
          <div className="flex flex-wrap gap-1.5">
            {QUICK_PROMPTS.slice(0, 3).map(p => (
              <button key={p} onClick={() => sendMessage(p)} disabled={sending}
                className="text-[11px] px-2.5 py-1 rounded-full bg-white border border-slate-200 text-slate-600 hover:text-teal-700 hover:border-teal-300 hover:bg-teal-50">
                {p}
              </button>
            ))}
          </div>
        </div>

        <form onSubmit={(e) => { e.preventDefault(); sendMessage(); }} className="p-4 border-t border-slate-200 bg-white">
          <div className="flex items-center gap-2 rounded-xl bg-slate-50 border border-slate-200 px-3 focus-within:border-teal-400 focus-within:bg-white transition">
            <MessageSquare className="w-4 h-4 text-slate-400" />
            <Input
              value={input} onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about this prospect…"
              className="flex-1 bg-transparent border-0 h-11 focus-visible:ring-0 focus-visible:ring-offset-0 text-slate-900 placeholder:text-slate-400"
              disabled={sending}
            />
            <Button type="submit" size="sm" disabled={sending || !input.trim()} className="bg-teal-500 hover:bg-teal-600 text-white h-8 shadow-sm">
              <Send className="w-3.5 h-3.5" />
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
