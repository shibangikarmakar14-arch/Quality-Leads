// Test PDL API directly to see what raw data we're getting
const PDL_URL = "https://api.peopledatalabs.com/v5/person/search";
const PDL_KEY = "c22e3edb6664880f3038392f0a2c31cb0b4224ee00d7c8bc75ecae45fc6f7603";

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

async function testPdl() {
  const body = {
    query: {
      bool: {
        must: [
          { match: { job_company_name: "chubb" } }
        ]
      }
    },
    size: 3
  };

  console.log("Request body:", JSON.stringify(body, null, 2));

  const res = await fetch(PDL_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-API-Key": PDL_KEY
    },
    body: JSON.stringify(body)
  });

  console.log("\nResponse status:", res.status);
  console.log("Response headers:");
  console.log("  x-totallimit-remaining:", res.headers.get("x-totallimit-remaining"));
  console.log("  x-call-credits-spent:", res.headers.get("x-call-credits-spent"));

  const data = await res.json();
  
  console.log("\nTotal matches:", data.total);
  console.log("\nFirst 3 results:");
  
  if (data.data && data.data.length > 0) {
    data.data.forEach((person, i) => {
      console.log(`\n--- Person ${i + 1} ---`);
      console.log("ID:", person.id);
      console.log("Full name:", person.full_name);
      console.log("Job title:", person.job_title);
      console.log("Job title role:", person.job_title_role);
      console.log("Job title levels:", person.job_title_levels);
      console.log("Job company name:", person.job_company_name);
      console.log("Job company industry:", person.job_company_industry);
      console.log("LinkedIn URL:", person.linkedin_url);
    });
  }
}

testPdl().catch(console.error);
