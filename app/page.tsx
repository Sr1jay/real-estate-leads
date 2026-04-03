import LeadsList from "./LeadsList";

export default function HomePage() {
  return (
    <div>
      <div className="mb-5">
        <h1 className="text-2xl font-bold text-slate-900">Leads</h1>
        <p className="text-sm text-slate-500 mt-0.5">Your pipeline at a glance</p>
      </div>
      <LeadsList />
    </div>
  );
}
