"use client";

import { useState, useEffect } from "react";

interface Note {
  id: number;
  content: string;
  createdAt: string;
}

export default function NotesTimeline({ leadId }: { leadId: number }) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [content, setContent] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

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
    <div className="bg-white border border-gray-200 rounded-xl p-4 space-y-4">
      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Notes Timeline</p>

      {/* Add note form */}
      <form onSubmit={handleAdd} className="flex gap-2">
        <input
          type="text"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Add a note…"
          disabled={saving}
          className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          type="submit"
          disabled={saving || !content.trim()}
          className="bg-blue-600 text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {saving ? "…" : "Add"}
        </button>
      </form>

      {error && <p className="text-sm text-red-600">{error}</p>}

      {/* Timeline */}
      {notes.length === 0 ? (
        <p className="text-sm text-gray-400 py-2">No notes yet.</p>
      ) : (
        <ol className="space-y-3">
          {notes.map((note) => (
            <li key={note.id} className="flex gap-3">
              <div className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-blue-400" />
              <div>
                <p className="text-sm text-gray-800">{note.content}</p>
                <p className="text-xs text-gray-400 mt-0.5">
                  {new Date(note.createdAt).toLocaleString("en-IN", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
