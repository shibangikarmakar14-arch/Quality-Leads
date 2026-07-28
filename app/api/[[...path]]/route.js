import { NextResponse } from "next/server";
import { MongoClient } from "mongodb";
import { v4 as uuidv4 } from "uuid";
import { LEADS, COMPANIES, searchLeads, getLead } from "@/lib/leads-data";
import { chatCompletion, buildLeadContext } from "@/lib/llm";

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

    // GET /api/leads?q=...
    if (parts[0] === "leads" && parts.length === 1) {
      const q = searchParams.get("q") || "";
      const seniority = searchParams.get("seniority") || "";
      const department = searchParams.get("department") || "";
      const filters = {};
      if (seniority) filters.seniority = seniority;
      if (department) filters.department = department;
      const results = searchLeads(q, filters);
      return json({ results, count: results.length });
    }

    // GET /api/leads/:id
    if (parts[0] === "leads" && parts.length === 2) {
      const lead = getLead(parts[1]);
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
      const lead = getLead(leadId);
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
          const lead = getLead(leadId);
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
      const lead = getLead(leadId);
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
      const lead = getLead(leadId);
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
