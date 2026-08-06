"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash2, ArrowUpRight, Bookmark } from "lucide-react";
import { toast } from "sonner";

export default function SavedPage() {
  const [saved, setSaved] = useState([]);

  useEffect(() => { load(); }, []);
  async function load() {
    const r = await fetch("/api/saved");
    const d = await r.json();
    setSaved(d.saved || []);
  }

  async function remove(leadId) {
    await fetch(`/api/saved/${leadId}`, { method: "DELETE" });
    toast.success("Removed");
    load();
  }

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <h1 className="text-3xl font-semibold tracking-tight mb-1">Saved Leads</h1>
      <p className="text-slate-500 mb-6">Your bookmarked prospects.</p>

      {saved.length === 0 ? (
        <Card className="bg-white border-slate-200 rounded-xl">
          <CardContent className="p-12 text-center text-slate-500">
            <Bookmark className="w-8 h-8 mx-auto mb-3 text-slate-300" />
            No saved leads yet. Save leads from the dashboard.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {saved.map(s => (
            <Card key={s.leadId} className="bg-white border-slate-200 rounded-xl">
              <CardContent className="p-5 flex items-center gap-4">
                <img src={s.snapshot?.avatar} alt="" className="h-11 w-11 rounded-full object-cover ring-2 ring-slate-200" />
                <div className="flex-1">
                  <div className="font-medium">{s.snapshot?.name}</div>
                  <div className="text-sm text-slate-600">{s.snapshot?.title} • {s.snapshot?.company}</div>
                </div>
                <Link href={`/dashboard/lead/${s.leadId}`}>
                  <Button size="sm" className="bg-teal-500 text-slate-900 hover:bg-teal-600 shadow-sm">Open <ArrowUpRight className="w-3.5 h-3.5 ml-1" /></Button>
                </Link>
                <Button size="sm" variant="outline" onClick={() => remove(s.leadId)}
                  className="border-slate-200 bg-white text-slate-900 hover:bg-rose-50 hover:text-rose-600">
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
