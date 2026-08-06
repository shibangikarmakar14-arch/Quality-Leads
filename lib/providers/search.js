// Generic provider interface: the rest of the app only imports from HERE.
// Swap providers by changing what this file re-exports — no other files need changes.

import { searchProspects as pdlSearchProspects, getQuotaSnapshot as pdlGetQuota } from "./pdl";

/**
 * searchProspects({ query, size, filters? })
 *  → { results: Lead[], provider, quota, totalMatches?, parsedFilters?, error? }
 *
 * Each Lead has: { id, source, verified, name, title, company, industry, linkedinUrl,
 *                  initials, seniority, department, companyWebsite, companySize,
 *                  email:null, phone:null, location:null, companyDetails }
 */
export const searchProspects = pdlSearchProspects;

/** Live quota snapshot from most recent provider call. */
export const getQuotaSnapshot = pdlGetQuota;
