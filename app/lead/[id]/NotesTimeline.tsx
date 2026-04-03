"use client";

import { useState, useEffect } from "react";

interface Note {
  id: number;
  content: string;
  createdAt: string;
}

export default function NotesTimeline({ leadId }: { leadId: number }) {
  const [notes, setNotes]   = useState<Note[]>([]);
  const [content, setContent] = useState("");
  const [saving, setSaving]  = useState(false);
  const [error, setError]    = useState("");

  async function loadNotes() {
    const res = await fetch(`/api/leads/${leadId}/notes`);
    if (res.ok) setNotes(await res.json());
  }

  useEffect(() => {
    loadNotes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [leadId]);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!content.trim()) return;
    setSaving(true);
    setError("");
    try {
      const res = await fetch(`/api/leads/${leadId}/notes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Failed to save note");
      }
      setContent("");
      await loadNotes();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
      <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Activity &amp; Notes</p>

      {/* Add note */}
      <form onSubmit={handleAdd} className="flex gap-2">
        <input
          type="text"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Log a call, visit, or follow-up…"
          disabled={saving}
          className="flex-1 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
        />
        <button
          type="submit"
          disabled={saving || !content.trim()}
          className="bg-indigo-600 text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {saving ? "…" : "Add"}
        </button>
      </form>

      {error && (
        <p className="text-sm text-rose-600">{error}</p>
      )}

      {/* Timeline */}
      {notes.length === 0 ? (
        <p className="text-sm text-slate-400 py-1">No activity yet. Log a note above.</p>
      ) : (
        <ol className="space-y-3 border-l-2 border-slate-100 ml-1 pl-4">
          {notes.map((note) => (
            <li key={note.id}>
              <p className="text-sm text-slate-800 leading-relaxed">{note.content}</p>
              <p className="text-xs text-slate-400 mt-0.5">
                {new Date(note.createdAt).toLocaleString("en-IN", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
