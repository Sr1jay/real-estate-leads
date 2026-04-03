"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const TYPES = ["1BHK", "2BHK", "3BHK", "4BHK", "Villa", "Penthouse", "Plot", "Shop", "Office"];

export default function AddPropertyPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");
  const [form, setForm]       = useState({
    title: "", type: "", location: "",
    priceMin: "", priceMax: "",
    status: "available", description: "",
  });

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/properties", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          priceMin: form.priceMin ? Number(form.priceMin) : null,
          priceMax: form.priceMax ? Number(form.priceMax) : null,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Failed to create property");
      }
      router.push("/properties");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
      setLoading(false);
    }
  }

  const field =
    "w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition";
  const label = "block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5";

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Add Property</h1>
        <p className="text-sm text-slate-500 mt-0.5">Title and location are required.</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4 shadow-sm">
        <div>
          <label htmlFor="title" className={label}>Title <span className="text-rose-500">*</span></label>
          <input id="title" name="title" type="text" value={form.title} onChange={handleChange}
            placeholder="Spacious 3BHK in Wakad" required disabled={loading} className={field} />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="type" className={label}>Type</label>
            <select id="type" name="type" value={form.type} onChange={handleChange} disabled={loading} className={field}>
              <option value="">Select type…</option>
              {TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="status" className={label}>Status</label>
            <select id="status" name="status" value={form.status} onChange={handleChange} disabled={loading} className={field}>
              <option value="available">Available</option>
              <option value="hold">On Hold</option>
              <option value="sold">Sold</option>
            </select>
          </div>
        </div>

        <div>
          <label htmlFor="location" className={label}>Location <span className="text-rose-500">*</span></label>
          <input id="location" name="location" type="text" value={form.location} onChange={handleChange}
            placeholder="Wakad, Pune" required disabled={loading} className={field} />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="priceMin" className={label}>Price Min (₹ Lakhs)</label>
            <input id="priceMin" name="priceMin" type="number" value={form.priceMin} onChange={handleChange}
              placeholder="55" disabled={loading} className={field} />
          </div>
          <div>
            <label htmlFor="priceMax" className={label}>Price Max (₹ Lakhs)</label>
            <input id="priceMax" name="priceMax" type="number" value={form.priceMax} onChange={handleChange}
              placeholder="70" disabled={loading} className={field} />
          </div>
        </div>

        <div>
          <label htmlFor="description" className={label}>Description</label>
          <textarea id="description" name="description" value={form.description} onChange={handleChange}
            placeholder="East-facing, 2 parking, ready to move…" rows={3} disabled={loading}
            className={`${field} resize-none`} />
        </div>

        {error && (
          <div className="rounded-lg bg-rose-50 border border-rose-200 px-3 py-2.5">
            <p className="text-sm text-rose-700">{error}</p>
          </div>
        )}

        <div className="flex gap-3 pt-1">
          <button type="submit" disabled={loading || !form.title.trim() || !form.location.trim()}
            className="flex-1 bg-indigo-600 text-white text-sm font-semibold py-2.5 rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
            {loading ? "Saving…" : "Save Property"}
          </button>
          <button type="button" onClick={() => router.back()} disabled={loading}
            className="px-5 py-2.5 text-sm font-semibold text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors">
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
