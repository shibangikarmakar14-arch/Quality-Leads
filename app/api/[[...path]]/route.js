import { NextResponse } from "next/server";
import { MongoClient } from "mongodb";
import { v4 as uuidv4 } from "uuid";
import { LEADS, COMPANIES, searchLeads, getLead } from "@/lib/leads-data";
import { chatCompletion, buildLeadContext } from "@/lib/llm";
import { searchProspects, getQuotaSnapshot } from "@/lib/providers/search";

const MONGO_URL = process.env.MONGO_URL;
const DB_NAME = process.env.DB_NAME || "quality_leads";

let _client = null;
async function db() {
  if (!_client) {
    _client = new MongoClient(MONGO_URL);
    await _client.connect();
  }
  return _client.db(DB_NAME);
}

// Lookup a lead by id. Checks seeded data first, then pdl_leads (verified), then generated_leads in Mongo.
async function fetchLead(id) {
  if (!id) return null;
  const seeded = getLead(id);
  if (seeded) return seeded;
  try {
    const database = await db();
    // Prefer verified PDL results
    if (id.startsWith("pdl_")) {
      const doc = await database.collection("pdl_leads").findOne({ id });
      if (doc) {
        const { _id, _query, cachedAt, ...rest } = doc;
        return rest;
      }
    }
    const doc = await database.collection("generated_leads").findOne({ id });
    if (doc) {
      const { _id, ...rest } = doc;
      return rest;
    }
  } catch (e) { /* ignore */ }
  return null;
}

// Generate a batch of realistic leads matching a search query via Claude.
async function generateLeadsForQuery(query) {
  const system = `You are a B2B sales data generator specializing in the P&C insurance and staffing industries. Given a sales search query, produce 6 realistic-sounding FICTIONAL prospect profiles that match the query. Fictional but plausible names, companies, titles, and details.

If the query mentions a real major carrier (Chubb, Travelers, Liberty Mutual, Progressive, Nationwide, AIG, Allstate, State Farm, The Hartford, Zurich) or a real staffing firm (Aerotek, TEKsystems, Robert Half, Kforce, Insight Global, Allegis, Randstad, ManpowerGroup, Kelly Services, Adecco), use that real company name literally.

For insurance prospects, intent triggers should reflect: license renewals, claims-tech RFPs, state expansion filings, insurtech funding/partnerships, actuarial or underwriter hiring surges, vendor consolidation initiatives, Guidewire/Duck Creek migrations, reinsurance treaty renewals, regulatory changes.

For staffing prospects, intent triggers should reflect: job posting volume spikes (e.g. "+40% MoM"), new office openings, healthcare/IT/finance vertical pushes, major MSA renewals, recruiter hiring surges, ATS platform migrations (Bullhorn, Salesforce), federal contract wins.

Return ONLY a valid JSON ARRAY of 6 objects, no markdown, no code fences, no preamble. Keep values concise. Each object must exactly match this schema:
{
  "name": "First Last",
  "title": "Full job title (e.g. VP Procurement, Head of Recruiting, Chief Underwriting Officer)",
  "company": "Company Name",
  "location": "City, State/Country",
  "industry": "P&C Insurance | Staffing / Recruiting | IT Staffing | Healthcare Staffing | Professional Staffing | etc",
  "seniority": "C-Level | VP | Director | Head | Manager | Senior | Individual Contributor | Founder",
  "department": "Procurement | Underwriting | Claims | Technology | Talent Acquisition | Recruiting | Sales | Operations | Executive",
  "linkedin": "linkedin.com/in/firstname-lastname",
  "email": "first.last@companydomain.com",
  "experience": [
    { "role": "prior role", "company": "prior insurance/staffing company", "years": "2020 - 2024" },
    { "role": "earlier role", "company": "earlier company", "years": "2015 - 2020" }
  ],
  "education": ["Degree, University", "Industry cert if relevant (CPCU, ARM, SPHR)"],
  "skills": ["4-5 industry-specific skills"],
  "recentPosts": [
    "One short realistic LinkedIn-style post (max 20 words)",
    "Another realistic short post (max 20 words)"
  ],
  "buyingSignals": [
    "3-4 short industry-specific intent triggers (max 10 words each)"
  ],
  "companyDetails": {
    "name": "Company Name",
    "logo": "single uppercase letter",
    "industry": "Industry",
    "employees": "e.g. 5000",
    "revenue": "e.g. $2B or $50B GWP",
    "founded": 2010,
    "hq": "City, State",
    "funding": "e.g. Public NYSE:XYZ / Mutual / Private",
    "growth": "e.g. +9% YoY",
    "techStack": ["Guidewire","Bullhorn","Salesforce","AWS","Snowflake" or similar industry tools"],
    "news": ["3 short industry-relevant news items"],
    "competitors": ["3 real competitors"],
    "painPoints": ["3 short industry-specific pain points"]
  }
}

Do NOT include any "id" field. Keep the entire JSON compact.`;

  const raw = await chatCompletion({
    system,
    messages: [{ role: "user", content: `Search query: ${query}\n\nReturn 6 matching prospects as a compact JSON array.` }],
    maxTokens: 8000,
    temperature: 0.85
  });

  // Strip potential fences
  const cleaned = raw.replace(/^```json\s*/i, "").replace(/^```\s*/, "").replace(/```\s*$/, "").trim();
  let arr;
  try { arr = JSON.parse(cleaned); }
  catch {
    const match = cleaned.match(/\[[\s\S]*\]/);
    if (match) {
      try { arr = JSON.parse(match[0]); }
      catch (e2) {
        // Attempt to salvage: parse individual objects one by one
        const objects = [];
        const objRe = /\{[\s\S]*?\}(?=\s*[,\]])/g;
        let m;
        while ((m = objRe.exec(match[0])) !== null) {
          try { objects.push(JSON.parse(m[0])); } catch {}
        }
        if (objects.length === 0) throw new Error("Invalid JSON from LLM: " + e2.message);
        arr = objects;
      }
    } else throw new Error("Invalid JSON from LLM");
  }
  if (!Array.isArray(arr)) throw new Error("Expected array");

  // Enrich with id + avatar
  return arr.map((l, i) => ({
    ...l,
    id: `gen_${uuidv4()}`,
    avatar: `https://i.pravatar.cc/200?u=${encodeURIComponent(l.name + l.company + Math.random())}`,
    yearsInRole: l.yearsInRole || 2
  }));
}

function json(data, status = 200) {
  return NextResponse.json(data, { status });
}

async function readBody(req) {
  try { return await req.json(); } catch { return {}; }
}

function routeInfo(req) {
  const url = new URL(req.url);
  const parts = url.pathname.replace(/^\/api\/?/, "").split("/").filter(Boolean);
  return { parts, url, searchParams: url.searchParams };
}

export async function GET(req) {
  const { parts, searchParams } = routeInfo(req);
  try {
    // GET /api
    if (parts.length === 0) return json({ ok: true, service: "Quality Leads API" });

    // GET /api/leads?q=...   \u2014 REAL provider (PDL) with local fallback
    if (parts[0] === "leads" && parts.length === 1) {
      const q = (searchParams.get("q") || "").trim();
      const seniority = searchParams.get("seniority") || "";
      const department = searchParams.get("department") || "";
      const filters = {};
      if (seniority) filters.seniority = seniority;
      if (department) filters.department = department;

      // No query \u2192 return seeded (demo) prospects so dashboard isn't empty
      if (!q) {
        const local = searchLeads(q, filters);
        return json({ results: local, count: local.length, source: "seeded", quota: getQuotaSnapshot() });
      }

      // 1) Cache in Mongo
      const database = await db();
      const qKey = q.toLowerCase();
      const cached = await database.collection("pdl_search_cache")
        .findOne({ _query: qKey });
      if (cached && cached.results && Date.now() - new Date(cached.cachedAt).getTime() < 24 * 60 * 60 * 1000) {
        return json({
          results: cached.results,
          count: cached.results.length,
          source: "cached",
          parsedFilters: cached.parsedFilters,
          quota: getQuotaSnapshot()
        });
      }

      // 2) Live PDL search
      const pdlRes = await searchProspects({ query: q, size: 10 });

      if (pdlRes.error) {
        return json({
          results: [], count: 0, source: "error",
          error: pdlRes.error,
          quota: pdlRes.quota
        });
      }

      // Cache the results (even empty) to avoid re-spending credits
      if (pdlRes.results.length > 0) {
        // also store individual leads in a lookup collection so /api/leads/:id works
        const bulkOps = pdlRes.results.map(lead => ({
          updateOne: {
            filter: { id: lead.id },
            update: { $set: { ...lead, _query: qKey, cachedAt: new Date() } },
            upsert: true
          }
        }));
        if (bulkOps.length) await database.collection("pdl_leads").bulkWrite(bulkOps);
      }
      await database.collection("pdl_search_cache").updateOne(
        { _query: qKey },
        { $set: { _query: qKey, results: pdlRes.results, parsedFilters: pdlRes.parsedFilters, cachedAt: new Date() } },
        { upsert: true }
      );

      return json({
        results: pdlRes.results,
        count: pdlRes.results.length,
        source: "pdl",
        totalMatches: pdlRes.totalMatches || 0,
        parsedFilters: pdlRes.parsedFilters,
        quota: pdlRes.quota,
        noMatch: pdlRes.noMatch || false
      });
    }

    // GET /api/quota  \u2014  latest PDL quota snapshot for the sidebar/indicator
    if (parts[0] === "quota" && parts.length === 1) {
      return json({ quota: getQuotaSnapshot() });
    }

    // GET /api/leads/:id
    if (parts[0] === "leads" && parts.length === 2) {
      const lead = await fetchLead(parts[1]);
      if (!lead) return json({ error: "Not found" }, 404);
      return json({ lead });
    }

    // GET /api/companies/:id
    if (parts[0] === "companies" && parts.length === 2) {
      const c = COMPANIES[parts[1]];
      if (!c) return json({ error: "Not found" }, 404);
      return json({ company: c });
    }

    // GET /api/saved
    if (parts[0] === "saved" && parts.length === 1) {
      const database = await db();
      const items = await database.collection("saved_leads").find({}).sort({ savedAt: -1 }).limit(100).toArray();
      return json({ saved: items.map(s => ({ ...s, _id: undefined })) });
    }

    // GET /api/crm — pipeline
    if (parts[0] === "crm" && parts.length === 1) {
      const database = await db();
      let doc = await database.collection("crm").findOne({ _key: "pipeline" });
      if (!doc) {
        // Seed with a couple of sample deals
        doc = {
          _key: "pipeline",
          stages: {
            new: [{ id: uuidv4(), leadId: "lead_002", note: "Warm intro via LinkedIn", value: 25000 }],
            contacted: [{ id: uuidv4(), leadId: "lead_001", note: "Sent cold email", value: 40000 }],
            discovery: [],
            proposal: [{ id: uuidv4(), leadId: "lead_008", note: "Proposal sent Tue", value: 65000 }],
            negotiation: [],
            won: [],
            lost: []
          }
        };
        await database.collection("crm").insertOne(doc);
      }
      return json({ stages: doc.stages });
    }

    // GET /api/bulk/:jobId → job status + partial results
    if (parts[0] === "bulk" && parts.length === 2) {
      const database = await db();
      const job = await database.collection("bulk_jobs").findOne({ jobId: parts[1] });
      if (!job) return json({ error: "Job not found" }, 404);
      return json({
        jobId: job.jobId, status: job.status, total: job.total, done: job.done,
        results: job.results || [], error: job.error || null
      });
    }

    // GET /api/analytics
    if (parts[0] === "analytics" && parts.length === 1) {
      const database = await db();
      const savedCount = await database.collection("saved_leads").countDocuments();
      const convosCount = await database.collection("conversations").countDocuments();
      const outreachCount = await database.collection("outreach_generations").countDocuments();
      return json({
        stats: {
          totalLeads: LEADS.length,
          savedLeads: savedCount,
          aiConversations: convosCount,
          outreachGenerated: outreachCount,
          replyRate: 34,
          openRate: 68,
          pipelineValue: 285000
        },
        pipelineChart: [
          { name: "Mon", value: 120 }, { name: "Tue", value: 180 },
          { name: "Wed", value: 220 }, { name: "Thu", value: 280 },
          { name: "Fri", value: 240 }, { name: "Sat", value: 300 },
          { name: "Sun", value: 285 }
        ]
      });
    }

    return json({ error: "Not found" }, 404);
  } catch (e) {
    console.error("GET error:", e);
    return json({ error: e.message }, 500);
  }
}

export async function POST(req) {
  const { parts } = routeInfo(req);
  try {
    const body = await readBody(req);

    // POST /api/chat  { sessionId?, leadId, message }
    if (parts[0] === "chat" && parts.length === 1) {
      const { sessionId, leadId, message } = body;
      if (!leadId || !message) return json({ error: "leadId and message required" }, 400);
      const lead = await fetchLead(leadId);
      if (!lead) return json({ error: "Lead not found" }, 404);

      const database = await db();
      const sid = sessionId || uuidv4();
      let convo = await database.collection("conversations").findOne({ sessionId: sid });
      if (!convo) {
        convo = { sessionId: sid, leadId, messages: [], createdAt: new Date() };
        await database.collection("conversations").insertOne(convo);
      }

      const system = `You are an elite AI Sales Assistant embedded in the "Quality Leads" B2B sales intelligence platform. You have full context on the prospect and can help the seller: write cold emails, LinkedIn messages, follow-ups, call scripts, discovery questions, objection handling, and proposal outlines.

When the user asks for outreach copy, produce ready-to-send, personalized, human-sounding text (no corporate fluff). Reference specific buying signals, recent posts, and company context. Keep it concise and actionable.

${buildLeadContext(lead)}`;

      const history = convo.messages.map(m => ({ role: m.role, content: m.content }));
      history.push({ role: "user", content: message });

      let reply;
      try {
        reply = await chatCompletion({ system, messages: history, maxTokens: 900, temperature: 0.7 });
      } catch (err) {
        console.error("LLM error", err);
        return json({ error: "AI service error", detail: err.message }, 502);
      }

      const now = new Date();
      await database.collection("conversations").updateOne(
        { sessionId: sid },
        { $push: { messages: { $each: [
          { role: "user", content: message, ts: now },
          { role: "assistant", content: reply, ts: now }
        ] } } }
      );

      return json({ sessionId: sid, reply });
    }

    // POST /api/outreach/bulk { leadIds:[], type, tone, productPitch }
    if (parts[0] === "outreach" && parts[1] === "bulk") {
      const { leadIds = [], type = "cold_email", tone = "consultative", productPitch } = body;
      if (!Array.isArray(leadIds) || leadIds.length === 0) return json({ error: "leadIds required" }, 400);
      if (leadIds.length > 50) return json({ error: "Max 50 leads per bulk request" }, 400);

      const typeMap = {
        cold_email: "a personalized cold outbound email (subject line + body, under 120 words)",
        linkedin_message: "a LinkedIn connection request note (max 300 chars) plus a personalized first message",
        follow_up: "a follow-up email after no reply (short, adds new value)",
        call_script: "a 60-second discovery call opener with 4 tailored discovery questions"
      };
      const objective = typeMap[type] || typeMap.cold_email;
      const pitchLine = productPitch ? `Our product / value prop: ${productPitch}\n` : "Our product: Quality Leads \u2014 AI-powered B2B sales intelligence.\n";

      const database = await db();
      const jobId = uuidv4();
      await database.collection("bulk_jobs").insertOne({
        jobId, kind: "outreach_bulk", status: "running", type, tone,
        total: leadIds.length, done: 0, results: [], createdAt: new Date()
      });

      // Fire-and-forget background processing
      (async () => {
        for (const leadId of leadIds) {
          const lead = await fetchLead(leadId);
          let item;
          if (!lead) {
            item = { leadId, error: "Not found" };
          } else {
            const system = `You are an elite outbound copywriter. Tone: ${tone}. Write ${objective}.\n${pitchLine}\nUse specifics from the lead. No preamble. Plain text ready to paste.\n\n${buildLeadContext(lead)}`;
            let content = null, lastErr;
            for (let attempt = 0; attempt < 3 && !content; attempt++) {
              try {
                content = await chatCompletion({
                  system,
                  messages: [{ role: "user", content: `Write the ${type.replace(/_/g, " ")} now.` }],
                  maxTokens: 500,
                  temperature: 0.75
                });
              } catch (err) {
                lastErr = err;
                await new Promise(r => setTimeout(r, 800 * (attempt + 1)));
              }
            }
            item = content
              ? { leadId, name: lead.name, title: lead.title, company: lead.company, avatar: lead.avatar, content }
              : { leadId, name: lead.name, company: lead.company, avatar: lead.avatar, error: lastErr?.message || "LLM error" };
          }
          await database.collection("bulk_jobs").updateOne(
            { jobId },
            { $push: { results: item }, $inc: { done: 1 } }
          );
        }
        await database.collection("bulk_jobs").updateOne(
          { jobId }, { $set: { status: "done", finishedAt: new Date() } }
        );
      })().catch(async (err) => {
        console.error("bulk job failed:", err);
        try {
          await database.collection("bulk_jobs").updateOne(
            { jobId }, { $set: { status: "error", error: err.message } }
          );
        } catch {}
      });

      return json({ jobId, total: leadIds.length });
    }

    // POST /api/outreach { leadId, type, tone }
    if (parts[0] === "outreach" && parts.length === 1) {
      const { leadId, type = "cold_email", tone = "consultative", productPitch } = body;
      const lead = await fetchLead(leadId);
      if (!lead) return json({ error: "Lead not found" }, 404);

      const typeMap = {
        cold_email: "a personalized cold outbound email (subject line + body, under 120 words)",
        linkedin_message: "a LinkedIn connection request note (max 300 chars) followed by a personalized first message after acceptance",
        follow_up: "a follow-up email after no reply (short, adds new value, no guilt-trip)",
        call_script: "a 60-second discovery call opener with 4 tailored discovery questions",
        voicemail: "a 20-second voicemail script",
        breakup_email: "a 'break-up' final email that is polite, direct, and leaves the door open",
        proposal_outline: "a structured proposal outline with sections: Situation, Impact, Proposal, ROI, Next Steps"
      };

      const objective = typeMap[type] || typeMap.cold_email;
      const pitchLine = productPitch ? `Our product / value prop: ${productPitch}\n` : "Our product: Quality Leads — an AI-powered B2B sales intelligence platform that helps reps find prospects, research companies, and generate personalized outreach.\n";

      const system = `You are an elite outbound copywriter for enterprise B2B sales. Tone: ${tone}. Write ${objective}.

${pitchLine}
Use specific details from the lead's profile and buying signals. No generic filler. No emojis unless the tone is Casual/Friendly. Return the copy as plain text ready to paste — no preamble.

${buildLeadContext(lead)}`;

      let reply;
      try {
        reply = await chatCompletion({
          system,
          messages: [{ role: "user", content: `Please write the ${type.replace(/_/g, " ")} now.` }],
          maxTokens: 700,
          temperature: 0.75
        });
      } catch (err) {
        return json({ error: "AI service error", detail: err.message }, 502);
      }

      const database = await db();
      await database.collection("outreach_generations").insertOne({
        id: uuidv4(), leadId, type, tone, content: reply, createdAt: new Date()
      });

      return json({ type, tone, content: reply });
    }

    // POST /api/import/csv { rows: [...] } → returns { jobId } immediately
    if (parts[0] === "import" && parts[1] === "csv") {
      const { rows = [] } = body;
      if (!Array.isArray(rows) || rows.length === 0) return json({ error: "rows required" }, 400);
      if (rows.length > 50) return json({ error: "Max 50 rows per import" }, 400);

      const database = await db();
      const jobId = uuidv4();
      await database.collection("bulk_jobs").insertOne({
        jobId, kind: "csv_import", status: "running",
        total: rows.length, done: 0, results: [], createdAt: new Date()
      });

      (async () => {
        for (const row of rows) {
          const rowText = `Prospect: ${row.name || ""} — ${row.title || ""} at ${row.company || ""} (${row.industry || ""}, ${row.location || ""})`;
          const system = `You are a B2B sales research analyst. For the given prospect, infer plausible current buying signals (funding, hiring, product launches, expansion, tech migrations, leadership changes — based on public patterns for their role/industry) AND write a short personalized cold email pitching "Quality Leads", an AI sales intelligence platform.

Return ONLY valid JSON, no markdown, no code fences. Schema:
{
  "buyingSignals": ["3-5 specific inferred signals"],
  "coldEmail": "personalized cold email text starting with Subject:"
}`;

          let item = { ...row };
          let lastErr;
          for (let attempt = 0; attempt < 3; attempt++) {
            try {
              const raw = await chatCompletion({
                system,
                messages: [{ role: "user", content: rowText }],
                maxTokens: 600,
                temperature: 0.7
              });
              const cleaned = raw.replace(/^```json\s*/i, "").replace(/^```\s*/, "").replace(/```\s*$/, "").trim();
              let parsed;
              try { parsed = JSON.parse(cleaned); }
              catch {
                const match = cleaned.match(/\{[\s\S]*\}/);
                if (match) parsed = JSON.parse(match[0]);
                else throw new Error("Invalid JSON from LLM");
              }
              item = { ...row, buyingSignals: parsed.buyingSignals || [], coldEmail: parsed.coldEmail || "" };
              lastErr = null;
              break;
            } catch (err) {
              lastErr = err;
              await new Promise(r => setTimeout(r, 800 * (attempt + 1)));
            }
          }
          if (lastErr) item = { ...row, error: lastErr.message };
          await database.collection("bulk_jobs").updateOne(
            { jobId },
            { $push: { results: item }, $inc: { done: 1 } }
          );
        }
        await database.collection("bulk_jobs").updateOne(
          { jobId }, { $set: { status: "done", finishedAt: new Date() } }
        );
      })().catch(async (err) => {
        console.error("csv job failed:", err);
        try {
          await database.collection("bulk_jobs").updateOne(
            { jobId }, { $set: { status: "error", error: err.message } }
          );
        } catch {}
      });

      return json({ jobId, total: rows.length });
    }

    // POST /api/saved { leadId }
    if (parts[0] === "saved" && parts.length === 1) {
      const { leadId, folder = "Favorites", note = "" } = body;
      if (!leadId) return json({ error: "leadId required" }, 400);
      const lead = await fetchLead(leadId);
      if (!lead) return json({ error: "Lead not found" }, 404);
      const database = await db();
      const existing = await database.collection("saved_leads").findOne({ leadId });
      if (existing) return json({ saved: true, alreadySaved: true });
      await database.collection("saved_leads").insertOne({
        id: uuidv4(), leadId, folder, note,
        snapshot: { name: lead.name, title: lead.title, company: lead.company, avatar: lead.avatar },
        savedAt: new Date()
      });
      return json({ saved: true });
    }

    // POST /api/crm/move { deal: {id, leadId, note, value}, from, to }
    if (parts[0] === "crm" && parts[1] === "move") {
      const { deal, from, to } = body;
      if (!deal || !from || !to) return json({ error: "deal/from/to required" }, 400);
      const database = await db();
      const doc = await database.collection("crm").findOne({ _key: "pipeline" });
      if (!doc) return json({ error: "pipeline missing" }, 500);
      const stages = doc.stages;
      stages[from] = (stages[from] || []).filter(d => d.id !== deal.id);
      stages[to] = [...(stages[to] || []), deal];
      await database.collection("crm").updateOne({ _key: "pipeline" }, { $set: { stages } });
      return json({ ok: true, stages });
    }

    // POST /api/crm/add { leadId, stage, note, value }
    if (parts[0] === "crm" && parts[1] === "add") {
      const { leadId, stage = "new", note = "", value = 0 } = body;
      const database = await db();
      const doc = await database.collection("crm").findOne({ _key: "pipeline" });
      const stages = doc?.stages || { new: [], contacted: [], discovery: [], proposal: [], negotiation: [], won: [], lost: [] };
      const newDeal = { id: uuidv4(), leadId, note, value };
      stages[stage] = [...(stages[stage] || []), newDeal];
      if (!doc) {
        await database.collection("crm").insertOne({ _key: "pipeline", stages });
      } else {
        await database.collection("crm").updateOne({ _key: "pipeline" }, { $set: { stages } });
      }
      return json({ ok: true, deal: newDeal, stages });
    }

    return json({ error: "Not found" }, 404);
  } catch (e) {
    console.error("POST error:", e);
    return json({ error: e.message }, 500);
  }
}

export async function DELETE(req) {
  const { parts, searchParams } = routeInfo(req);
  try {
    if (parts[0] === "saved" && parts.length === 2) {
      const leadId = parts[1];
      const database = await db();
      await database.collection("saved_leads").deleteOne({ leadId });
      return json({ ok: true });
    }
    return json({ error: "Not found" }, 404);
  } catch (e) {
    return json({ error: e.message }, 500);
  }
}
