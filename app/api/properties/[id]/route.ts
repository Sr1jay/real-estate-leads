import prisma from "@/lib/prisma";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const id = parseInt((await params).id, 10);
  if (isNaN(id)) return Response.json({ error: "Invalid id" }, { status: 400 });

  const property = await prisma.property.findUnique({ where: { id } });
  if (!property) return Response.json({ error: "Not found" }, { status: 404 });
  return Response.json(property);
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
    const fields = ["title", "type", "location", "status", "description"] as const;
    for (const f of fields) {
      if (f in body) data[f] = body[f]?.trim() || null;
    }
    if ("priceMin" in body) data.priceMin = body.priceMin != null ? Number(body.priceMin) : null;
    if ("priceMax" in body) data.priceMax = body.priceMax != null ? Number(body.priceMax) : null;

    const property = await prisma.property.update({ where: { id }, data });
    return Response.json(property);
  } catch {
    return Response.json({ error: "Failed to update property" }, { status: 500 });
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const id = parseInt((await params).id, 10);
  if (isNaN(id)) return Response.json({ error: "Invalid id" }, { status: 400 });

  try {
    await prisma.property.delete({ where: { id } });
    return new Response(null, { status: 204 });
  } catch {
    return Response.json({ error: "Failed to delete property" }, { status: 500 });
  }
}
