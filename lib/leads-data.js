// Rich seed data for realistic B2B prospects
export const LEADS = [
  {
    id: "lead_001",
    name: "Sarah Chen",
    title: "VP of Engineering",
    company: "Rippling",
    companyId: "co_rippling",
    location: "San Francisco, CA",
    industry: "HR Tech / SaaS",
    linkedin: "linkedin.com/in/sarahchen-vp",
    email: "sarah.chen@rippling.com",
    seniority: "VP",
    department: "Engineering",
    yearsInRole: 3,
    avatar: "https://i.pravatar.cc/200?img=47",
    experience: [
      { role: "VP Engineering", company: "Rippling", years: "2022 - Present" },
      { role: "Director of Platform", company: "Stripe", years: "2018 - 2022" },
      { role: "Senior Engineer", company: "Airbnb", years: "2014 - 2018" }
    ],
    education: ["MS Computer Science, Stanford", "BS EE, UC Berkeley"],
    skills: ["Distributed Systems", "Team Leadership", "Kubernetes", "React", "GraphQL"],
    recentPosts: [
      "Excited to share we just hit 500 engineers at Rippling — hiring across all senior levels.",
      "Migrated 40% of our monolith to microservices this quarter. Big shoutout to the platform team."
    ],
    buyingSignals: ["Hiring 50+ engineers", "Recently raised Series E ($500M)", "Migrating to microservices", "Opened Bangalore office"]
  },
  {
    id: "lead_002",
    name: "Marcus Rodriguez",
    title: "Chief Revenue Officer",
    company: "Notion",
    companyId: "co_notion",
    location: "New York, NY",
    industry: "Productivity Software",
    linkedin: "linkedin.com/in/marcusrodriguez-cro",
    email: "m.rodriguez@notion.so",
    seniority: "C-Level",
    department: "Sales",
    yearsInRole: 2,
    avatar: "https://i.pravatar.cc/200?img=12",
    experience: [
      { role: "CRO", company: "Notion", years: "2023 - Present" },
      { role: "VP Sales", company: "Zoom", years: "2019 - 2023" },
      { role: "Enterprise AE", company: "Salesforce", years: "2015 - 2019" }
    ],
    education: ["MBA, Wharton", "BA Economics, NYU"],
    skills: ["Enterprise Sales", "Go-to-Market", "Sales Ops", "Forecasting", "Team Building"],
    recentPosts: [
      "Notion crossed $500M ARR last month. Team of the year, hands down.",
      "Looking for a great outbound tool that actually understands buyer intent. DM me."
    ],
    buyingSignals: ["Posted about outbound tools", "Sales team expanded 3x", "IPO speculation", "Enterprise push in EU"]
  },
  {
    id: "lead_003",
    name: "Priya Anand",
    title: "Head of Growth",
    company: "Linear",
    companyId: "co_linear",
    location: "Remote (Berlin)",
    industry: "Developer Tools",
    linkedin: "linkedin.com/in/priyaanand",
    email: "priya@linear.app",
    seniority: "Head",
    department: "Marketing",
    yearsInRole: 1,
    avatar: "https://i.pravatar.cc/200?img=45",
    experience: [
      { role: "Head of Growth", company: "Linear", years: "2024 - Present" },
      { role: "Growth Lead", company: "Vercel", years: "2021 - 2024" },
      { role: "Product Marketing", company: "Figma", years: "2018 - 2021" }
    ],
    education: ["BA Marketing, LSE"],
    skills: ["PLG", "Product Marketing", "Analytics", "Content", "SEO"],
    recentPosts: [
      "How Linear grew to 10k teams without a single outbound rep.",
      "Product-led is dead? No, but you need distribution AND product."
    ],
    buyingSignals: ["Hiring 5 growth roles", "Launched enterprise tier", "New investor onboarded", "Expanding to Asia"]
  },
  {
    id: "lead_004",
    name: "David Okafor",
    title: "Director of Business Development",
    company: "Ramp",
    companyId: "co_ramp",
    location: "New York, NY",
    industry: "Fintech",
    linkedin: "linkedin.com/in/davidokafor",
    email: "david.o@ramp.com",
    seniority: "Director",
    department: "BizDev",
    yearsInRole: 2,
    avatar: "https://i.pravatar.cc/200?img=68",
    experience: [
      { role: "Director BD", company: "Ramp", years: "2023 - Present" },
      { role: "Senior BD", company: "Brex", years: "2020 - 2023" }
    ],
    education: ["MBA, Harvard", "BS Finance, Wharton"],
    skills: ["Partnerships", "Enterprise", "Fintech", "Deal Structuring"],
    recentPosts: [
      "Ramp just crossed $150M in savings delivered to customers.",
      "Partnering with the right SaaS tools makes a huge difference for our AP team."
    ],
    buyingSignals: ["Actively evaluating vendors", "Series D funding", "3x sales team growth"]
  },
  {
    id: "lead_005",
    name: "Emma Larsson",
    title: "Chief Technology Officer",
    company: "Klarna",
    companyId: "co_klarna",
    location: "Stockholm, Sweden",
    industry: "Fintech / BNPL",
    linkedin: "linkedin.com/in/emmalarsson",
    email: "emma.larsson@klarna.com",
    seniority: "C-Level",
    department: "Engineering",
    yearsInRole: 4,
    avatar: "https://i.pravatar.cc/200?img=23",
    experience: [
      { role: "CTO", company: "Klarna", years: "2021 - Present" },
      { role: "VP Engineering", company: "Spotify", years: "2016 - 2021" }
    ],
    education: ["PhD CS, KTH Stockholm"],
    skills: ["Scale", "AI/ML", "Payments", "Infrastructure"],
    recentPosts: [
      "Klarna's AI assistant now handles 2/3 of customer service chats. Wild.",
      "Cutting 100+ SaaS vendors to consolidate. Only the ones with real AI survive."
    ],
    buyingSignals: ["Vendor consolidation", "AI-first mandate", "IPO prep", "Cost optimization push"]
  },
  {
    id: "lead_006",
    name: "James Park",
    title: "Head of Sales, EMEA",
    company: "Datadog",
    companyId: "co_datadog",
    location: "London, UK",
    industry: "Observability / DevTools",
    linkedin: "linkedin.com/in/jamespark-datadog",
    email: "j.park@datadoghq.com",
    seniority: "Head",
    department: "Sales",
    yearsInRole: 2,
    avatar: "https://i.pravatar.cc/200?img=33",
    experience: [
      { role: "Head EMEA Sales", company: "Datadog", years: "2023 - Present" },
      { role: "Regional Director", company: "New Relic", years: "2019 - 2023" }
    ],
    education: ["MBA, INSEAD"],
    skills: ["Enterprise", "EMEA", "Observability", "Channel"],
    recentPosts: [
      "Building the EMEA team from 40 to 120 reps in 18 months.",
      "The best AEs I hire come from tools they wish existed."
    ],
    buyingSignals: ["Aggressive hiring EMEA", "New Paris office", "Tooling refresh"]
  },
  {
    id: "lead_007",
    name: "Aisha Patel",
    title: "VP People Operations",
    company: "Vercel",
    companyId: "co_vercel",
    location: "San Francisco, CA",
    industry: "Cloud Infrastructure",
    linkedin: "linkedin.com/in/aishapatel",
    email: "aisha@vercel.com",
    seniority: "VP",
    department: "People",
    yearsInRole: 1,
    avatar: "https://i.pravatar.cc/200?img=44",
    experience: [
      { role: "VP People", company: "Vercel", years: "2024 - Present" },
      { role: "Head of Talent", company: "Stripe", years: "2020 - 2024" }
    ],
    education: ["MA Organizational Psychology, Columbia"],
    skills: ["Talent Acquisition", "Remote Culture", "L&D", "Comp"],
    recentPosts: [
      "Vercel doubling headcount this year. If you love developer tools, come build with us."
    ],
    buyingSignals: ["Hiring 200+ roles", "Post-Series E momentum", "Global expansion"]
  },
  {
    id: "lead_008",
    name: "Tomás Alvarez",
    title: "Founder & CEO",
    company: "Retool",
    companyId: "co_retool",
    location: "San Francisco, CA",
    industry: "Internal Tools / DevTools",
    linkedin: "linkedin.com/in/tomasalvarez",
    email: "tomas@retool.com",
    seniority: "Founder",
    department: "Executive",
    yearsInRole: 7,
    avatar: "https://i.pravatar.cc/200?img=13",
    experience: [
      { role: "Founder & CEO", company: "Retool", years: "2017 - Present" },
      { role: "Engineer", company: "Meta", years: "2014 - 2017" }
    ],
    education: ["BS CS, MIT"],
    skills: ["Product", "Founder", "DevTools", "Vision"],
    recentPosts: [
      "AI agents inside Retool now build entire apps from a prompt.",
      "Hiring aggressive AEs. Ping me."
    ],
    buyingSignals: ["AI product launch", "Sales team scaling", "Enterprise focus"]
  }
];

export const COMPANIES = {
  co_rippling: {
    id: "co_rippling", name: "Rippling", logo: "R", industry: "HR Tech / SaaS", employees: "2,500", revenue: "$400M ARR", founded: 2016, hq: "San Francisco, CA",
    funding: "Series E — $500M (2024) at $13.5B valuation", growth: "+65% YoY",
    techStack: ["React", "TypeScript", "AWS", "Postgres", "Kafka", "Snowflake"],
    news: ["Raised Series E in Q1 2024", "Launched Rippling IT", "Expanded to Bangalore", "Partnered with Deel competitor"],
    competitors: ["Deel", "Gusto", "BambooHR", "Justworks"],
    painPoints: ["Scaling engineering hiring globally", "Complex compliance across 50+ countries", "Vendor consolidation pressure"]
  },
  co_notion: {
    id: "co_notion", name: "Notion", logo: "N", industry: "Productivity Software", employees: "800", revenue: "$500M ARR", founded: 2016, hq: "San Francisco, CA",
    funding: "Series C — $275M at $10B valuation", growth: "+80% YoY",
    techStack: ["React", "TypeScript", "AWS", "Postgres", "Redis"],
    news: ["Crossed $500M ARR", "Launched Notion AI 3.0", "Enterprise push in EU"],
    competitors: ["Coda", "ClickUp", "Monday", "Airtable"],
    painPoints: ["Outbound motion is nascent", "Enterprise buyer education", "Compete with MS Loop"]
  },
  co_linear: {
    id: "co_linear", name: "Linear", logo: "L", industry: "Developer Tools", employees: "120", revenue: "$50M ARR", founded: 2019, hq: "Remote-first",
    funding: "Series B — $35M at $400M valuation", growth: "+150% YoY",
    techStack: ["TypeScript", "GraphQL", "Postgres", "AWS"],
    news: ["Passed 10,000 teams", "Launched Linear for Enterprise", "Series B closed"],
    competitors: ["Jira", "Height", "Shortcut", "Asana"],
    painPoints: ["Scaling GTM without breaking product-led ethos", "Enterprise motion"]
  },
  co_ramp: { id: "co_ramp", name: "Ramp", logo: "R", industry: "Fintech", employees: "1,200", revenue: "$300M ARR", founded: 2019, hq: "New York, NY",
    funding: "Series D — $300M at $13B valuation", growth: "+100% YoY",
    techStack: ["React", "Python", "AWS", "Snowflake"], news: ["$150M saved to customers", "Launched Ramp Travel", "Partnered with Copilot"], competitors: ["Brex", "Mercury", "Divvy"], painPoints: ["CFO education", "Enterprise complexity"]
  },
  co_klarna: { id: "co_klarna", name: "Klarna", logo: "K", industry: "Fintech / BNPL", employees: "5,000", revenue: "$2.3B ARR", founded: 2005, hq: "Stockholm, Sweden",
    funding: "Pre-IPO — $6.7B valuation", growth: "+27% YoY",
    techStack: ["Java", "Kotlin", "React", "AWS", "OpenAI"], news: ["IPO filing 2025", "AI cut CS by 700 heads", "US expansion"], competitors: ["Affirm", "Afterpay", "PayPal"], painPoints: ["IPO readiness", "Cost cuts", "Vendor consolidation"]
  },
  co_datadog: { id: "co_datadog", name: "Datadog", logo: "D", industry: "Observability", employees: "7,000", revenue: "$2.3B ARR", founded: 2010, hq: "New York, NY",
    funding: "Public (NASDAQ: DDOG)", growth: "+27% YoY",
    techStack: ["Go", "Python", "React", "AWS"], news: ["AI observability launch", "Paris office", "Acquired Codeium data"], competitors: ["New Relic", "Splunk", "Grafana"], painPoints: ["EMEA growth", "AI SKU adoption"]
  },
  co_vercel: { id: "co_vercel", name: "Vercel", logo: "V", industry: "Cloud Infrastructure", employees: "600", revenue: "$150M ARR", founded: 2015, hq: "San Francisco, CA",
    funding: "Series E — $250M at $3.25B", growth: "+120% YoY",
    techStack: ["Next.js", "React", "AWS", "Rust"], news: ["v0 AI product", "Series E", "Doubling headcount"], competitors: ["Netlify", "Cloudflare Pages"], painPoints: ["Hiring at scale", "Talent competition"]
  },
  co_retool: { id: "co_retool", name: "Retool", logo: "R", industry: "Internal Tools", employees: "500", revenue: "$100M ARR", founded: 2017, hq: "San Francisco, CA",
    funding: "Series C — $45M at $3.2B", growth: "+90% YoY",
    techStack: ["React", "TypeScript", "Postgres"], news: ["AI agents GA", "Enterprise push"], competitors: ["Airplane", "Superblocks", "Bubble"], painPoints: ["Sales scaling", "AI-native competitors"]
  }
};

export function searchLeads(query, filters = {}) {
  const q = (query || "").toLowerCase().trim();
  let results = LEADS.filter(l => {
    if (!q) return true;
    return (
      l.name.toLowerCase().includes(q) ||
      l.title.toLowerCase().includes(q) ||
      l.company.toLowerCase().includes(q) ||
      l.industry.toLowerCase().includes(q) ||
      l.location.toLowerCase().includes(q) ||
      (l.skills || []).some(s => s.toLowerCase().includes(q))
    );
  });
  if (filters.seniority) results = results.filter(l => l.seniority === filters.seniority);
  if (filters.department) results = results.filter(l => l.department === filters.department);
  return results;
}

export function getLead(id) {
  const lead = LEADS.find(l => l.id === id);
  if (!lead) return null;
  const company = COMPANIES[lead.companyId] || null;
  return { ...lead, companyDetails: company };
}
