"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip, Area, AreaChart } from "recharts";

export default function AnalyticsPage() {
  const [data, setData] = useState(null);
  useEffect(() => { fetch("/api/analytics").then(r => r.json()).then(setData); }, []);
  if (!data) return <div className="p-8 text-slate-500">Loading…</div>;

  const { stats, pipelineChart } = data;
  const cards = [
    { label: "Pipeline Value", value: `$${(stats.pipelineValue/1000).toFixed(0)}K` },
    { label: "Reply Rate", value: `${stats.replyRate}%` },
    { label: "Open Rate", value: `${stats.openRate}%` },
    { label: "Saved Leads", value: stats.savedLeads },
    { label: "AI Conversations", value: stats.aiConversations },
    { label: "Outreach Generated", value: stats.outreachGenerated }
  ];

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <h1 className="text-3xl font-semibold tracking-tight mb-6">Analytics</h1>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
        {cards.map(c => (
          <Card key={c.label} className="bg-white border-slate-200 rounded-xl">
            <CardContent className="p-5">
              <div className="text-sm text-slate-500">{c.label}</div>
              <div className="text-2xl font-semibold mt-1">{c.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>
      <Card className="bg-white border-slate-200 rounded-xl">
        <CardContent className="p-6">
          <div className="font-medium mb-4">Pipeline (last 7 days)</div>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={pipelineChart}>
              <defs>
                <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#14b8a6" stopOpacity={0.4}/>
                  <stop offset="100%" stopColor="#14b8a6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} />
              <YAxis stroke="#94a3b8" fontSize={12} />
              <Tooltip contentStyle={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: 8 }} />
              <Area type="monotone" dataKey="value" stroke="#14b8a6" strokeWidth={2} fill="url(#g1)" />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
