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
      <Link href="/dashboard" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-900 mb-4">
        <ArrowLeft className="w-4 h-4" /> Back
      </Link>
      <div className="mb-6">
        <h1 className="text-3xl font-semibold tracking-tight">CSV Lead Import</h1>
        <p className="text-slate-500 mt-1">Drop in a CSV. Get buying signals and a personalized cold email for every row.</p>
      </div>

      {/* Step indicator */}
      <div className="flex items-center gap-2 mb-6 text-sm">
        {["input","preview","enrich","done"].map((s, i) => (
          <div key={s} className="flex items-center gap-2">
            <div className={`h-6 w-6 rounded-full grid place-items-center text-xs font-medium ${
              step === s ? "bg-teal-500 text-white" :
              ["input","preview","enrich","done"].indexOf(step) > i ? "bg-teal-100 text-teal-600 border border-teal-300" :
              "bg-white/5 text-slate-400 border border-slate-200"
            }`}>{i+1}</div>
            <span className={step === s ? "text-white" : "text-slate-400"}>
              {s === "input" ? "Upload" : s === "preview" ? "Preview" : s === "enrich" ? "Enriching" : "Done"}
            </span>
            {i < 3 && <span className="text-slate-300 mx-1">→</span>}
          </div>
        ))}
      </div>

      {/* Input area */}
      {step === "input" && (
        <Card className="bg-white border-slate-200 rounded-xl">
          <CardContent className="p-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <div className="text-sm font-medium mb-2">Upload a CSV file</div>
                <label className="block cursor-pointer rounded-xl border-2 border-dashed border-slate-200 bg-white p-8 text-center hover:border-teal-300 hover:bg-teal-500/[0.03] transition">
                  <Upload className="w-8 h-8 text-slate-400 mx-auto mb-3" />
                  <div className="text-sm text-slate-700">Click to upload</div>
                  <div className="text-xs text-slate-400 mt-1">CSV with columns: name, title, company, industry, location</div>
                  <input type="file" accept=".csv,text/csv" onChange={onFile} className="hidden" />
                </label>
                <div className="mt-3 text-center">
                  <button onClick={loadSample} className="text-xs text-teal-600 hover:underline">
                    Or use sample data →
                  </button>
                </div>
              </div>
              <div>
                <div className="text-sm font-medium mb-2">Or paste CSV</div>
                <Textarea value={csvText} onChange={(e) => handlePaste(e.target.value)}
                  placeholder={"name,title,company,industry,location\nJane Doe,VP Sales,Acme,SaaS,New York"}
                  className="bg-slate-50 border-slate-200 min-h-[200px] font-mono text-xs" />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Preview */}
      {step === "preview" && (
        <Card className="bg-white border-slate-200 rounded-xl">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-teal-600" />
                <span className="font-medium">{rows.length} prospects detected</span>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => { setStep("input"); setRows([]); setCsvText(""); }}
                  className="border-slate-200 bg-white text-slate-900 hover:bg-white/10">Clear</Button>
                <Button onClick={enrich} disabled={running}
                  className="bg-gradient-to-br from-teal-500 to-cyan-500 hover:opacity-90 text-white">
                  <Sparkles className="w-4 h-4 mr-2" /> Enrich all with AI
                </Button>
              </div>
            </div>
            <div className="rounded-lg border border-slate-200 overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 text-slate-600 text-xs">
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
                    <tr key={i} className="border-t border-slate-200">
                      <td className="p-3">{r.name}</td>
                      <td className="p-3 text-slate-600">{r.title}</td>
                      <td className="p-3 text-slate-600">{r.company}</td>
                      <td className="p-3 text-slate-600">{r.industry}</td>
                      <td className="p-3 text-slate-600">{r.location}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {rows.length > 20 && <div className="p-2 text-xs text-slate-400 text-center bg-white">+ {rows.length - 20} more</div>}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Enriching */}
      {step === "enrich" && (
        <Card className="bg-white border-slate-200 rounded-xl">
          <CardContent className="p-12 text-center">
            <RefreshCw className="w-8 h-8 text-teal-600 animate-spin mx-auto mb-4" />
            <div className="font-medium">Claude is researching {rows.length} prospects...</div>
            <div className="text-sm text-slate-500 mt-1">Generating buying signals and cold email for each row. Usually 15-30 seconds.</div>
          </CardContent>
        </Card>
      )}

      {/* Done */}
      {step === "done" && enriched.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <CheckCircle2 className="w-5 h-5 text-teal-600" />
            <span className="font-medium">{enriched.length} prospects enriched</span>
          </div>
          <div className="space-y-3">
            {enriched.map((row, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                <Card className="bg-white border-slate-200 rounded-xl">
                  <CardContent className="p-5">
                    <div className="flex items-start gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <div className="font-medium">{row.name}</div>
                          <Badge className="bg-white/5 border border-slate-200 text-slate-600 text-[10px]">{row.title}</Badge>
                        </div>
                        <div className="text-sm text-slate-600 mt-0.5 flex items-center gap-2">
                          <Building2 className="w-3.5 h-3.5" /> {row.company} • {row.industry} • {row.location}
                        </div>
                      </div>
                    </div>

                    {row.error ? (
                      <div className="mt-3 text-sm text-rose-600">Error: {row.error}</div>
                    ) : (
                      <div className="mt-4 grid md:grid-cols-2 gap-4">
                        <div>
                          <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-2">
                            <Target className="w-3.5 h-3.5" /> BUYING SIGNALS
                          </div>
                          <div className="flex flex-wrap gap-1.5">
                            {(row.buyingSignals || []).map((s, j) => (
                              <span key={j} className="text-[11px] px-2 py-1 rounded-full bg-teal-50 text-teal-700 border border-teal-200">{s}</span>
                            ))}
                          </div>
                        </div>
                        <div>
                          <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
                            <span>COLD EMAIL</span>
                            <button onClick={() => copyEmail(row.coldEmail)} className="text-teal-600 hover:underline inline-flex items-center gap-1">
                              <Copy className="w-3 h-3" /> Copy
                            </button>
                          </div>
                          <div className="whitespace-pre-wrap text-xs text-slate-800 rounded-lg bg-slate-50 border border-slate-200 p-3 max-h-56 overflow-y-auto">{row.coldEmail}</div>
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
