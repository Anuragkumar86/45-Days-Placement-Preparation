import express from "express";
import { pool } from "./db.js";

const app = express();
const port = Number(process.env.PORT ?? 4000);

app.disable("x-powered-by");
app.use(express.json({ limit: "16kb" }));

// Liveness: the process can answer an HTTP request.
app.get("/health", (_req, res) => {
  res.status(200).json({ status: "ok" });
});

// Readiness: the database connection works and the expected schema exists.
app.get("/ready", async (_req, res) => {
  try {
    await pool.query("SELECT 1 FROM notes LIMIT 0");
    res.status(200).json({ status: "ready", database: "ok" });
  } catch {
    res.status(503).json({ status: "not-ready", database: "unavailable" });
  }
});

app.get("/api/notes", async (_req, res, next) => {
  try {
    const { rows } = await pool.query(
      "SELECT id, content, created_at FROM notes ORDER BY created_at DESC, id DESC LIMIT 100"
    );
    res.json({ notes: rows });
  } catch (error) {
    next(error);
  }
});

app.post("/api/notes", async (req, res, next) => {
  try {
    const content = typeof req.body?.content === "string" ? req.body.content.trim() : "";
    if (!content || content.length > 500) {
      return res.status(400).json({ error: "Content must contain 1–500 characters." });
    }

    const { rows } = await pool.query(
      "INSERT INTO notes (content) VALUES ($1) RETURNING id, content, created_at",
      [content]
    );
    return res.status(201).json({ note: rows[0] });
  } catch (error) {
    return next(error);
  }
});

app.use((error, _req, res, _next) => {
  // Log diagnostic detail server-side; do not expose database errors to clients.
  console.error("Request failed:", error.message);
  if (res.headersSent) return;
  res.status(500).json({ error: "Internal server error." });
});

const server = app.listen(port, "0.0.0.0", () => {
  console.log(`API listening on port ${port}`);
});

let shuttingDown = false;
function shutdown(signal) {
  if (shuttingDown) return;
  shuttingDown = true;
  console.log(`${signal} received; beginning graceful shutdown.`);

  const forceExit = setTimeout(() => {
    console.error("Graceful shutdown timed out.");
    process.exit(1);
  }, 10000);
  forceExit.unref();

  server.close(async (error) => {
    try {
      await pool.end();
      clearTimeout(forceExit);
      if (error) throw error;
      process.exit(0);
    } catch (shutdownError) {
      console.error("Shutdown failed:", shutdownError.message);
      process.exit(1);
    }
  });
}

process.once("SIGTERM", () => shutdown("SIGTERM"));
process.once("SIGINT", () => shutdown("SIGINT"));
