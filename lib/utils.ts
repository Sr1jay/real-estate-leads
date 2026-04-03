export type Lead = {
  id: number;
  name: string | null;
  phone: string;
  projectName: string | null;
  source: string | null;
  status: string;
  notes: string | null;
  followUpAt: Date | string | null;
  createdAt: Date | string;
};

export function getActionTag(lead: Lead): string {
  if (lead.status === "new") return "Respond immediately (hot lead)";
  if (lead.status === "closed") return "No action needed";
  if (lead.status === "contacted") return "Follow up today";
  return "No action needed";
}

export function getActionColor(tag: string): string {
  if (tag === "Respond immediately (hot lead)") return "red";
  if (tag === "Follow up today") return "orange";
  return "green";
}

export function getDaysSince(date: Date | string): number {
  const then = new Date(date).getTime();
  return Math.floor((Date.now() - then) / (1000 * 60 * 60 * 24));
}

export type FollowUpUrgency = "overdue" | "today" | "upcoming" | null;

export function getFollowUpUrgency(lead: Lead): FollowUpUrgency {
  if (!lead.followUpAt || lead.status === "closed") return null;
  const due = new Date(lead.followUpAt);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  due.setHours(0, 0, 0, 0);
  const diff = Math.round((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  if (diff < 0) return "overdue";
  if (diff === 0) return "today";
  return "upcoming";
}

export const SUGGESTED_REPLY =
  "Hi, I have a few options matching your requirement. Would you like to schedule a visit or get more details?";

const urgencyOrder: Record<string, number> = {
  "Respond immediately (hot lead)": 0,
  "Follow up today": 1,
  "No action needed": 2,
};

export function sortByUrgency(leads: Lead[]): Lead[] {
  return [...leads].sort((a, b) => {
    return (urgencyOrder[getActionTag(a)] ?? 3) - (urgencyOrder[getActionTag(b)] ?? 3);
  });
}
