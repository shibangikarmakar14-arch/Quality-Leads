"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LEAD_LOOKUP } from "@/lib/lead-lookup";
import { motion } from "framer-motion";

const STAGES = [
  { key: "new", label: "New", color: "from-slate-500/20 to-slate-500/5" },
  { key: "contacted", label: "Contacted", color: "from-blue-500/20 to-blue-500/5" },
  { key: "discovery", label: "Discovery", color: "from-indigo-500/20 to-indigo-500/5" },
  { key: "proposal", label: "Proposal", color: "from-purple-500/20 to-purple-500/5" },
  { key: "negotiation", label: "Negotiation", color: "from-amber-500/20 to-amber-500/5" },
  { key: "won", label: "Won", color: "from-emerald-500/20 to-emerald-500/5" },
  { key: "lost", label: "Lost", color: "from-rose-500/20 to-rose-500/5" }
];

export default function CRMPage() {
  const [stages, setStages] = useState({});
  const [dragged, setDragged] = useState(null);
  const [leadMap, setLeadMap] = useState({});

  useEffect(() => {
    fetch("/api/crm").then(r => r.json()).then(d => setStages(d.stages || {}));
    fetch("/api/leads").then(r => r.json()).then(d => {
      const map = {};
      (d.results || []).forEach(l => { map[l.id] = l; });
      setLeadMap(map);
    });
  }, []);

  async function move(from, to, deal) {
    if (from === to) return;
    setStages(prev => {
      const next = { ...prev };
      next[from] = (next[from] || []).filter(d => d.id !== deal.id);
      next[to] = [...(next[to] || []), deal];
      return next;
    });
    await fetch("/api/crm/move", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ deal, from, to })
    });
  }

  const total = Object.values(stages).flat().reduce((s, d) => s + (d.value || 0), 0);

  return (
    <div className="p-8 max-w-[1600px] mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Pipeline</h1>
          <p className="text-white/50 mt-1">Drag deals across stages to update your CRM.</p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-semibold">${(total / 1000).toFixed(0)}K</div>
          <div className="text-xs text-white/50">Total pipeline value</div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3 min-h-[70vh]">
        {STAGES.map(stage => {
          const deals = stages[stage.key] || [];
          const stageValue = deals.reduce((s, d) => s + (d.value || 0), 0);
          return (
            <div key={stage.key}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => { if (dragged) { move(dragged.from, stage.key, dragged.deal); setDragged(null); } }}
              className={`rounded-xl bg-gradient-to-b ${stage.color} border border-white/10 p-3 flex flex-col`}>
              <div className="flex items-center justify-between mb-3 px-1">
                <div className="font-medium text-sm">{stage.label}</div>
                <Badge className="bg-white/5 border border-white/10 text-white/70 text-[10px]">{deals.length}</Badge>
              </div>
              <div className="text-[11px] text-white/50 px-1 mb-3">${(stageValue / 1000).toFixed(0)}K</div>
              <div className="space-y-2 flex-1">
                {deals.map(d => {
                  const lead = leadMap[d.leadId];
                  if (!lead) return null;
                  return (
                    <motion.div key={d.id} layout
                      draggable
                      onDragStart={() => setDragged({ from: stage.key, deal: d })}
                      className="cursor-grab active:cursor-grabbing">
                      <Card className="bg-white/[0.04] border-white/10 rounded-lg hover:bg-white/[0.06] transition">
                        <CardContent className="p-3">
                          <div className="flex items-center gap-2">
                            <img src={lead.avatar} alt={lead.name} className="h-7 w-7 rounded-full object-cover ring-1 ring-white/10" />
                            <div className="min-w-0 flex-1">
                              <div className="text-xs font-medium truncate">{lead.name}</div>
                              <div className="text-[10px] text-white/50 truncate">{lead.company}</div>
                            </div>
                          </div>
                          {d.note && <div className="text-[11px] text-white/60 mt-2 line-clamp-2">{d.note}</div>}
                          <div className="flex items-center justify-between mt-2">
                            <span className="text-[10px] text-emerald-400">${(d.value / 1000).toFixed(0)}K</span>
                            <Link href={`/dashboard/lead/${d.leadId}`} className="text-[10px] text-indigo-300 hover:underline">Open</Link>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
