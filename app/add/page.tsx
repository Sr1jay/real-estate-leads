"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AddLeadPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    phone: "",
    name: "",
    projectName: "",
    source: "",
    notes: "",
  });

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.phone.trim()) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Failed to create lead");
      }
      router.push("/");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
      setLoading(false);
    }
  }

  const fieldBase =
    "w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition";

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">New Lead</h1>
        <p className="text-sm text-slate-500 mt-0.5">Fill in what you know — only phone is required.</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4 shadow-sm">
        {/* Phone */}
        <div>
          <label htmlFor="phone" className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
            Phone <span className="text-rose-500">*</span>
          </label>
          <input
            id="phone" name="phone" type="tel"
            value={form.phone} onChange={handleChange}
            placeholder="+91 98765 43210"
            required disabled={loading}
            className={fieldBase}
          />
        </div>

        {/* Name */}
        <div>
          <label htmlFor="name" className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
            Name
          </label>
          <input
            id="name" name="name" type="text"
            value={form.name} onChange={handleChange}
            placeholder="Rahul Sharma"
            disabled={loading}
            className={fieldBase}
          />
        </div>

        {/* Project */}
        <div>
          <label htmlFor="projectName" className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
            Project / Interest
          </label>
          <input
            id="projectName" name="projectName" type="text"
            value={form.projectName} onChange={handleChange}
            placeholder="2BHK in Wakad"
            disabled={loading}
            className={fieldBase}
          />
        </div>

        {/* Source */}
        <div>
          <label htmlFor="source" className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
            Source
          </label>
          <select
            id="source" name="source"
            value={form.source} onChange={handleChange}
            disabled={loading}
            className={fieldBase}
          >
            <option value="">Select source…</option>
            <option value="WhatsApp">WhatsApp</option>
            <option value="99acres">99acres</option>
            <option value="MagicBricks">MagicBricks</option>
            <option value="Housing.com">Housing.com</option>
            <option value="Referral">Referral</option>
            <option value="Walk-in">Walk-in</option>
            <option value="Other">Other</option>
          </select>
        </div>

        {/* Notes */}
        <div>
          <label htmlFor="notes" className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
            Notes
          </label>
          <textarea
            id="notes" name="notes"
            value={form.notes} onChange={handleChange}
            placeholder="Budget ₹60L, needs possession by March…"
            rows={3} disabled={loading}
            className={`${fieldBase} resize-none`}
          />
        </div>

        {error && (
          <div className="rounded-lg bg-rose-50 border border-rose-200 px-3 py-2.5">
            <p className="text-sm text-rose-700">{error}</p>
          </div>
        )}

        <div className="flex gap-3 pt-1">
          <button
            type="submit"
            disabled={loading || !form.phone.trim()}
            className="flex-1 bg-indigo-600 text-white text-sm font-semibold py-2.5 rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? "Creating…" : "Create Lead"}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            disabled={loading}
            className="px-5 py-2.5 text-sm font-semibold text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
