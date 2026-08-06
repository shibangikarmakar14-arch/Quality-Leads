// Lightweight parser: turn a natural language sales query into PDL Elasticsearch filters.
// Kept as pure JS so we don't spend LLM credits parsing every query.
// Handles patterns like:
//   "Procurement Manager at Chubb"
//   "VP Talent Acquisition at staffing firms"
//   "Claims Directors at P&C carriers in New York"
//   "Head of Recruiting at Aerotek"

const SENIORITY_LEVELS = {
  "cxo": ["cxo"], "chief": ["cxo"], "c-level": ["cxo"],
  "vp": ["vp"], "vice president": ["vp"], "svp": ["vp"], "evp": ["vp"],
  "director": ["director"], "head": ["director"], "head of": ["director"],
  "manager": ["manager"], "lead": ["manager"],
  "senior": ["senior"], "sr": ["senior"],
  "founder": ["owner"], "co-founder": ["owner"], "ceo": ["cxo", "owner"],
  "president": ["cxo"]
};

const INDUSTRY_KEYWORDS = {
  "insurance": "insurance",
  "p&c": "insurance", "pnc": "insurance",
  "carrier": "insurance", "carriers": "insurance",
  "mga": "insurance", "reinsurance": "insurance",
  "staffing": "staffing and recruiting",
  "recruiting": "staffing and recruiting",
  "recruitment": "staffing and recruiting",
  "rpo": "staffing and recruiting",
  "healthcare": "hospital & health care",
  "fintech": "financial services",
  "finance": "financial services",
  "tech": "computer software", "saas": "computer software"
};

const ROLE_MAP = {
  "procurement": "operations",
  "sourcing": "operations",
  "underwriting": "finance",
  "underwriter": "finance",
  "claims": "operations",
  "talent": "human_resources",
  "recruiting": "human_resources",
  "recruitment": "human_resources",
  "hr": "human_resources",
  "people": "human_resources",
  "sales": "sales",
  "revenue": "sales",
  "marketing": "marketing",
  "engineering": "engineering",
  "product": "design",
  "operations": "operations",
  "finance": "finance"
};

export function parseQuery(rawQuery) {
  const q = (rawQuery || "").trim();
  if (!q) return { filters: {}, humanized: "", raw: q };

  const lower = q.toLowerCase();

  // Split "X at Y" -> title, companyOrIndustry
  let titlePart = lower;
  let afterAt = "";
  const atMatch = lower.match(/^(.+?)\s+(?:at|@)\s+(.+)$/);
  if (atMatch) {
    titlePart = atMatch[1].trim();
    afterAt = atMatch[2].trim();
  }

  const filters = {};
  const humanizedParts = [];

  // Seniority levels
  const foundLevels = new Set();
  for (const [word, levels] of Object.entries(SENIORITY_LEVELS)) {
    const re = new RegExp(`\\b${word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "i");
    if (re.test(titlePart)) levels.forEach(l => foundLevels.add(l));
  }
  if (foundLevels.size > 0) {
    filters.job_title_levels = Array.from(foundLevels);
    humanizedParts.push(`seniority=${Array.from(foundLevels).join("/")}`);
  }

  // Role
  for (const [kw, role] of Object.entries(ROLE_MAP)) {
    if (titlePart.includes(kw)) {
      filters.job_title_role = role;
      humanizedParts.push(`role=${role}`);
      break;
    }
  }

  // Extract industry / company from after-at portion
  let companyName = null;
  let industry = null;
  if (afterAt) {
    // check for industry keyword
    for (const [kw, ind] of Object.entries(INDUSTRY_KEYWORDS)) {
      if (afterAt.includes(kw)) {
        industry = ind;
        break;
      }
    }
    // If the after-at isn't purely an industry description (e.g., "chubb", "travelers"), treat as company
    const looksLikeIndustryPhrase = /\b(carriers?|firms?|agencies|companies|industry|sector|providers?)\b/i.test(afterAt);
    if (!looksLikeIndustryPhrase && !industry) {
      // Might be a company name — clean up trailing words
      companyName = afterAt.replace(/\b(insurance|staffing|agency|firm|company|corp|inc|llc|group)\b/gi, "").trim();
      companyName = companyName.replace(/\s+/g, " ").trim();
      if (companyName.length < 2) companyName = null;
    }
  }

  // Also scan the raw query for known industry keywords
  if (!industry) {
    for (const [kw, ind] of Object.entries(INDUSTRY_KEYWORDS)) {
      const re = new RegExp(`\\b${kw.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "i");
      if (re.test(lower)) { industry = ind; break; }
    }
  }

  if (companyName) {
    filters.job_company_name = companyName;
    humanizedParts.push(`company=${companyName}`);
  }
  if (industry) {
    filters.job_company_industry = industry;
    humanizedParts.push(`industry=${industry}`);
  }

  // Free-text keywords (title minus seniority/role words) as a job_title match
  const titleKeywords = titlePart
    .replace(/\b(vp|vice president|svp|evp|director|head of|head|manager|lead|senior|sr|chief|c-level|founder|co-founder|ceo|president|of)\b/gi, "")
    .trim();
  
  // HEURISTIC: If the query is a single capitalized word with no "at" and no role/seniority keywords,
  // it's likely a company name (e.g., "Chubb", "Google", "Travelers"), not a job title.
  // Treat it as a company search instead of a title search.
  const isSingleWord = titleKeywords.split(/\s+/).length === 1;
  const hasNoAtKeyword = !afterAt;
  const hasNoRoleOrSeniority = foundLevels.size === 0 && !filters.job_title_role;
  
  if (isSingleWord && hasNoAtKeyword && hasNoRoleOrSeniority && titleKeywords.length >= 3) {
    // Likely a company name - use it as company filter instead of title
    filters.job_company_name = titleKeywords;
    humanizedParts.push(`company=${titleKeywords}`);
  } else if (titleKeywords && titleKeywords.length >= 3) {
    // Multi-word or has role/seniority context - treat as job title
    filters.job_title = titleKeywords;
    humanizedParts.push(`title~="${titleKeywords}"`);
  }

  return { filters, humanized: humanizedParts.join(", "), raw: q };
}

// Build a PDL Elasticsearch bool query — favor RECALL over precision.
// PDL only spends credits per result returned, so over-fetching is safe;
// we can filter/rank client-side. Rule of thumb: max 2 must clauses, else 0 results.
export function buildPdlEsQuery(filters, size = 10) {
  const must = [];

  // Rank filters by strength: company > industry > title
  if (filters.job_company_name) {
    must.push({ match: { job_company_name: filters.job_company_name } });
    // If title given, also filter by title
    if (filters.job_title) {
      must.push({ match: { job_title: filters.job_title } });
    }
  } else if (filters.job_company_industry) {
    must.push({ match: { job_company_industry: filters.job_company_industry } });
    if (filters.job_title) {
      must.push({ match: { job_title: filters.job_title } });
    } else if (filters.job_title_role) {
      must.push({ term: { job_title_role: filters.job_title_role } });
    }
  } else if (filters.job_title) {
    must.push({ match: { job_title: filters.job_title } });
    if (filters.job_title_role) {
      must.push({ term: { job_title_role: filters.job_title_role } });
    }
  } else if (filters.job_title_role) {
    must.push({ term: { job_title_role: filters.job_title_role } });
  }

  if (must.length === 0) return { query: { match_all: {} }, size };
  return { query: { bool: { must } }, size };
}
