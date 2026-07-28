"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import {
  Sparkles, Mail, Linkedin, RefreshCw, FileText, Phone, Copy, ArrowLeft,
  CheckCircle2, Zap, Users
} from "lucide-react";

const OUTREACH_TYPES = [
  { key: "cold_email", label: "Cold Email", icon: Mail },
  { key: "linkedin_message", label: "LinkedIn", icon: Linkedin },
  { key: "follow_up", label: "Follow-up", icon: RefreshCw },
  { key: "call_script", label: "Call Script", icon: Phone }
];

export default function BulkOutreachPage() {
  const [leads, setLeads] = useState([]);
  const [selected, setSelected] = useState(new Set());
  const [type, setType] = useState("cold_email");
  const [tone, setTone] = useState("consultative");
  const [pitch, setPitch] = useState("");
  const [running, setRunning] = useState(false);
  const [results, setResults] = useState([]);
  const [progress, setProgress] = useState({ done: 0, total: 0 });

  useEffect(() => {
    fetch("/api/leads").then(r => r.json()).then(d => setLeads(d.results || []));
  }, []);

  function toggle(id) {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }

  function selectAll() {
    if (selected.size === leads.length) setSelected(new Set());
    else setSelected(new Set(leads.map(l => l.id)));
  }

  async function generate() {
    if (selected.size === 0) { toast.error("Select at least one lead"); return; }
    setRunning(true);
    setResults([]);
    setProgress({ done: 0, total: selected.size });

    try {
      const r = await fetch("/api/outreach/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ leadIds: Array.from(selected), type, tone, productPitch: pitch })
      });
      const d = await r.json();
      if (d.error) throw new Error(d.error);
      const jobId = d.jobId;
      if (!jobId) throw new Error("No jobId returned");

      // Poll every 2s
      let finished = false;
      while (!finished) {
        await new Promise(res => setTimeout(res, 2000));
        const sr = await fetch(`/api/bulk/${jobId}`);
        const sd = await sr.json();
        if (sd.error) throw new Error(sd.error);
        setProgress({ done: sd.done || 0, total: sd.total || selected.size });
        setResults(sd.results || []);
        if (sd.status === "done" || sd.status === "error") {
          finished = true;
          if (sd.status === "error") throw new Error(sd.error || "Job failed");
          toast.success(`Generated ${sd.results?.length || 0} outreach messages`);
        }
      }
    } catch (e) {
      toast.error("Bulk generation failed: " + e.message);
    } finally {
      setRunning(false);
    }
  }

  function copyOne(text) {
    navigator.clipboard.writeText(text);
    toast.success("Copied");
  }

  function copyAll() {
    const combined = results.map(r => `---\nTO: ${r.name} (${r.company})\n\n${r.content}\n`).join("\n");
    navigator.clipboard.writeText(combined);
    toast.success("All messages copied");
  }

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <Link href="/dashboard" className="inline-flex items-center gap-1.5 text-sm text-white/50 hover:text-white mb-4">
        <ArrowLeft className="w-4 h-4" /> Back
      </Link>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Bulk Outreach</h1>
          <p className="text-white/50 mt-1">Select leads, pick a format, and let Claude write all of them in one click.</p>
        </div>
        <Badge className="bg-indigo-500/15 text-indigo-300 border-indigo-500/20">
          <Users className="w-3 h-3 mr-1" /> {selected.size} selected
        </Badge>
      </div>

      {/* Config */}
      <Card className="bg-white/[0.02] border-white/10 rounded-xl mb-5">
        <CardContent className="p-5 grid md:grid-cols-4 gap-3 items-end">
          <div>
            <div className="text-xs text-white/50 mb-1.5">Format</div>
            <Select value={type} onValueChange={setType}>
              <SelectTrigger className="bg-white/[0.03] border-white/10"><SelectValue /></SelectTrigger>
              <SelectContent className="bg-[#0c0c11] border-white/10 text-white">
                {OUTREACH_TYPES.map(t => <SelectItem key={t.key} value={t.key}>{t.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <div className="text-xs text-white/50 mb-1.5">Tone</div>
            <Select value={tone} onValueChange={setTone}>
              <SelectTrigger className="bg-white/[0.03] border-white/10"><SelectValue /></SelectTrigger>
              <SelectContent className="bg-[#0c0c11] border-white/10 text-white">
                {["consultative","professional","friendly","executive","direct","casual"].map(x =>
                  <SelectItem key={x} value={x}>{x[0].toUpperCase()+x.slice(1)}</SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>
          <div className="md:col-span-2">
            <div className="text-xs text-white/50 mb-1.5">Your pitch (optional)</div>
            <Textarea value={pitch} onChange={e => setPitch(e.target.value)}
              placeholder="e.g., We help RevOps teams cut manual research 5x with an AI copilot..."
              className="bg-white/[0.03] border-white/10 h-10 min-h-[40px]" />
          </div>
        </CardContent>
      </Card>

      {/* Lead list with checkboxes */}
      <Card className="bg-white/[0.02] border-white/10 rounded-xl mb-5">
        <CardContent className="p-5">
          <div className="flex items-center justify-between mb-3">
            <button onClick={selectAll} className="text-xs text-indigo-300 hover:underline">
              {selected.size === leads.length ? "Deselect all" : `Select all (${leads.length})`}
            </button>
            <Button onClick={generate} disabled={running || selected.size === 0}
              className="bg-gradient-to-br from-indigo-500 to-purple-600 hover:opacity-90 text-white">
              <Sparkles className="w-4 h-4 mr-2" />
              {running ? `Generating ${progress.done}/${progress.total}...` : `Generate for ${selected.size} lead${selected.size!==1?"s":""}`}
            </Button>
          </div>

          <div className="space-y-1.5">
            {leads.map(l => (
              <label key={l.id}
                className={`flex items-center gap-3 p-2.5 rounded-lg border transition cursor-pointer ${
                  selected.has(l.id) ? "bg-indigo-500/10 border-indigo-500/30" : "bg-white/[0.02] border-white/5 hover:bg-white/[0.04]"
                }`}>
                <Checkbox checked={selected.has(l.id)} onCheckedChange={() => toggle(l.id)}
                  className="border-white/20 data-[state=checked]:bg-indigo-500 data-[state=checked]:border-indigo-500" />
                <img src={l.avatar} alt="" className="h-8 w-8 rounded-full object-cover ring-1 ring-white/10" />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium">{l.name}</div>
                  <div className="text-xs text-white/50">{l.title} • {l.company}</div>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-white/60">{l.seniority}</span>
              </label>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      {results.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              <span className="font-medium">{results.length} personalized messages ready</span>
            </div>
            <Button size="sm" onClick={copyAll} className="bg-white text-black hover:bg-white/90">
              <Copy className="w-3.5 h-3.5 mr-1.5" /> Copy all
            </Button>
          </div>

          <div className="space-y-3">
            {results.map((r, i) => (
              <motion.div key={r.leadId} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
                <Card className="bg-white/[0.02] border-white/10 rounded-xl">
                  <CardContent className="p-5">
                    <div className="flex items-center gap-3 mb-3">
                      <img src={r.avatar} alt="" className="h-9 w-9 rounded-full object-cover ring-1 ring-white/10" />
                      <div className="flex-1">
                        <div className="font-medium text-sm">{r.name}</div>
                        <div className="text-xs text-white/50">{r.title} • {r.company}</div>
                      </div>
                      <Button size="sm" variant="outline" onClick={() => copyOne(r.content)}
                        className="border-white/10 bg-white/[0.02] text-white hover:bg-white/10">
                        <Copy className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                    {r.error ? (
                      <div className="text-sm text-rose-400">Error: {r.error}</div>
                    ) : (
                      <div className="whitespace-pre-wrap text-sm text-white/85 rounded-lg bg-black/40 border border-white/10 p-4">{r.content}</div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
