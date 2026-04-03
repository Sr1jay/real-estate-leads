"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface FollowUpSectionProps {
  leadId: number;
  followUpAt: string | null; // ISO string or null
}

export default function FollowUpSection({ leadId, followUpAt }: FollowUpSectionProps) {
  const router = useRouter();
  const [date, setDate] = useState(
    followUpAt ? new Date(followUpAt).toISOString().slice(0, 10) : ""
  );
  const [saving, setSaving] = useState(false);
  const [saved,  setSaved]  = useState(false);

  async function save(value: string | null) {
    setSaving(true);
    try {
      await fetch(`/api/leads/${leadId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ followUpAt: value }),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
      router.refresh();
    } finally {
      setSaving(false);
    }
  }

  async function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value;
    setDate(val);
    if (val) await save(val);
  }

  async function handleClear() {
    setDate("");
    await save(null);
  }

  const hasDue = !!followUpAt;
  const due    = hasDue ? new Date(followUpAt!) : null;
  const today  = new Date();
  today.setHours(0, 0, 0, 0);
  const isOverdue = due && due < today;
  const isToday   = due && due.toDateString() === today.toDateString();

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Follow-up Reminder</p>
        {hasDue && (
          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
            isOverdue ? "bg-rose-100 text-rose-700" :
            isToday   ? "bg-amber-100 text-amber-700" :
                        "bg-slate-100 text-slate-500"
          }`}>
            {isOverdue ? "Overdue" : isToday ? "Due today" : "Upcoming"}
          </span>
        )}
      </div>

      <div className="flex gap-2 items-center">
        <input
          type="date"
          value={date}
          onChange={handleChange}
          disabled={saving}
          className="flex-1 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
        />
        {date && (
          <button
            onClick={handleClear}
            disabled={saving}
            className="text-xs text-slate-400 hover:text-slate-600 px-2 py-2 transition-colors"
          >
            Clear
          </button>
        )}
      </div>

      {saved && (
        <p className="text-xs text-emerald-600 mt-2">✓ Reminder saved</p>
      )}
      {!hasDue && !date && (
        <p className="text-xs text-slate-400 mt-2">Pick a date to set a reminder for this lead.</p>
      )}
    </div>
  );
}
