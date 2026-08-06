// Test to see what PDL returns vs what we normalize
const PDL_URL = "https://api.peopledatalabs.com/v5/person/search";
const PDL_KEY = "c22e3edb6664880f3038392f0a2c31cb0b4224ee00d7c8bc75ecae45fc6f7603";

async function testNormalization() {
  const body = {
    query: {
      bool: {
        must: [
          { match: { job_company_name: "travelers" } }
        ]
      }
    },
    size: 2
  };

  console.log("Testing with Travelers company...\n");

  const res = await fetch(PDL_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-API-Key": PDL_KEY
    },
    body: JSON.stringify(body)
  });

  const data = await res.json();
  
  if (data.data && data.data.length > 0) {
    const person = data.data[0];
    console.log("RAW PDL DATA:");
    console.log("  full_name:", person.full_name);
    console.log("  job_title:", person.job_title);
    console.log("  job_company_name:", person.job_company_name);
    console.log("  job_title_role:", person.job_title_role);
    console.log("  job_title_levels:", person.job_title_levels);
    
    // Simulate normalization
    const normalized = {
      name: person.full_name ? person.full_name.replace(/\b\w/g, m => m.toUpperCase()) : "Unknown",
      title: person.job_title || "",
      company: person.job_company_name || "",
    };
    
    console.log("\nNORMALIZED DATA:");
    console.log("  name:", normalized.name);
    console.log("  title:", normalized.title);
    console.log("  company:", normalized.company);
  }
}

testNormalization().catch(console.error);
