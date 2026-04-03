import prisma from "@/lib/prisma";
import { getActionTag, getActionColor, SUGGESTED_REPLY, type Lead } from "@/lib/utils";
import { notFound } from "next/navigation";
import Link from "next/link";
import LeadActions from "./LeadActions";
import NotesTimeline from "./NotesTimeline";

export const dynamic = "force-dynamic";

const urgencyCard: Record<string, string> = {
  red:    "bg-rose-50 border-rose-200 text-rose-800",
  orange: "bg-amber-50 border-amber-200 text-amber-800",
  green:  "bg-emerald-50 border-emerald-200 text-emerald-800",
};

const statusBadge: Record<string, string> = {
  new:       "bg-violet-100 text-violet-700",
  contacted: "bg-amber-100 text-amber-700",
  closed:    "bg-slate-100 text-slate-500",
};

export default async function LeadDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const id = parseInt((await params).id, 10);
  if (isNaN(id)) notFound();

  const lead = await prisma.lead.findUnique({ where: { id } });
  if (!lead) notFound();

  const tag   = getActionTag(lead as Lead);
  const color = getActionColor(tag);

  return (
    <div className="space-y-4">
      {/* Back */}
      <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 transition-colors">
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
        </svg>
        All Leads
      </Link>

      {/* Header card */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold text-slate-900">
              {lead.name ?? lead.phone}
            </h1>
            {lead.name && (
              <p className="text-sm text-slate-500 mt-0.5">{lead.phone}</p>
            )}
          </div>
          <span className={`shrink-0 text-xs font-semibold px-2.5 py-1 rounded-full ${statusBadge[lead.status] ?? statusBadge.new}`}>
            {lead.status}
          </span>
        </div>

        {/* Detail grid */}
        <div className="mt-4 grid grid-cols-2 gap-x-6 gap-y-2.5 text-sm border-t border-slate-100 pt-4">
          {lead.projectName && (
            <>
              <span className="text-slate-400 font-medium">Project</span>
              <span className="text-slate-900">{lead.projectName}</span>
            </>
          )}
          {lead.source && (
            <>
              <span className="text-slate-400 font-medium">Source</span>
              <span className="text-slate-900">{lead.source}</span>
            </>
          )}
          <span className="text-slate-400 font-medium">Added</span>
          <span className="text-slate-900">
            {new Date(lead.createdAt).toLocaleDateString("en-IN", {
              day: "numeric", month: "short", year: "numeric",
            })}
          </span>
        </div>

        {lead.notes && (
          <div className="mt-4 border-t border-slate-100 pt-4">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1.5">Initial Notes</p>
            <p className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">{lead.notes}</p>
          </div>
        )}
      </div>

      {/* Next action */}
      <div className={`rounded-2xl border p-4 ${urgencyCard[color]}`}>
        <p className="text-xs font-semibold uppercase tracking-wide opacity-60 mb-0.5">Next Action</p>
        <p className="text-base font-bold">{tag}</p>
      </div>

      {/* Suggested reply + actions */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">Suggested Reply</p>
        <p className="text-sm text-slate-700 leading-relaxed italic">
          &ldquo;{SUGGESTED_REPLY}&rdquo;
        </p>
        <LeadActions leadId={String(lead.id)} leadStatus={lead.status} suggestedReply={SUGGESTED_REPLY} />
      </div>

      {/* Notes timeline */}
      <NotesTimeline leadId={lead.id} />
    </div>
  );
}
