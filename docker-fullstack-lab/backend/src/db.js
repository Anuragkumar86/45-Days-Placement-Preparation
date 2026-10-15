import { readFileSync } from "node:fs";
import pg from "pg";

const { Pool } = pg;

function loadDatabasePassword() {
  const secretPath = process.env.DB_PASSWORD_FILE;
  if (secretPath) {
    return readFileSync(secretPath, "utf8").trim();
  }

  const password = process.env.DB_PASSWORD;
  if (password) return password;

  throw new Error("Set DB_PASSWORD_FILE or DB_PASSWORD for database access.");
}

export const pool = new Pool({
  host: process.env.DB_HOST ?? "localhost",
  port: Number(process.env.DB_PORT ?? 5432),
  database: process.env.DB_NAME ?? "notesdb",
  user: process.env.DB_USER ?? "notesapp",
  password: loadDatabasePassword(),
  max: 10,
  connectionTimeoutMillis: 5000,
  idleTimeoutMillis: 30000,
});

pool.on("error", (error) => {
  console.error("Unexpected idle PostgreSQL client error:", error.message);
});
