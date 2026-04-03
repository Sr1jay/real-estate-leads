"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  getActionTag, getActionColor, getDaysSince,
  getFollowUpUrgency, sortByUrgency, type Lead,
} from "@/lib/utils";

// ── colour maps ──────────────────────────────────────────────────────────────

const urgencyBadge: Record<string, string> = {
  red:    "bg-rose-100 text-rose-700 border-rose-200",
  orange: "bg-amber-100 text-amber-700 border-amber-200",
  green:  "bg-emerald-100 text-emerald-700 border-emerald-200",
};

const statusDot: Record<string, string> = {
  new:       "bg-violet-500",
  contacted: "bg-amber-400",
  closed:    "bg-slate-300",
};

const followUpBanner: Record<string, string> = {
  overdue: "bg-rose-50 border-rose-200 text-rose-800",
  today:   "bg-amber-50 border-amber-200 text-amber-800",
};

const SOURCES  = ["WhatsApp", "99acres", "MagicBricks", "Housing.com", "Referral", "Walk-in", "Other"];
const STATUSES = ["new", "contacted", "closed"];
const COLUMNS  = [
  { key: "new",       label: "New",       dot: "bg-violet-500" },
  { key: "contacted", label: "Contacted", dot: "bg-amber-400"  },
  { key: "closed",    label: "Closed",    dot: "bg-slate-300"  },
] as const;

// ── main component ───────────────────────────────────────────────────────────

export default function LeadsList() {
  const [leads,   setLeads]   = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [search,  setSearch]  = useState("");
  const [status,  setStatus]  = useState("");
  const [source,  setSource]  = useState("");
  const [view,    setView]    = useState<"list" | "board">("list");

  const fetchLeads = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (status) params.set("status", status);
    if (source) params.set("source", source);
    const res = await fetch(`/api/leads?${params.toString()}`);
    if (res.ok) setLeads(sortByUrgency(await res.json()));
    setLoading(false);
  }, [search, status, source]);

  useEffect(() => {
    const t = setTimeout(fetchLeads, search ? 300 : 0);
    return () => clearTimeout(t);
  }, [fetchLeads, search]);

  // reminders: overdue first, then today, skip upcoming
  const reminders = leads.filter((l) => {
    const u = getFollowUpUrgency(l);
    return u === "overdue" || u === "today";
  });

  const filterSelect =
    "flex-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent";

  return (
    <div>
      {/* Reminder strip */}
      {reminders.length > 0 && (
        <div className="mb-5 space-y-2">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Follow-up reminders</p>
          {reminders.map((lead) => {
            const u = getFollowUpUrgency(lead)!;
            return (
              <Link
                key={lead.id}
                href={`/lead/${lead.id}`}
                className={`flex items-center justify-between gap-3 rounded-xl border px-4 py-3 transition-opacity hover:opacity-80 ${followUpBanner[u]}`}
              >
                <div className="min-w-0">
                  <p className="text-sm font-semibold truncate">{lead.name ?? lead.phone}</p>
                  {lead.projectName && (
                    <p className="text-xs opacity-70 truncate">{lead.projectName}</p>
                  )}
                </div>
                <span className="shrink-0 text-xs font-bold uppercase tracking-wide">
                  {u === "overdue" ? "Overdue" : "Due today"}
                </span>
              </Link>
            );
          })}
        </div>
      )}

      {/* Search */}
      <div className="relative mb-3">
        <svg className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
        </svg>
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name, phone, or project…"
          className="w-full rounded-lg border border-slate-200 bg-white pl-9 pr-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
        />
      </div>

      {/* Filters + view toggle */}
      <div className="flex gap-2 mb-5">
        <select value={status} onChange={(e) => setStatus(e.target.value)} className={filterSelect}>
          <option value="">All statuses</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
          ))}
        </select>
        <select value={source} onChange={(e) => setSource(e.target.value)} className={filterSelect}>
          <option value="">All sources</option>
          {SOURCES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>

        {/* List / Board toggle */}
        <div className="flex rounded-lg border border-slate-200 bg-white overflow-hidden shrink-0">
          <button
            onClick={() => setView("list")}
            title="List view"
            className={`px-3 py-2 transition-colors ${view === "list" ? "bg-indigo-600 text-white" : "text-slate-500 hover:bg-slate-50"}`}
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
            </svg>
          </button>
          <button
            onClick={() => setView("board")}
            title="Board view"
            className={`px-3 py-2 transition-colors ${view === "board" ? "bg-indigo-600 text-white" : "text-slate-500 hover:bg-slate-50"}`}
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 17V7m0 10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2m0 10a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2M9 7a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2m0 10V7m0 10a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2" />
            </svg>
          </button>
        </div>

        {/* Export */}
        <a
          href={`/api/leads/export?${new URLSearchParams(
            Object.fromEntries(
              Object.entries({ search, status, source }).filter(([, v]) => v)
            )
          ).toString()}`}
          download
          title="Export to Excel"
          className="flex items-center justify-center rounded-lg border border-slate-200 bg-white px-3 py-2 text-slate-500 hover:text-indigo-600 hover:border-indigo-300 transition-colors shrink-0"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
          </svg>
        </a>
      </div>

      <p className="text-xs font-medium text-slate-400 uppercase tracking-wide mb-3">
        {loading ? "Loading…" : `${leads.length} lead${leads.length !== 1 ? "s" : ""}`}
      </p>

      {!loading && leads.length === 0 ? (
        <EmptyState hasFilters={!!(search || status || source)} />
      ) : view === "list" ? (
        <ListView leads={leads} />
      ) : (
        <BoardView leads={leads} />
      )}
    </div>
  );
}

// ── List view ────────────────────────────────────────────────────────────────

function ListView({ leads }: { leads: Lead[] }) {
  return (
    <ul className="space-y-2">
      {leads.map((lead) => {
        const tag     = getActionTag(lead);
        const color   = getActionColor(tag);
        const daysAgo = getDaysSince(lead.createdAt);
        const fu      = getFollowUpUrgency(lead);

        return (
          <li key={lead.id}>
            <Link
              href={`/lead/${lead.id}`}
              className="flex items-center gap-4 bg-white border border-slate-200 rounded-xl px-4 py-3.5 hover:border-indigo-300 hover:shadow-sm transition-all"
            >
              <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${statusDot[lead.status] ?? statusDot.new}`} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-slate-900 truncate">{lead.name ?? lead.phone}</p>
                {lead.name && <p className="text-xs text-slate-400 truncate">{lead.phone}</p>}
                <div className="flex items-center gap-1.5 mt-0.5 flex-wrap text-xs text-slate-400">
                  {lead.projectName && <span>{lead.projectName}</span>}
                  {lead.source      && <span>· {lead.source}</span>}
                  <span>· {daysAgo === 0 ? "today" : `${daysAgo}d ago`}</span>
                  {fu === "overdue" && <span className="text-rose-600 font-semibold">· Follow-up overdue</span>}
                  {fu === "today"   && <span className="text-amber-600 font-semibold">· Follow-up due today</span>}
                </div>
              </div>
              <span className={`shrink-0 text-xs font-semibold px-2.5 py-1 rounded-full border ${urgencyBadge[color]}`}>
                {tag}
              </span>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

// ── Board view ───────────────────────────────────────────────────────────────

function BoardView({ leads }: { leads: Lead[] }) {
  const byStatus = (status: string) => leads.filter((l) => l.status === status);

  return (
    <div className="flex gap-3 overflow-x-auto pb-4 -mx-4 px-4">
      {COLUMNS.map(({ key, label, dot }) => {
        const col = byStatus(key);
        return (
          <div key={key} className="flex-none w-60 shrink-0">
            {/* Column header */}
            <div className="flex items-center gap-2 mb-2.5">
              <span className={`h-2 w-2 rounded-full ${dot}`} />
              <span className="text-xs font-semibold text-slate-600 uppercase tracking-wide">{label}</span>
              <span className="ml-auto text-xs text-slate-400 font-medium">{col.length}</span>
            </div>

            {/* Cards */}
            <div className="space-y-2">
              {col.length === 0 ? (
                <div className="rounded-xl border border-dashed border-slate-200 px-3 py-6 text-center text-xs text-slate-400">
                  No leads
                </div>
              ) : (
                col.map((lead) => {
                  const fu = getFollowUpUrgency(lead);
                  return (
                    <Link
                      key={lead.id}
                      href={`/lead/${lead.id}`}
                      className="block bg-white border border-slate-200 rounded-xl px-3.5 py-3 hover:border-indigo-300 hover:shadow-sm transition-all"
                    >
                      <p className="text-sm font-semibold text-slate-900 truncate">
                        {lead.name ?? lead.phone}
                      </p>
                      {lead.name && (
                        <p className="text-xs text-slate-400 truncate">{lead.phone}</p>
                      )}
                      {lead.projectName && (
                        <p className="text-xs text-slate-500 mt-1 truncate">{lead.projectName}</p>
                      )}
                      <div className="flex items-center justify-between mt-2">
                        {lead.source
                          ? <span className="text-xs text-slate-400">{lead.source}</span>
                          : <span />}
                        {(fu === "overdue" || fu === "today") && (
                          <span className={`text-xs font-semibold ${fu === "overdue" ? "text-rose-600" : "text-amber-600"}`}>
                            {fu === "overdue" ? "Overdue" : "Due today"}
                          </span>
                        )}
                      </div>
                    </Link>
                  );
                })
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── Empty state ──────────────────────────────────────────────────────────────

function EmptyState({ hasFilters }: { hasFilters: boolean }) {
  return (
    <div className="text-center py-20 text-slate-400">
      <div className="inline-flex items-center justify-center w-14 h-14 bg-slate-100 rounded-2xl mb-4">
        <svg className="h-7 w-7 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
        </svg>
      </div>
      <p className="text-base font-semibold text-slate-600">
        {hasFilters ? "No leads match your filters" : "No leads yet"}
      </p>
      <p className="text-sm mt-1">
        {hasFilters ? "Try adjusting your search or filters." : "Add your first lead using the button above."}
      </p>
    </div>
  );
}
