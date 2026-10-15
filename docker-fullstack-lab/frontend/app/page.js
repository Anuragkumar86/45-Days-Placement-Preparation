"use client";

import { useEffect, useState } from "react";

export default function HomePage() {
  const [notes, setNotes] = useState([]);
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function loadNotes() {
    setError("");
    try {
      const response = await fetch("/api/notes", { cache: "no-store" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Could not load notes.");
      setNotes(data.notes ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load notes.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadNotes();
  }, []);

  async function handleSubmit(event) {
    event.preventDefault();
    const trimmed = content.trim();
    if (!trimmed) return;

    setSaving(true);
    setError("");
    try {
      const response = await fetch("/api/notes", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ content: trimmed }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Could not save the note.");
      setContent("");
      await loadNotes();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save the note.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="page-shell">
      <section className="hero">
        <p className="eyebrow">FULL-STACK DOCKER PRACTICAL BY ANURAG-YADAV</p>
        <h1>Docker Notes Lab</h1>
        <p className="intro">
          A tiny Next.js + Node.js API + PostgreSQL application. Add a note, restart
          the containers, and verify that your data persists.
        </p>
        <div className="architecture" aria-label="Application architecture">
          <span>Next.js</span><b>→</b><span>Node.js API</span><b>→</b><span>PostgreSQL</span>
        </div>
      </section>

      <section className="panel">
        <h2>Add a note</h2>
        <form onSubmit={handleSubmit} className="note-form">
          <label htmlFor="content">Note content</label>
          <textarea
            id="content"
            value={content}
            maxLength={500}
            onChange={(event) => setContent(event.target.value)}
            placeholder="For example: My API reaches PostgreSQL using the service name postgres."
            rows={3}
          />
          <div className="form-footer">
            <span>{content.length}/500 characters</span>
            <button type="submit" disabled={saving || !content.trim()}>
              {saving ? "Saving…" : "Save note"}
            </button>
          </div>
        </form>
        {error ? <p className="error" role="alert">{error}</p> : null}
      </section>

      <section className="panel">
        <div className="list-heading">
          <h2>Saved notes</h2>
          <button className="secondary-button" type="button" onClick={loadNotes}>
            Refresh
          </button>
        </div>
        {loading ? <p className="muted">Loading notes…</p> : null}
        {!loading && notes.length === 0 ? (
          <p className="muted">No notes yet. Save one above to create your first database record.</p>
        ) : null}
        <ul className="notes-list">
          {notes.map((note) => (
            <li key={note.id}>
              <p>{note.content}</p>
              <small>#{note.id} · {new Date(note.created_at).toLocaleString()}</small>
            </li>
          ))}
        </ul>
      </section>

      <footer>
        The browser calls the same-origin Next.js route; that server-side route reaches the API over Docker's private network.
      </footer>
    </main>
  );
}
