// Check specific person by ID
const PDL_URL = "https://api.peopledatalabs.com/v5/person/search";
const PDL_KEY = "c22e3edb6664880f3038392f0a2c31cb0b4224ee00d7c8bc75ecae45fc6f7603";

async function checkPerson() {
  const body = {
    query: {
      bool: {
        must: [
          { term: { id: "UR4B6ctGGnhR5qziR3oqIw_0000" } }
        ]
      }
    },
    size: 1
  };

  const res = await fetch(PDL_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-API-Key": PDL_KEY
    },
    body: JSON.stringify(body)
  });

  const data = await res.json();
  
  console.log("Response status:", res.status);
  console.log("Total matches:", data.total);
  
  if (data.data && data.data.length > 0) {
    const person = data.data[0];
    console.log("\nPerson data:");
    console.log("  ID:", person.id);
    console.log("  full_name:", person.full_name);
    console.log("  job_title:", person.job_title);
    console.log("  job_company_name:", person.job_company_name);
  } else {
    console.log("\nNo results found");
  }
}

checkPerson().catch(console.error);
