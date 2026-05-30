// One-shot Supabase schema bootstrap.
// Usage: DATABASE_URL="postgresql://..." node scripts/db-setup.mjs
// Runs the SQL migrations in dependency order against the target DB.
// Requires the `pg` package (installed locally, not in package.json).

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import pg from "pg";

const __dirname = dirname(fileURLToPath(import.meta.url));
const sqlDir = join(__dirname, "..", "supabase");

// Order matters: tables/RLS first, then dependents, then storage, then realtime.
const FILES = ["schema.sql", "reviews.sql", "storage.sql", "realtime.sql"];

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error("ERROR: set DATABASE_URL to your Supabase connection string.");
  process.exit(1);
}

const client = new pg.Client({
  connectionString,
  ssl: { rejectUnauthorized: false },
});

try {
  await client.connect();
  console.log("Connected.\n");
  for (const file of FILES) {
    const sql = readFileSync(join(sqlDir, file), "utf8");
    process.stdout.write(`Running ${file} ... `);
    await client.query(sql);
    console.log("OK");
  }
  console.log("\nAll migrations applied successfully.");
} catch (err) {
  console.error("\nFAILED:", err.message);
  process.exitCode = 1;
} finally {
  await client.end();
}
