"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { getActionTag, getActionColor, getDaysSince, sortByUrgency, type Lead } from "@/lib/utils";

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

const SOURCES  = ["WhatsApp", "99acres", "MagicBricks", "Housing.com", "Referral", "Walk-in", "Other"];
const STATUSES = ["new", "contacted", "closed"];

export default function LeadsList() {
  const [leads, setLeads]   = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch]  = useState("");
  const [status, setStatus]  = useState("");
  const [source, setSource]  = useState("");

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

  const filterSelect =
    "flex-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent";

  return (
    <div>
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

      {/* Filters */}
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
      </div>

      <p className="text-xs font-medium text-slate-400 uppercase tracking-wide mb-3">
        {loading ? "Loading…" : `${leads.length} lead${leads.length !== 1 ? "s" : ""}`}
      </p>

      {!loading && leads.length === 0 ? (
        <div className="text-center py-20 text-slate-400">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-slate-100 rounded-2xl mb-4">
            <svg className="h-7 w-7 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
            </svg>
          </div>
          <p className="text-base font-semibold text-slate-600">
            {search || status || source ? "No leads match your filters" : "No leads yet"}
          </p>
          <p className="text-sm mt-1">
            {search || status || source ? "Try adjusting your search or filters." : "Add your first lead using the button above."}
          </p>
        </div>
      ) : (
        <ul className="space-y-2">
          {leads.map((lead) => {
            const tag   = getActionTag(lead);
            const color = getActionColor(tag);
            const daysAgo = getDaysSince(lead.createdAt);

            return (
              <li key={lead.id}>
                <Link
                  href={`/lead/${lead.id}`}
                  className="flex items-center gap-4 bg-white border border-slate-200 rounded-xl px-4 py-3.5 hover:border-indigo-300 hover:shadow-sm transition-all"
                >
                  {/* Status dot */}
                  <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${statusDot[lead.status] ?? statusDot.new}`} />

                  {/* Main info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-900 truncate">
                      {lead.name ?? lead.phone}
                    </p>
                    {lead.name && (
                      <p className="text-xs text-slate-400 truncate">{lead.phone}</p>
                    )}
                    <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                      {lead.projectName && (
                        <span className="text-xs text-slate-500">{lead.projectName}</span>
                      )}
                      {lead.source && (
                        <span className="text-xs text-slate-400">· {lead.source}</span>
                      )}
                      <span className="text-xs text-slate-400">
                        · {daysAgo === 0 ? "today" : `${daysAgo}d ago`}
                      </span>
                    </div>
                  </div>

                  {/* Action badge */}
                  <span className={`shrink-0 text-xs font-semibold px-2.5 py-1 rounded-full border ${urgencyBadge[color]}`}>
                    {tag}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
