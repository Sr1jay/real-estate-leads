import prisma from "@/lib/prisma";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const lead = await prisma.lead.findUnique({ where: { id } });

  if (!lead) {
    return Response.json({ error: "Lead not found" }, { status: 404 });
  }

  const updated = await prisma.lead.update({
    where: { id },
    data: { status: "closed" },
  });

  return Response.json(updated);
}
