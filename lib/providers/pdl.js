// People Data Labs Person Search (v5) provider.
// FREE TIER: returns identity fields only — skips email/phone (boolean flags only on free).
//
// This module is intentionally the ONLY place that knows about PDL. Swap it for any
// other provider (Apollo, Coresignal, etc.) later without touching /api/leads or the UI.

import { buildPdlEsQuery, parseQuery } from "./query-parser";

const PDL_URL = "https://api.peopledatalabs.com/v5/person/search";
const PDL_KEY = process.env.PDL_API_KEY;

// Fields to request from PDL. Restricted to what free-tier returns as REAL values.
// (location_name, emails, phone_numbers are boolean flags on free — we do NOT request them.)
const REAL_FIELDS = [
  "id",
  "full_name",
  "first_name",
  "last_name",
  "job_title",
  "job_title_role",
  "job_title_levels",
  "job_company_name",
  "job_company_industry",
  "job_company_website",
  "job_company_size",
  "linkedin_url",
  "linkedin_id",
  "industry"
];

// Cache credit / rate limit info from the last response so /api/leads can surface it.
let lastQuota = {
  monthlyRemaining: null,
  monthlyLimit: null,
  minuteRemaining: null,
  minuteLimit: null,
  lastCallCreditsSpent: 0,
  resetAt: null,
  updatedAt: null
};

export function getQuotaSnapshot() {
  return { ...lastQuota };
}

function updateQuotaFromHeaders(res) {
  const h = res.headers;
  const parseJson = (v) => { try { return JSON.parse(v); } catch { return null; } };

  const totalRem = h.get("x-totallimit-remaining");
  const totalMax = h.get("x-totallimit-purchased-remaining");
  const spent = h.get("x-call-credits-spent");
  const reset = h.get("x-ratelimit-reset");
  const rlLimit = parseJson(h.get("x-ratelimit-limit") || "null");
  const rlRem = parseJson(h.get("x-ratelimit-remaining") || "null");

  lastQuota = {
    monthlyRemaining: totalRem ? Number(totalRem) : lastQuota.monthlyRemaining,
    monthlyLimit: totalMax ? Number(totalMax) : lastQuota.monthlyLimit,
    minuteRemaining: rlRem?.minute ?? lastQuota.minuteRemaining,
    minuteLimit: rlLimit?.minute ?? lastQuota.minuteLimit,
    lastCallCreditsSpent: spent ? Number(spent) : 0,
    resetAt: reset || lastQuota.resetAt,
    updatedAt: new Date().toISOString()
  };
}

// Normalize PDL person record into our canonical Lead shape (identity only).
// Contact fields are LEFT OUT until enrichment/Pro-tier is added.
function normalizePerson(p, index) {
  const cleanLinkedin = p.linkedin_url
    ? (p.linkedin_url.startsWith("http") ? p.linkedin_url : `https://www.${p.linkedin_url.replace(/^\/*/, "")}`)
    : null;
  const initials = (p.full_name || "?")
    .split(/\s+/).filter(Boolean).slice(0, 2).map(s => s[0]).join("").toUpperCase();
  return {
    id: `pdl_${p.id || p.linkedin_id || `${p.full_name}-${index}`.replace(/\W+/g, "_").toLowerCase()}`,
    source: "pdl",
    verified: true,
    // Displayable fields (all REAL from PDL free tier):
    name: p.full_name ? p.full_name.replace(/\b\w/g, m => m.toUpperCase()) : "Unknown",
    title: p.job_title || "",
    company: p.job_company_name || "",
    industry: p.job_company_industry || p.industry || "",
    linkedinUrl: cleanLinkedin,
    linkedin: cleanLinkedin ? cleanLinkedin.replace(/^https?:\/\//, "").replace(/\/$/, "") : "",
    initials,
    seniority: (p.job_title_levels && p.job_title_levels[0])
      ? p.job_title_levels[0].replace(/\b\w/g, m => m.toUpperCase())
      : "",
    department: p.job_title_role || "",
    companyWebsite: p.job_company_website || "",
    companySize: p.job_company_size || "",
    // Explicitly ABSENT (waiting for enrichment / paid tier):
    email: null,
    phone: null,
    location: null,
    // Kept for legacy AI-context (empty on free tier; enrichment fills later)
    buyingSignals: [],
    recentPosts: [],
    companyDetails: p.job_company_name ? {
      name: p.job_company_name,
      industry: p.job_company_industry || "",
      employees: p.job_company_size || "",
      logo: (p.job_company_name || "?")[0].toUpperCase(),
      website: p.job_company_website || ""
    } : null
  };
}

// Main entry point.
// searchProspects({ query, size, filters? })
// Returns { results, provider: 'pdl', quota, error? }
export async function searchProspects({ query, size = 10, filters: userFilters }) {
  if (!PDL_KEY) return { results: [], provider: "pdl", quota: lastQuota, error: "PDL_API_KEY not configured" };

  const parsed = parseQuery(query || "");
  const filters = { ...parsed.filters, ...(userFilters || {}) };
  // Request 3x the desired size to account for filtering out low-quality records
  // (PDL free tier sometimes returns profiles with missing/incorrect job titles)
  const pdlSize = Math.min(size * 3, 30);
  const body = buildPdlEsQuery(filters, pdlSize);

  let res;
  try {
    res = await fetch(PDL_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-API-Key": PDL_KEY
      },
      body: JSON.stringify(body)
    });
  } catch (e) {
    return { results: [], provider: "pdl", quota: lastQuota, error: `PDL fetch error: ${e.message}` };
  }

  updateQuotaFromHeaders(res);

  let data;
  try { data = await res.json(); } catch { data = null; }

  if (res.status === 429) {
    return { results: [], provider: "pdl", quota: lastQuota, error: "Rate limited (10/min). Please wait a minute and try again.", parsedFilters: parsed };
  }
  if (res.status === 402) {
    // 402 can mean quota exhausted OR an endpoint/field the free tier can't access.
    // Surface the ACTUAL PDL message plus the live quota so the UI can show truth.
    const pdlMsg = data?.error?.message || data?.message || "";
    const remaining = lastQuota.monthlyRemaining;
    const looksLikeQuotaExhausted = /credit|quota|limit|exhaust|exceed/i.test(pdlMsg) && (remaining === 0 || remaining === null);
    return {
      results: [], provider: "pdl", quota: lastQuota,
      error: looksLikeQuotaExhausted
        ? `Monthly PDL credit limit reached (${remaining ?? 0} left). Wait for reset or upgrade.`
        : `PDL rejected the query: ${pdlMsg || "402 Payment Required (query may use a restricted field on the free tier)"}. You still have ${remaining ?? "?"} credits.`,
      parsedFilters: parsed
    };
  }
  if (res.status === 404) {
    return { results: [], provider: "pdl", quota: lastQuota, parsedFilters: parsed, noMatch: true };
  }
  if (!res.ok) {
    const pdlMsg = data?.error?.message || data?.message;
    return { results: [], provider: "pdl", quota: lastQuota, error: pdlMsg || `PDL error ${res.status}`, parsedFilters: parsed };
  }

  const records = data?.data || [];
  // Filter: only keep records with a real LinkedIn URL (since "View on LinkedIn" is our primary CTA)
  // AND a valid job title (not empty, not just the company name)
  const filtered = records.map(normalizePerson).filter(r => {
    if (!r.linkedinUrl) return false;
    if (!r.title || r.title.trim() === "") return false;
    // Exclude if title is just the company name (PDL data quality issue)
    if (r.title.toLowerCase() === r.company.toLowerCase()) return false;
    return true;
  });
  
  // Return up to the requested size
  const results = filtered.slice(0, size);

  return {
    results,
    provider: "pdl",
    quota: lastQuota,
    totalMatches: data?.total || 0,
    parsedFilters: parsed
  };
}

export const REQUESTED_FIELDS = REAL_FIELDS;
