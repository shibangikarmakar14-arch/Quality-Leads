"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  ArrowLeft, Upload, FileText, Sparkles, CheckCircle2, Copy, RefreshCw, Building2, Target
} from "lucide-react";

const SAMPLE_CSV = `name,title,company,industry,location
Jane Doe,Head of Sales,Acme SaaS,B2B Software,San Francisco
John Smith,VP Marketing,Northstar Analytics,Data Analytics,New York
Lisa Wang,CTO,Fintech Rise,Fintech,Singapore
Carlos Martinez,Founder,ShipRight,Logistics,Miami`;

function parseCSV(text) {
  const lines = text.trim().split(/\r?\n/).filter(Boolean);
  if (lines.length < 2) return [];
  const headers = lines[0].split(",").map(h => h.trim().toLowerCase());
  return lines.slice(1).map(line => {
    // simple CSV: no quoted commas in MVP
    const cells = line.split(",").map(c => c.trim());
    const row = {};
    headers.forEach((h, i) => { row[h] = cells[i] || ""; });
    return row;
  });
}

export default function ImportPage() {
  const [csvText, setCsvText] = useState("");
  const [rows, setRows] = useState([]);
  const [enriched, setEnriched] = useState([]);
  const [running, setRunning] = useState(false);
  const [step, setStep] = useState("input"); // input | preview | enrich | done

  function handlePaste(v) {
    setCsvText(v);
    const parsed = parseCSV(v);
    setRows(parsed);
    if (parsed.length > 0) setStep("preview");
  }

  function onFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => handlePaste(String(ev.target.result || ""));
    reader.readAsText(file);
  }

  function loadSample() { handlePaste(SAMPLE_CSV); }

  async function enrich() {
    if (rows.length === 0) { toast.error("No rows to enrich"); return; }
    setRunning(true);
    setStep("enrich");
    setEnriched([]);
    try {
      const r = await fetch("/api/import/csv", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rows })
      });
      const d = await r.json();
      if (d.error) throw new Error(d.error);
      const jobId = d.jobId;
      if (!jobId) throw new Error("No jobId returned");

      let finished = false;
      while (!finished) {
        await new Promise(res => setTimeout(res, 2000));
        const sr = await fetch(`/api/bulk/${jobId}`);
        const sd = await sr.json();
        if (sd.error && sd.status !== "running") throw new Error(sd.error);
        setEnriched(sd.results || []);
        if (sd.status === "done") {
          finished = true;
          setStep("done");
          toast.success(`Enriched ${sd.results?.length || 0} prospects`);
        } else if (sd.status === "error") {
          throw new Error(sd.error || "Job failed");
        }
      }
    } catch (e) {
      toast.error("Enrichment failed: " + e.message);
      setStep("preview");
    } finally {
      setRunning(false);
    }
  }

  function copyEmail(t) {
    navigator.clipboard.writeText(t);
    toast.success("Copied");
  }

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <Link href="/dashboard" className="inline-flex items-center gap-1.5 text-sm text-white/50 hover:text-white mb-4">
        <ArrowLeft className="w-4 h-4" /> Back
      </Link>
      <div className="mb-6">
        <h1 className="text-3xl font-semibold tracking-tight">CSV Lead Import</h1>
        <p className="text-white/50 mt-1">Drop in a CSV. Get buying signals and a personalized cold email for every row.</p>
      </div>

      {/* Step indicator */}
      <div className="flex items-center gap-2 mb-6 text-sm">
        {["input","preview","enrich","done"].map((s, i) => (
          <div key={s} className="flex items-center gap-2">
            <div className={`h-6 w-6 rounded-full grid place-items-center text-xs font-medium ${
              step === s ? "bg-indigo-500 text-white" :
              ["input","preview","enrich","done"].indexOf(step) > i ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" :
              "bg-white/5 text-white/40 border border-white/10"
            }`}>{i+1}</div>
            <span className={step === s ? "text-white" : "text-white/40"}>
              {s === "input" ? "Upload" : s === "preview" ? "Preview" : s === "enrich" ? "Enriching" : "Done"}
            </span>
            {i < 3 && <span className="text-white/20 mx-1">→</span>}
          </div>
        ))}
      </div>

      {/* Input area */}
      {step === "input" && (
        <Card className="bg-white/[0.02] border-white/10 rounded-xl">
          <CardContent className="p-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <div className="text-sm font-medium mb-2">Upload a CSV file</div>
                <label className="block cursor-pointer rounded-xl border-2 border-dashed border-white/10 bg-white/[0.02] p-8 text-center hover:border-indigo-500/40 hover:bg-indigo-500/[0.03] transition">
                  <Upload className="w-8 h-8 text-white/40 mx-auto mb-3" />
                  <div className="text-sm text-white/70">Click to upload</div>
                  <div className="text-xs text-white/40 mt-1">CSV with columns: name, title, company, industry, location</div>
                  <input type="file" accept=".csv,text/csv" onChange={onFile} className="hidden" />
                </label>
                <div className="mt-3 text-center">
                  <button onClick={loadSample} className="text-xs text-indigo-300 hover:underline">
                    Or use sample data →
                  </button>
                </div>
              </div>
              <div>
                <div className="text-sm font-medium mb-2">Or paste CSV</div>
                <Textarea value={csvText} onChange={(e) => handlePaste(e.target.value)}
                  placeholder={"name,title,company,industry,location\nJane Doe,VP Sales,Acme,SaaS,New York"}
                  className="bg-white/[0.03] border-white/10 min-h-[200px] font-mono text-xs" />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Preview */}
      {step === "preview" && (
        <Card className="bg-white/[0.02] border-white/10 rounded-xl">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-indigo-300" />
                <span className="font-medium">{rows.length} prospects detected</span>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => { setStep("input"); setRows([]); setCsvText(""); }}
                  className="border-white/10 bg-white/[0.02] text-white hover:bg-white/10">Clear</Button>
                <Button onClick={enrich} disabled={running}
                  className="bg-gradient-to-br from-indigo-500 to-purple-600 hover:opacity-90 text-white">
                  <Sparkles className="w-4 h-4 mr-2" /> Enrich all with AI
                </Button>
              </div>
            </div>
            <div className="rounded-lg border border-white/10 overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-white/[0.03] text-white/60 text-xs">
                  <tr>
                    <th className="text-left p-3">Name</th>
                    <th className="text-left p-3">Title</th>
                    <th className="text-left p-3">Company</th>
                    <th className="text-left p-3">Industry</th>
                    <th className="text-left p-3">Location</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.slice(0, 20).map((r, i) => (
                    <tr key={i} className="border-t border-white/5">
                      <td className="p-3">{r.name}</td>
                      <td className="p-3 text-white/60">{r.title}</td>
                      <td className="p-3 text-white/60">{r.company}</td>
                      <td className="p-3 text-white/60">{r.industry}</td>
                      <td className="p-3 text-white/60">{r.location}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {rows.length > 20 && <div className="p-2 text-xs text-white/40 text-center bg-white/[0.02]">+ {rows.length - 20} more</div>}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Enriching */}
      {step === "enrich" && (
        <Card className="bg-white/[0.02] border-white/10 rounded-xl">
          <CardContent className="p-12 text-center">
            <RefreshCw className="w-8 h-8 text-indigo-300 animate-spin mx-auto mb-4" />
            <div className="font-medium">Claude is researching {rows.length} prospects...</div>
            <div className="text-sm text-white/50 mt-1">Generating buying signals and cold email for each row. Usually 15-30 seconds.</div>
          </CardContent>
        </Card>
      )}

      {/* Done */}
      {step === "done" && enriched.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            <span className="font-medium">{enriched.length} prospects enriched</span>
          </div>
          <div className="space-y-3">
            {enriched.map((row, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                <Card className="bg-white/[0.02] border-white/10 rounded-xl">
                  <CardContent className="p-5">
                    <div className="flex items-start gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <div className="font-medium">{row.name}</div>
                          <Badge className="bg-white/5 border border-white/10 text-white/60 text-[10px]">{row.title}</Badge>
                        </div>
                        <div className="text-sm text-white/60 mt-0.5 flex items-center gap-2">
                          <Building2 className="w-3.5 h-3.5" /> {row.company} • {row.industry} • {row.location}
                        </div>
                      </div>
                    </div>

                    {row.error ? (
                      <div className="mt-3 text-sm text-rose-400">Error: {row.error}</div>
                    ) : (
                      <div className="mt-4 grid md:grid-cols-2 gap-4">
                        <div>
                          <div className="flex items-center gap-1.5 text-xs text-white/50 mb-2">
                            <Target className="w-3.5 h-3.5" /> BUYING SIGNALS
                          </div>
                          <div className="flex flex-wrap gap-1.5">
                            {(row.buyingSignals || []).map((s, j) => (
                              <span key={j} className="text-[11px] px-2 py-1 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">{s}</span>
                            ))}
                          </div>
                        </div>
                        <div>
                          <div className="flex items-center justify-between text-xs text-white/50 mb-2">
                            <span>COLD EMAIL</span>
                            <button onClick={() => copyEmail(row.coldEmail)} className="text-indigo-300 hover:underline inline-flex items-center gap-1">
                              <Copy className="w-3 h-3" /> Copy
                            </button>
                          </div>
                          <div className="whitespace-pre-wrap text-xs text-white/80 rounded-lg bg-black/40 border border-white/10 p-3 max-h-56 overflow-y-auto">{row.coldEmail}</div>
                        </div>
                      </div>
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
