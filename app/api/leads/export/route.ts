import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { utils, write } from "xlsx";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const status = searchParams.get("status") ?? undefined;
    const source = searchParams.get("source") ?? undefined;
    const search = searchParams.get("search")?.trim() ?? undefined;

    const leads = await prisma.lead.findMany({
      where: {
        ...(status ? { status } : {}),
        ...(source ? { source } : {}),
        ...(search
          ? {
              OR: [
                { name: { contains: search, mode: "insensitive" } },
                { phone: { contains: search } },
                { projectName: { contains: search, mode: "insensitive" } },
              ],
            }
          : {}),
      },
      orderBy: { createdAt: "desc" },
    });

    const rows = leads.map((l) => ({
      Name:         l.name ?? "",
      Phone:        l.phone,
      "Project / Interest": l.projectName ?? "",
      Source:       l.source ?? "",
      Status:       l.status,
      "Follow-up":  l.followUpAt
        ? new Date(l.followUpAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })
        : "",
      Notes:        l.notes ?? "",
      Added:        new Date(l.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }),
    }));

    const ws = utils.json_to_sheet(rows);

    // Column widths
    ws["!cols"] = [
      { wch: 22 }, { wch: 16 }, { wch: 28 },
      { wch: 14 }, { wch: 12 }, { wch: 14 },
      { wch: 40 }, { wch: 14 },
    ];

    const wb = utils.book_new();
    utils.book_append_sheet(wb, ws, "Leads");

    const buffer = write(wb, { type: "buffer", bookType: "xlsx" }) as Buffer;
    const date = new Date().toISOString().slice(0, 10);

    return new Response(new Uint8Array(buffer), {
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="leads-${date}.xlsx"`,
      },
    });
  } catch {
    return Response.json({ error: "Export failed" }, { status: 500 });
  }
}
