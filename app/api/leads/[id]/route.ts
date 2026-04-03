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

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const id = parseInt((await params).id, 10);
  if (isNaN(id)) return Response.json({ error: "Invalid id" }, { status: 400 });

  try {
    const body = await request.json();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data: Record<string, any> = {};

    if ("followUpAt" in body) {
      data.followUpAt = body.followUpAt ? new Date(body.followUpAt) : null;
    }
    if ("status" in body && typeof body.status === "string") {
      data.status = body.status;
    }

    const lead = await prisma.lead.update({ where: { id }, data });
    return Response.json(lead);
  } catch {
    return Response.json({ error: "Failed to update lead" }, { status: 500 });
  }
}
