import prisma from "@/lib/prisma";
import { getActionTag, getActionColor, getDaysSince, sortByUrgency, type Lead } from "@/lib/utils";
import Link from "next/link";

export const dynamic = "force-dynamic";

const colorClasses: Record<string, string> = {
  red: "bg-red-100 text-red-700 border-red-200",
  orange: "bg-orange-100 text-orange-700 border-orange-200",
  green: "bg-green-100 text-green-700 border-green-200",
};

export default async function HomePage() {
  const rawLeads = await prisma.lead.findMany({ orderBy: { createdAt: "desc" } });
  const leads = sortByUrgency(rawLeads as Lead[]);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">All Leads</h1>
        <p className="text-sm text-gray-500 mt-1">
          {leads.length} lead{leads.length !== 1 ? "s" : ""} total
        </p>
      </div>

      {leads.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <p className="text-4xl mb-3">📋</p>
          <p className="text-lg font-medium text-gray-500">No leads yet</p>
          <p className="text-sm mt-1">Add your first lead to get started.</p>
          <Link
            href="/add"
            className="mt-4 inline-block bg-blue-600 text-white text-sm font-medium px-5 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Add Lead
          </Link>
        </div>
      ) : (
        <ul className="space-y-3">
          {leads.map((lead) => {
            const tag = getActionTag(lead as Lead);
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
                      <span
                        className={`inline-block text-xs font-semibold px-2.5 py-1 rounded-full border ${colorClasses[color]}`}
                      >
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
