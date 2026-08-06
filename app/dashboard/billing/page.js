"use client";

import Link from "next/link";
import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Check, CreditCard, Sparkles, ShieldCheck, ArrowLeft, Users, Zap
} from "lucide-react";
import { toast } from "sonner";

const PLANS = [
  {
    id: "free", name: "Free", price: 0, priceLabel: "$0", period: "forever",
    features: ["50 prospect searches / mo", "AI Assistant (limited)", "1 workspace", "Basic outreach templates"],
    cta: "Current plan"
  },
  {
    id: "pro", name: "Pro", price: 49, priceLabel: "$49", period: "/mo", highlighted: true,
    features: ["Unlimited prospect searches", "Full AI Assistant", "Bulk outreach generator", "CRM pipeline", "Intent triggers", "Priority email support"],
    cta: "Upgrade to Pro"
  },
  {
    id: "team", name: "Team", price: 149, priceLabel: "$149", period: "/mo",
    features: ["Everything in Pro", "5 seats included", "Team analytics", "Shared prompt library", "CSV bulk import", "Slack support channel"],
    cta: "Upgrade to Team"
  },
  {
    id: "enterprise", name: "Enterprise", price: null, priceLabel: "Custom", period: "",
    features: ["Everything in Team", "SSO / SAML", "Salesforce / HubSpot sync", "Custom intent triggers", "Dedicated CSM", "Annual billing"],
    cta: "Book a demo"
  }
];

export default function BillingPage() {
  const [currentPlan, setCurrentPlan] = useState("free");
  const [processing, setProcessing] = useState(null);
  const [billingCycle, setBillingCycle] = useState("monthly"); // monthly | annual

  async function handleUpgrade(planId) {
    if (planId === "enterprise") {
      window.location.href = "mailto:sales@qualityleads.ai?subject=Enterprise%20plan%20inquiry";
      return;
    }
    if (planId === currentPlan) return;
    if (planId === "free") {
      // downgrade
      if (!confirm("Downgrade to Free? You'll lose Pro features at the end of your billing cycle.")) return;
      setCurrentPlan("free");
      toast.success("Scheduled downgrade to Free at cycle end.");
      return;
    }
    setProcessing(planId);
    // Razorpay checkout will be wired up once API keys are provided.
    // Placeholder UI — shows what the flow will look like.
    toast.info("Razorpay checkout will launch here once payment integration is live.", {
      description: "Waiting on merchant account approval."
    });
    setTimeout(() => setProcessing(null), 1500);
  }

  async function handleCancel() {
    if (!confirm("Cancel your subscription? You'll keep access until the end of the current billing cycle.")) return;
    toast.success("Subscription set to cancel at cycle end.");
    setCurrentPlan("free");
  }

  const displayPrice = (p) => {
    if (p.price === null) return p.priceLabel;
    if (billingCycle === "annual" && p.price > 0) {
      const annual = Math.round(p.price * 12 * 0.8);
      return `$${Math.round(annual / 12)}`;
    }
    return p.priceLabel;
  };

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <Link href="/dashboard" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-900 mb-4">
        <ArrowLeft className="w-4 h-4" /> Back
      </Link>

      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Billing & Plans</h1>
          <p className="text-slate-500 mt-1">Upgrade, downgrade, or cancel anytime. No surprise fees.</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="inline-flex bg-slate-100 rounded-lg p-1 border border-slate-200">
            {[["monthly","Monthly"],["annual","Annual – save 20%"]].map(([id, label]) => (
              <button key={id} onClick={() => setBillingCycle(id)}
                className={`px-3 py-1.5 text-xs rounded-md font-medium transition ${billingCycle===id?"bg-white text-slate-900 shadow-sm":"text-slate-500 hover:text-slate-700"}`}>
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Current plan status */}
      <Card className="bg-gradient-to-br from-teal-50 to-white border-teal-200 rounded-xl mb-8">
        <CardContent className="p-6 flex items-center gap-5">
          <div className="h-12 w-12 rounded-xl bg-white border border-teal-200 grid place-items-center shadow-sm">
            <CreditCard className="w-5 h-5 text-teal-600" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="font-medium text-slate-900">You're on the {PLANS.find(p => p.id === currentPlan)?.name} plan</span>
              <Badge className="bg-teal-500 text-white border-0 hover:bg-teal-500">Active</Badge>
            </div>
            <div className="text-sm text-slate-600 mt-0.5">
              {currentPlan === "free" ? "No billing. Upgrade to unlock unlimited searches and premium features." : "Next billing on 15 Jul 2025 • Visa ending 4242"}
            </div>
          </div>
          {currentPlan !== "free" && (
            <Button variant="outline" onClick={handleCancel} className="border-slate-200 hover:bg-slate-50">
              Cancel plan
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Plans */}
      <div className="grid md:grid-cols-4 gap-4">
        {PLANS.map(p => (
          <motion.div key={p.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
            <Card className={`${p.highlighted ? "bg-gradient-to-b from-teal-50 to-white border-teal-300 shadow-md shadow-teal-500/10" : "bg-white border-slate-200"} rounded-xl relative h-full`}>
              {p.highlighted && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 text-xs px-3 py-1 rounded-full bg-teal-500 text-white font-medium shadow">Most popular</div>
              )}
              <CardContent className="p-6 flex flex-col h-full">
                <div className="font-medium text-lg text-slate-900">{p.name}</div>
                <div className="mt-4 flex items-baseline gap-1">
                  <span className="text-4xl font-semibold tracking-tight text-slate-900">{displayPrice(p)}</span>
                  <span className="text-slate-500 text-sm">{p.period}</span>
                </div>
                {billingCycle === "annual" && p.price > 0 && (
                  <div className="text-xs text-teal-600 mt-1">Billed annually — save 20%</div>
                )}
                <div className="mt-6 space-y-2.5 flex-1">
                  {p.features.map(f => (
                    <div key={f} className="flex items-start gap-2 text-sm text-slate-700">
                      <Check className="w-4 h-4 mt-0.5 text-teal-500 shrink-0" /> {f}
                    </div>
                  ))}
                </div>
                <Button
                  disabled={p.id === currentPlan || processing === p.id}
                  onClick={() => handleUpgrade(p.id)}
                  className={`w-full mt-6 rounded-lg ${
                    p.id === currentPlan
                      ? "bg-slate-100 text-slate-500 hover:bg-slate-100 cursor-not-allowed"
                      : p.highlighted
                        ? "bg-teal-500 hover:bg-teal-600 text-white shadow-sm"
                        : "bg-slate-900 hover:bg-slate-800 text-white"
                  }`}>
                  {processing === p.id ? "Processing..." : p.id === currentPlan ? "Current plan" : p.cta}
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Payment info */}
      <div className="mt-10 grid md:grid-cols-3 gap-4">
        <Card className="bg-white border-slate-200 rounded-xl">
          <CardContent className="p-5">
            <ShieldCheck className="w-5 h-5 text-teal-600 mb-2" />
            <div className="font-medium text-slate-900">Secure payments</div>
            <div className="text-sm text-slate-600 mt-1">All payments are processed by Razorpay with PCI-DSS Level 1 security. We never store your card.</div>
          </CardContent>
        </Card>
        <Card className="bg-white border-slate-200 rounded-xl">
          <CardContent className="p-5">
            <Zap className="w-5 h-5 text-teal-600 mb-2" />
            <div className="font-medium text-slate-900">Cancel anytime</div>
            <div className="text-sm text-slate-600 mt-1">One-click cancellation. Access continues until the end of your billing cycle.</div>
          </CardContent>
        </Card>
        <Card className="bg-white border-slate-200 rounded-xl">
          <CardContent className="p-5">
            <Users className="w-5 h-5 text-teal-600 mb-2" />
            <div className="font-medium text-slate-900">Need more seats?</div>
            <div className="text-sm text-slate-600 mt-1">Team plan includes 5 seats. Contact sales for larger teams or SSO.</div>
          </CardContent>
        </Card>
      </div>

      <div className="mt-6 text-xs text-slate-500">
        By subscribing you agree to our <Link href="/terms" className="underline hover:text-slate-700">Terms of Service</Link>, {" "}
        <Link href="/privacy" className="underline hover:text-slate-700">Privacy Policy</Link> and {" "}
        <Link href="/refund" className="underline hover:text-slate-700">Refund Policy</Link>. Prices in USD.
      </div>
    </div>
  );
}
