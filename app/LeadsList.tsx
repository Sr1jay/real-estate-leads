"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { getActionTag, getActionColor, getDaysSince, sortByUrgency, type Lead } from "@/lib/utils";

const colorClasses: Record<string, string> = {
  red: "bg-red-100 text-red-700 border-red-200",
  orange: "bg-orange-100 text-orange-700 border-orange-200",
  green: "bg-green-100 text-green-700 border-green-200",
};

const SOURCES = ["WhatsApp", "99acres", "MagicBricks", "Housing.com", "Referral", "Walk-in", "Other"];
const STATUSES = ["new", "contacted", "closed"];

export default function LeadsList() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [source, setSource] = useState("");

  const fetchLeads = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (status) params.set("status", status);
    if (source) params.set("source", source);

    const res = await fetch(`/api/leads?${params.toString()}`);
    if (res.ok) {
      const data = await res.json();
      setLeads(sortByUrgency(data));
    }
    setLoading(false);
  }, [search, status, source]);

  useEffect(() => {
    const timer = setTimeout(fetchLeads, search ? 300 : 0);
    return () => clearTimeout(timer);
  }, [fetchLeads, search]);

  const select = "rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500";

  return (
    <div>
      {/* Search + Filter bar */}
      <div className="mb-4 space-y-2">
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name, phone, or project…"
          className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <div className="flex gap-2">
          <select value={status} onChange={(e) => setStatus(e.target.value)} className={`flex-1 ${select}`}>
            <option value="">All statuses</option>
            {STATUSES.map((s) => (
              <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
            ))}
          </select>
          <select value={source} onChange={(e) => setSource(e.target.value)} className={`flex-1 ${select}`}>
            <option value="">All sources</option>
            {SOURCES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
      </div>

      <p className="text-sm text-gray-500 mb-4">
        {loading ? "Loading…" : `${leads.length} lead${leads.length !== 1 ? "s" : ""}`}
      </p>

      {!loading && leads.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <p className="text-4xl mb-3">📋</p>
          <p className="text-lg font-medium text-gray-500">No leads found</p>
          {search || status || source ? (
            <p className="text-sm mt-1">Try adjusting your filters.</p>
          ) : (
            <>
              <p className="text-sm mt-1">Add your first lead to get started.</p>
              <Link
                href="/add"
                className="mt-4 inline-block bg-blue-600 text-white text-sm font-medium px-5 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Add Lead
              </Link>
            </>
          )}
        </div>
      ) : (
        <ul className="space-y-3">
          {leads.map((lead) => {
            const tag = getActionTag(lead);
            const color = getActionColor(tag);
            const daysAgo = getDaysSince(lead.createdAt);

            return (
              <li key={lead.id}>
                <Link
                  href={`/lead/${lead.id}`}
                  className="block bg-white border border-gray-200 rounded-xl p-4 hover:border-blue-300 hover:shadow-sm transition-all"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-base font-semibold text-gray-900">
                        {lead.name ?? lead.phone}
                      </p>
                      {lead.name && (
                        <p className="text-sm text-gray-400">{lead.phone}</p>
                      )}
                      {lead.projectName && (
                        <p className="text-sm text-gray-600 mt-0.5">{lead.projectName}</p>
                      )}
                      {lead.source && (
                        <p className="text-xs text-gray-400 mt-0.5">via {lead.source}</p>
                      )}
                      <p className="text-xs text-gray-400 mt-2">
                        Added {daysAgo === 0 ? "today" : `${daysAgo} day${daysAgo !== 1 ? "s" : ""} ago`}
                      </p>
                    </div>
                    <div className="shrink-0">
                      <span className={`inline-block text-xs font-semibold px-2.5 py-1 rounded-full border ${colorClasses[color]}`}>
                        {tag}
                      </span>
                    </div>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
