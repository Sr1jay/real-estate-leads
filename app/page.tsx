import LeadsList from "./LeadsList";
import Link from "next/link";

export default function HomePage() {
  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">All Leads</h1>
        </div>
        <Link
          href="/add"
          className="bg-blue-600 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          + Add Lead
        </Link>
      </div>
      <LeadsList />
    </div>
  );
}
