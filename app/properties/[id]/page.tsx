import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { matchLeadsForProperty, type Property } from "@/lib/matching";
import type { Lead } from "@/lib/utils";

export const dynamic = "force-dynamic";

const statusBadge: Record<string, string> = {
  available: "bg-emerald-100 text-emerald-700",
  hold:      "bg-amber-100 text-amber-700",
  sold:      "bg-slate-100 text-slate-500",
};

const leadStatusDot: Record<string, string> = {
  new:       "bg-violet-500",
  contacted: "bg-amber-400",
  closed:    "bg-slate-300",
};

function fmt(n: number | null) {
  if (n == null) return null;
  return n >= 100 ? `₹${(n / 100).toFixed(n % 100 === 0 ? 0 : 1)}Cr` : `₹${n}L`;
}

export default async function PropertyDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const id = parseInt((await params).id, 10);
  if (isNaN(id)) notFound();

  const [property, allLeads] = await Promise.all([
    prisma.property.findUnique({ where: { id } }),
    prisma.lead.findMany({ orderBy: { createdAt: "desc" } }),
  ]);

  if (!property) notFound();

  const matched = matchLeadsForProperty(property as Property, allLeads as Lead[]);
  const min   = fmt(property.priceMin);
  const max   = fmt(property.priceMax);
  const price = min && max ? `${min} – ${max}` : min ?? max ?? null;

  return (
    <div className="space-y-4">
      {/* Back */}
      <Link href="/properties" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 transition-colors">
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
        </svg>
        All Properties
      </Link>

      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
        <div className="flex items-start justify-between gap-3">
          <h1 className="text-xl font-bold text-slate-900">{property.title}</h1>
          <span className={`shrink-0 text-xs font-semibold px-2.5 py-1 rounded-full ${statusBadge[property.status] ?? statusBadge.available}`}>
            {property.status.charAt(0).toUpperCase() + property.status.slice(1)}
          </span>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-x-6 gap-y-2.5 text-sm border-t border-slate-100 pt-4">
          <span className="text-slate-400 font-medium">Location</span>
          <span className="text-slate-900">{property.location}</span>
          {property.type && (
            <>
              <span className="text-slate-400 font-medium">Type</span>
              <span className="text-slate-900">{property.type}</span>
            </>
          )}
          {price && (
            <>
              <span className="text-slate-400 font-medium">Price</span>
              <span className="text-slate-900">{price}</span>
            </>
          )}
          <span className="text-slate-400 font-medium">Added</span>
          <span className="text-slate-900">
            {new Date(property.createdAt).toLocaleDateString("en-IN", {
              day: "numeric", month: "short", year: "numeric",
            })}
          </span>
        </div>

        {property.description && (
          <div className="mt-4 border-t border-slate-100 pt-4">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1.5">Description</p>
            <p className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">{property.description}</p>
          </div>
        )}
      </div>

      {/* Matched Leads */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">
          Matched Leads{matched.length > 0 ? ` (${matched.length})` : ""}
        </p>
        {matched.length === 0 ? (
          <p className="text-sm text-slate-400">No lead matches yet. Leads with a project interest overlapping this property&apos;s location or type will appear here.</p>
        ) : (
          <ul className="space-y-2">
            {matched.map((lead) => (
              <li key={lead.id}>
                <Link
                  href={`/lead/${lead.id}`}
                  className="flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50 px-3.5 py-3 hover:border-indigo-200 hover:bg-white transition-all"
                >
                  <span className={`h-2 w-2 shrink-0 rounded-full ${leadStatusDot[lead.status] ?? leadStatusDot.new}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-900 truncate">{lead.name ?? lead.phone}</p>
                    {lead.projectName && (
                      <p className="text-xs text-slate-400 truncate">{lead.projectName}</p>
                    )}
                  </div>
                  <span className="text-xs text-slate-400 capitalize shrink-0">{lead.status}</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
