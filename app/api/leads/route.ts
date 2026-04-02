import prisma from "@/lib/prisma";
import { extractBudget, extractRequirement } from "@/lib/utils";

export async function GET() {
  const leads = await prisma.lead.findMany({
    orderBy: { created_at: "desc" },
  });
  return Response.json(leads);
}

export async function POST(request: Request) {
  const body = await request.json();
  const { raw_message } = body;

  if (!raw_message || typeof raw_message !== "string") {
    return Response.json({ error: "raw_message is required" }, { status: 400 });
  }

  const lead = await prisma.lead.create({
    data: {
      raw_message,
      requirement: extractRequirement(raw_message),
      budget: extractBudget(raw_message),
      status: "new",
    },
  });

  return Response.json(lead, { status: 201 });
}
