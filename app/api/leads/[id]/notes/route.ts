import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const id = parseInt((await params).id, 10);
  if (isNaN(id)) return Response.json({ error: "Invalid id" }, { status: 400 });

  try {
    const notes = await prisma.leadNote.findMany({
      where: { leadId: id },
      orderBy: { createdAt: "desc" },
    });
    return Response.json(notes);
  } catch {
    return Response.json({ error: "Failed to fetch notes" }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const id = parseInt((await params).id, 10);
  if (isNaN(id)) return Response.json({ error: "Invalid id" }, { status: 400 });

  try {
    const body = await request.json();
    const content = body?.content;

    if (!content || typeof content !== "string" || content.trim() === "") {
      return Response.json({ error: "content is required" }, { status: 400 });
    }

    const note = await prisma.leadNote.create({
      data: { leadId: id, content: content.trim() },
    });

    return Response.json(note, { status: 201 });
  } catch {
    return Response.json({ error: "Failed to create note" }, { status: 500 });
  }
}
