import type { Lead } from "./utils";

export type Property = {
  id: number;
  title: string;
  type: string | null;
  location: string;
  priceMin: number | null;
  priceMax: number | null;
  status: string;
  description: string | null;
  createdAt: Date | string;
};

function words(text: string): Set<string> {
  return new Set(
    text
      .toLowerCase()
      .split(/[\s,/()\-]+/)
      .filter((w) => w.length > 2)
  );
}

export function scoreLeadProperty(lead: Lead, property: Property): number {
  if (property.status === "sold") return 0;

  const leadWords = words(
    [lead.projectName, lead.notes].filter(Boolean).join(" ")
  );
  const propWords = words(
    [property.title, property.location, property.type, property.description]
      .filter(Boolean)
      .join(" ")
  );

  let score = 0;
  for (const w of leadWords) {
    if (propWords.has(w)) score++;
  }
  return score;
}

export function matchPropertiesForLead(
  lead: Lead,
  properties: Property[],
  topN = 3
): Property[] {
  return properties
    .map((p) => ({ p, score: scoreLeadProperty(lead, p) }))
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, topN)
    .map(({ p }) => p);
}

export function matchLeadsForProperty(
  property: Property,
  leads: Lead[],
  topN = 5
): Lead[] {
  return leads
    .filter((l) => l.status !== "closed")
    .map((l) => ({ l, score: scoreLeadProperty(l, property) }))
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, topN)
    .map(({ l }) => l);
}
