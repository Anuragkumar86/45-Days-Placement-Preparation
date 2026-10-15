import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { pool } from "./db.js";

const here = path.dirname(fileURLToPath(import.meta.url));
const migrationsDirectory = path.resolve(here, "../migrations");

async function migrate() {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS schema_migrations (
        name text PRIMARY KEY,
        applied_at timestamptz NOT NULL DEFAULT now()
      )
    `);

    const files = (await readdir(migrationsDirectory))
      .filter((name) => name.endsWith(".sql"))
      .sort();

    for (const name of files) {
      const alreadyApplied = await client.query(
        "SELECT 1 FROM schema_migrations WHERE name = $1",
        [name]
      );
      if (alreadyApplied.rowCount > 0) {
        console.log(`Skipping already-applied migration: ${name}`);
        continue;
      }

      const sql = await readFile(path.join(migrationsDirectory, name), "utf8");
      await client.query("BEGIN");
      try {
        await client.query(sql);
        await client.query("INSERT INTO schema_migrations (name) VALUES ($1)", [name]);
        await client.query("COMMIT");
        console.log(`Applied migration: ${name}`);
      } catch (error) {
        await client.query("ROLLBACK");
        throw error;
      }
    }

    console.log("Database migrations completed.");
  } finally {
    client.release();
    await pool.end();
  }
}

migrate().catch((error) => {
  console.error("Database migration failed:", error.message);
  process.exitCode = 1;
});
