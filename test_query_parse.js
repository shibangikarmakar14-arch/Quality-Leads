import { parseQuery, buildPdlEsQuery } from "./lib/providers/query-parser.js";

const query = "chubb";
const parsed = parseQuery(query);
console.log("Parsed query:", JSON.stringify(parsed, null, 2));

const esQuery = buildPdlEsQuery(parsed.filters, 10);
console.log("\nElasticsearch query:", JSON.stringify(esQuery, null, 2));
