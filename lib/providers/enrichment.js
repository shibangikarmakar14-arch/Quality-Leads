// Contact enrichment (email, phone) — SEPARATED from search on purpose.
// PDL free tier ONLY returns boolean flags for emails/phones, so this is a stub today.
// When you upgrade PDL to Pro, OR plug in a different provider (Hunter, Snov, Apollo),
// implement the two functions below — the rest of the app already calls them.

/**
 * Fetch REAL email + phone for a given prospect.
 * @param {{ linkedinUrl?: string, name?: string, company?: string, pdlPersonId?: string }} lead
 * @returns {Promise<{ email: string|null, phone: string|null, provider: string }>}
 */
export async function fetchContactInfo(lead) {
  // TODO: implement once user upgrades PDL plan or wires an alternative provider.
  return { email: null, phone: null, provider: "none" };
}

/**
 * Enrich a list of leads in bulk (batched).
 * @param {Array} leads
 * @returns {Promise<Array>} same leads with .email/.phone populated where available
 */
export async function bulkEnrichContacts(leads) {
  // TODO: batch enrichment on paid tier.
  return leads;
}

export const ENRICHMENT_AVAILABLE = false; // flip to true when paid tier is wired up
