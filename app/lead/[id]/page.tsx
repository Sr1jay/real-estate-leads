import prisma from "@/lib/prisma";
import {
  getActionTag,
  getActionColor,
  getDaysSince,
  SUGGESTED_REPLY,
  type Lead,
} from "@/lib/utils";
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
  const { id } = await params;
  const lead = await prisma.lead.findUnique({ where: { id } });

  if (!lead) {
    notFound();
  }

  const tag = getActionTag(lead as Lead);
  const color = getActionColor(tag);
  const days = getDaysSince(lead.last_contacted);
  const daysAgo =
    lead.last_contacted === null
      ? "Never contacted"
      : days === 0
      ? "Contacted today"
      : `Last contacted ${days} day${days !== 1 ? "s" : ""} ago`;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="flex-1">
          <h1 className="text-xl font-bold text-gray-900">{lead.requirement}</h1>
          <div className="flex items-center gap-2 mt-1">
            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${statusBadge[lead.status] ?? statusBadge.new}`}>
              {lead.status}
            </span>
            <span className="text-xs text-gray-400">{daysAgo}</span>
          </div>
        </div>
      </div>

      {/* Next Action */}
      <div className={`rounded-xl p-4 ${colorClasses[color]}`}>
        <p className="text-xs font-semibold uppercase tracking-wide opacity-60 mb-1">Next Action</p>
        <p className="text-base font-bold">{tag}</p>
      </div>

      {/* Raw Message */}
      <div className="bg-white border border-gray-200 rounded-xl p-4">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Original Message</p>
        <p className="text-sm text-gray-800 whitespace-pre-wrap leading-relaxed">{lead.raw_message}</p>
        {lead.budget !== "Not specified" && (
          <p className="mt-3 text-sm text-gray-500">
            <span className="font-medium text-gray-700">Budget:</span> {lead.budget}
          </p>
        )}
      </div>

      {/* Suggested Reply */}
      <div className="bg-white border border-gray-200 rounded-xl p-4">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Suggested Reply</p>
        <p className="text-sm text-gray-800 leading-relaxed italic">&ldquo;{SUGGESTED_REPLY}&rdquo;</p>
        <LeadActions leadId={id} leadStatus={lead.status} suggestedReply={SUGGESTED_REPLY} />
      </div>
    </div>
  );
}
