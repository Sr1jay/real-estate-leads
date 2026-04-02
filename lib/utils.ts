export type Lead = {
  id: string;
  raw_message: string;
  requirement: string;
  budget: string;
  status: string;
  created_at: Date | string;
  last_contacted: Date | string | null;
};

export function extractRequirement(message: string): string {
  // Match BHK patterns like 2BHK, 3 BHK, 1bhk
  const bhkMatch = message.match(/\d\s*bhk/i);

  // Common location keywords (can be extended)
  const locationKeywords = [
    "wakad", "baner", "kharadi", "pune", "mumbai", "delhi", "bangalore",
    "hinjewadi", "viman nagar", "hadapsar", "pimple", "aundh", "koregaon",
    "shivaji nagar", "deccan", "kalyani nagar", "magarpatta", "undri",
    "wagholi", "nibm", "wanowrie", "kondhwa", "katraj", "ambegaon",
    "balaji nagar", "sus road", "pashan",
  ];

  const msgLower = message.toLowerCase();
  const locationMatch = locationKeywords.find((loc) => msgLower.includes(loc));

  if (bhkMatch && locationMatch) {
    return `${bhkMatch[0].toUpperCase()} in ${locationMatch.charAt(0).toUpperCase() + locationMatch.slice(1)}`;
  }
  if (bhkMatch) {
    return bhkMatch[0].toUpperCase();
  }
  if (locationMatch) {
    return `Property in ${locationMatch.charAt(0).toUpperCase() + locationMatch.slice(1)}`;
  }

  // Fallback: first meaningful sentence (>10 chars)
  const sentences = message.split(/[.!?]/);
  const first = sentences.find((s) => s.trim().length > 10);
  return first ? first.trim().substring(0, 80) : message.trim().substring(0, 80);
}

export function extractBudget(message: string): string {
  // Match patterns like ₹50L, 50 lakh, 1.5 crore, 80L, Rs. 40L, 1Cr
  const patterns = [
    /(?:₹|rs\.?|inr)?\s*(\d+(?:\.\d+)?)\s*(?:cr(?:ore)?s?)/i,
    /(?:₹|rs\.?|inr)?\s*(\d+(?:\.\d+)?)\s*(?:l(?:akh)?s?|lac)/i,
    /(?:₹|rs\.?|inr)\s*(\d+(?:\.\d+)?(?:\s*(?:to|-)\s*\d+(?:\.\d+)?)?)/i,
    /(\d+(?:\.\d+)?)\s*(?:cr(?:ore)?s?)/i,
    /(\d+(?:\.\d+)?)\s*(?:l(?:akh)?s?|lac)/i,
  ];

  for (const pattern of patterns) {
    const match = message.match(pattern);
    if (match) {
      return match[0].trim();
    }
  }

  return "Not specified";
}

export function getDaysSince(date: Date | string | null): number {
  if (!date) return Infinity;
  const then = new Date(date).getTime();
  const now = Date.now();
  return Math.floor((now - then) / (1000 * 60 * 60 * 24));
}

export function getActionTag(lead: Lead): string {
  if (lead.status === "new") {
    return "Respond immediately (hot lead)";
  }
  if (lead.status === "closed") {
    return "No action needed";
  }
  const days = getDaysSince(lead.last_contacted);
  if (days >= 5) {
    return "Lead going cold";
  }
  if (days >= 2) {
    return "Follow up today";
  }
  return "No action needed";
}

export function getActionColor(tag: string): string {
  if (tag === "Respond immediately (hot lead)" || tag === "Lead going cold") {
    return "red";
  }
  if (tag === "Follow up today") {
    return "orange";
  }
  return "green";
}

export const SUGGESTED_REPLY =
  "Hi, I have a few options matching your requirement. Would you like to schedule a visit or get more details?";

// Sort leads by urgency: new > cold > follow up > no action
const urgencyOrder: Record<string, number> = {
  "Respond immediately (hot lead)": 0,
  "Lead going cold": 1,
  "Follow up today": 2,
  "No action needed": 3,
};

export function sortByUrgency(leads: Lead[]): Lead[] {
  return [...leads].sort((a, b) => {
    const tagA = getActionTag(a);
    const tagB = getActionTag(b);
    return (urgencyOrder[tagA] ?? 4) - (urgencyOrder[tagB] ?? 4);
  });
}
