import prisma from "@/lib/prisma";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const id = parseInt((await params).id, 10);

  if (isNaN(id)) {
    return Response.json({ error: "Invalid id" }, { status: 400 });
  }

  const lead = await prisma.lead.findUnique({ where: { id } });

  if (!lead) {
    return Response.json({ error: "Lead not found" }, { status: 404 });
  }

  return Response.json(lead);
}
