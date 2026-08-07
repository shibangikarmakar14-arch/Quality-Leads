"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function LegalShell({ title, updated, children }) {
  return (
    <div className="min-h-screen bg-white text-slate-900">
      {/* Nav */}
      <nav className="sticky top-0 z-50 backdrop-blur-xl bg-white/80 border-b border-slate-200">
        <div className="max-w-7xl mx-auto flex items-center justify-between h-16 px-6">
          <Link href="/" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-teal-400 to-cyan-500 grid place-items-center font-bold text-white shadow-sm">Q</div>
            <span className="font-semibold tracking-tight">Quality Leads</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/" className="text-sm text-slate-600 hover:text-slate-900 inline-flex items-center gap-1.5">
              <ArrowLeft className="w-3.5 h-3.5" /> Back to home
            </Link>
          </div>
        </div>
      </nav>

      {/* Content */}
      <article className="max-w-3xl mx-auto px-6 py-16">
        <header className="mb-10">
          <h1 className="text-4xl md:text-5xl font-semibold tracking-tight text-slate-900">{title}</h1>
          <p className="mt-3 text-sm text-slate-500">Last updated: {updated}</p>
        </header>

        <div className="legal-content space-y-8 text-slate-700 leading-relaxed">
          {children}
        </div>

        <div className="mt-16 pt-8 border-t border-slate-200 flex flex-wrap gap-6 text-sm">
          <Link href="/terms" className="text-slate-600 hover:text-teal-700">Terms of Service</Link>
          <Link href="/privacy" className="text-slate-600 hover:text-teal-700">Privacy Policy</Link>
          <Link href="/refund" className="text-slate-600 hover:text-teal-700">Refund Policy</Link>
          <a href="mailto:shibangikarmakar14@gmail.com" className="text-slate-600 hover:text-teal-700 ml-auto">shibangikarmakar14@gmail.com</a>
        </div>
      </article>

      <footer className="py-10 px-6 border-t border-slate-200">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-slate-500">
          <div>© 2026 Quality Leads. Operated by Shibangi Karmakar.</div>
          <nav className="flex flex-wrap gap-x-6 gap-y-2">
            <Link href="/terms" className="hover:text-slate-900">Terms</Link>
            <Link href="/privacy" className="hover:text-slate-900">Privacy</Link>
            <Link href="/refund" className="hover:text-slate-900">Refund Policy</Link>
            <a href="mailto:shibangikarmakar14@gmail.com" className="hover:text-slate-900">Support</a>
          </nav>
        </div>
      </footer>
    </div>
  );
}

// Reusable typography helpers
export function LegalSection({ number, title, children }) {
  return (
    <section>
      <h2 className="text-xl font-semibold text-slate-900 tracking-tight">
        {number ? <span className="text-slate-400 mr-2">{number}.</span> : null}{title}
      </h2>
      <div className="mt-3 space-y-3 text-[15px] text-slate-700 leading-7">
        {children}
      </div>
    </section>
  );
}

export function LegalList({ items }) {
  return (
    <ul className="list-disc pl-6 space-y-1.5 text-[15px] text-slate-700 leading-7 marker:text-teal-500">
      {items.map((item, i) => <li key={i}>{item}</li>)}
    </ul>
  );
}
