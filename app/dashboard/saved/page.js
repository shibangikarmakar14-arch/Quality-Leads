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
      <p className="text-white/50 mb-6">Your bookmarked prospects.</p>

      {saved.length === 0 ? (
        <Card className="bg-white/[0.02] border-white/10 rounded-xl">
          <CardContent className="p-12 text-center text-white/50">
            <Bookmark className="w-8 h-8 mx-auto mb-3 text-white/30" />
            No saved leads yet. Save leads from the dashboard.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {saved.map(s => (
            <Card key={s.leadId} className="bg-white/[0.02] border-white/10 rounded-xl">
              <CardContent className="p-5 flex items-center gap-4">
                <img src={s.snapshot?.avatar} alt="" className="h-11 w-11 rounded-full object-cover ring-2 ring-white/10" />
                <div className="flex-1">
                  <div className="font-medium">{s.snapshot?.name}</div>
                  <div className="text-sm text-white/60">{s.snapshot?.title} • {s.snapshot?.company}</div>
                </div>
                <Link href={`/dashboard/lead/${s.leadId}`}>
                  <Button size="sm" className="bg-white text-black hover:bg-white/90">Open <ArrowUpRight className="w-3.5 h-3.5 ml-1" /></Button>
                </Link>
                <Button size="sm" variant="outline" onClick={() => remove(s.leadId)}
                  className="border-white/10 bg-white/[0.02] text-white hover:bg-rose-500/10 hover:text-rose-400">
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
