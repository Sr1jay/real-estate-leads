import prisma from "@/lib/prisma";
import { getActionTag, getActionColor, SUGGESTED_REPLY, type Lead } from "@/lib/utils";
import { notFound } from "next/navigation";
import LeadActions from "./LeadActions";

export const dynamic = "force-dynamic";

const colorClasses: Record<string, string> = {
  red: "bg-red-100 text-red-800 border border-red-200",
  orange: "bg-orange-100 text-orange-800 border border-orange-200",
  green: "bg-green-100 text-green-800 border border-green-200",
};

const statusBadge: Record<string, string> = {
  new: "bg-blue-100 text-blue-700",
  contacted: "bg-yellow-100 text-yellow-700",
  closed: "bg-gray-100 text-gray-600",
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

  const tag = getActionTag(lead as Lead);
  const color = getActionColor(tag);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-start gap-3">
        <div className="flex-1">
          <h1 className="text-xl font-bold text-gray-900">
            {lead.name ?? lead.phone}
          </h1>
          <div className="flex items-center gap-2 mt-1">
            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${statusBadge[lead.status] ?? statusBadge.new}`}>
              {lead.status}
            </span>
            {lead.name && (
              <span className="text-sm text-gray-500">{lead.phone}</span>
            )}
          </div>
        </div>
      </div>

      {/* Next Action */}
      <div className={`rounded-xl p-4 ${colorClasses[color]}`}>
        <p className="text-xs font-semibold uppercase tracking-wide opacity-60 mb-1">Next Action</p>
        <p className="text-base font-bold">{tag}</p>
      </div>

      {/* Lead Details */}
      <div className="bg-white border border-gray-200 rounded-xl p-4 space-y-3">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Details</p>
        <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
          <span className="text-gray-500">Phone</span>
          <span className="text-gray-900 font-medium">{lead.phone}</span>
          {lead.projectName && (
            <>
              <span className="text-gray-500">Project</span>
              <span className="text-gray-900">{lead.projectName}</span>
            </>
          )}
          {lead.source && (
            <>
              <span className="text-gray-500">Source</span>
              <span className="text-gray-900">{lead.source}</span>
            </>
          )}
          <span className="text-gray-500">Added</span>
          <span className="text-gray-900">
            {new Date(lead.createdAt).toLocaleDateString("en-IN", {
              day: "numeric", month: "short", year: "numeric",
            })}
          </span>
        </div>
        {lead.notes && (
          <div className="pt-2 border-t border-gray-100">
            <p className="text-xs text-gray-400 mb-1">Notes</p>
            <p className="text-sm text-gray-800 whitespace-pre-wrap">{lead.notes}</p>
          </div>
        )}
      </div>

      {/* Suggested Reply */}
      <div className="bg-white border border-gray-200 rounded-xl p-4">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Suggested Reply</p>
        <p className="text-sm text-gray-800 leading-relaxed italic">&ldquo;{SUGGESTED_REPLY}&rdquo;</p>
        <LeadActions leadId={String(lead.id)} leadStatus={lead.status} suggestedReply={SUGGESTED_REPLY} />
      </div>
    </div>
  );
}
