// Emergent Universal LLM Key client — uses Emergent's LLM proxy (OpenAI-compatible)
// Falls back to direct Anthropic API if EMERGENT_LLM_KEY is a real Anthropic key.

const EMERGENT_KEY = process.env.EMERGENT_LLM_KEY;
const EMERGENT_URL = "https://integrations.emergentagent.com/llm/chat/completions";
const MODEL = "claude-sonnet-4-5-20250929";

export async function chatCompletion({ system, messages, maxTokens = 900, temperature = 0.7 }) {
  if (!EMERGENT_KEY) throw new Error("Missing EMERGENT_LLM_KEY");

  const body = {
    model: MODEL,
    messages: [
      ...(system ? [{ role: "system", content: system }] : []),
      ...messages
    ],
    max_tokens: maxTokens,
    temperature
  };

  const res = await fetch(EMERGENT_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${EMERGENT_KEY}`
    },
    body: JSON.stringify(body)
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`LLM error ${res.status}: ${errText.slice(0, 500)}`);
  }

  const data = await res.json();
  const content =
    data?.choices?.[0]?.message?.content ??
    data?.content?.[0]?.text ??
    "";
  return content.trim();
}

export function buildLeadContext(lead) {
  if (!lead) return "";
  const c = lead.companyDetails || {};
  return `LEAD PROFILE
Name: ${lead.name}
Title: ${lead.title}
Company: ${lead.company} (${lead.industry})
Location: ${lead.location}
Seniority: ${lead.seniority} | Department: ${lead.department}
LinkedIn: ${lead.linkedin}
Email: ${lead.email}

Recent posts:
${(lead.recentPosts || []).map(p => "- " + p).join("\n")}

Buying signals:
${(lead.buyingSignals || []).map(s => "- " + s).join("\n")}

Career:
${(lead.experience || []).map(e => `- ${e.role} at ${e.company} (${e.years})`).join("\n")}

Skills: ${(lead.skills || []).join(", ")}

COMPANY OVERVIEW
${c.name || ""} — ${c.employees || ""} employees, ${c.revenue || ""}, ${c.funding || ""}
Growth: ${c.growth || ""}
Tech stack: ${(c.techStack || []).join(", ")}
Recent news:
${(c.news || []).map(n => "- " + n).join("\n")}
Competitors: ${(c.competitors || []).join(", ")}
Pain points:
${(c.painPoints || []).map(p => "- " + p).join("\n")}
`;
}
