import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const status = request.nextUrl.searchParams.get("status") ?? undefined;

    const leads = await prisma.lead.findMany({
      where: status ? { status } : undefined,
      orderBy: { createdAt: "desc" },
    });

    return Response.json(leads);
  } catch {
    return Response.json({ error: "Failed to fetch leads" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { phone, name, projectName, source, status, notes } = body;

    if (!phone || typeof phone !== "string" || phone.trim() === "") {
      return Response.json({ error: "phone is required" }, { status: 400 });
    }

    const lead = await prisma.lead.create({
      data: {
        phone: phone.trim(),
        name: name?.trim() || null,
        projectName: projectName?.trim() || null,
        source: source?.trim() || null,
        status: status ?? "new",
        notes: notes?.trim() || null,
      },
    });

    return Response.json(lead, { status: 201 });
  } catch {
    return Response.json({ error: "Failed to create lead" }, { status: 500 });
  }
}
