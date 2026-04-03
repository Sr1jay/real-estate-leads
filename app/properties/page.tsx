import prisma from "@/lib/prisma";
import Link from "next/link";

export const dynamic = "force-dynamic";

const statusBadge: Record<string, string> = {
  available: "bg-emerald-100 text-emerald-700",
  hold:      "bg-amber-100 text-amber-700",
  sold:      "bg-slate-100 text-slate-500",
};

function fmt(n: number | null) {
  if (n == null) return null;
  return n >= 100 ? `₹${(n / 100).toFixed(n % 100 === 0 ? 0 : 1)}Cr` : `₹${n}L`;
}

export default async function PropertiesPage() {
  const properties = await prisma.property.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <div>
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Properties</h1>
          <p className="text-sm text-slate-500 mt-0.5">Your inventory</p>
        </div>
        <Link
          href="/properties/add"
          className="bg-indigo-600 text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
        >
          + Add Property
        </Link>
      </div>

      {properties.length === 0 ? (
        <div className="text-center py-20 text-slate-400">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-slate-100 rounded-2xl mb-4">
            <svg className="h-7 w-7 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3.75h.008v.008h-.008v-.008Zm0 3h.008v.008h-.008v-.008Zm0 3h.008v.008h-.008v-.008Z" />
            </svg>
          </div>
          <p className="text-base font-semibold text-slate-600">No properties yet</p>
          <p className="text-sm mt-1">Add your first property to start matching leads.</p>
        </div>
      ) : (
        <ul className="space-y-2">
          {properties.map((p) => {
            const min = fmt(p.priceMin);
            const max = fmt(p.priceMax);
            const price = min && max ? `${min} – ${max}` : min ?? max ?? null;

            return (
              <li key={p.id}>
                <Link
                  href={`/properties/${p.id}`}
                  className="flex items-start gap-4 bg-white border border-slate-200 rounded-xl px-4 py-3.5 hover:border-indigo-300 hover:shadow-sm transition-all"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-900 truncate">{p.title}</p>
                    <div className="flex items-center gap-1.5 mt-0.5 flex-wrap text-xs text-slate-400">
                      <span>{p.location}</span>
                      {p.type     && <span>· {p.type}</span>}
                      {price      && <span>· {price}</span>}
                    </div>
                  </div>
                  <span className={`shrink-0 text-xs font-semibold px-2.5 py-1 rounded-full ${statusBadge[p.status] ?? statusBadge.available}`}>
                    {p.status.charAt(0).toUpperCase() + p.status.slice(1)}
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
