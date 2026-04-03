import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const status = request.nextUrl.searchParams.get("status") ?? undefined;
    const properties = await prisma.property.findMany({
      where: status ? { status } : undefined,
      orderBy: { createdAt: "desc" },
    });
    return Response.json(properties);
  } catch {
    return Response.json({ error: "Failed to fetch properties" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, type, location, priceMin, priceMax, status, description } = body;

    if (!title?.trim() || !location?.trim()) {
      return Response.json({ error: "title and location are required" }, { status: 400 });
    }

    const property = await prisma.property.create({
      data: {
        title:       title.trim(),
        type:        type?.trim()        || null,
        location:    location.trim(),
        priceMin:    priceMin != null    ? Number(priceMin)  : null,
        priceMax:    priceMax != null    ? Number(priceMax)  : null,
        status:      status              ?? "available",
        description: description?.trim() || null,
      },
    });
    return Response.json(property, { status: 201 });
  } catch {
    return Response.json({ error: "Failed to create property" }, { status: 500 });
  }
}
