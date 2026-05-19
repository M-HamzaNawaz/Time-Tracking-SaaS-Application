import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/db";
import { buildCsv, formatHms } from "@/lib/csv";
import type { Prisma } from "@prisma/client";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = req.nextUrl;
  const from = searchParams.get("from");
  const to = searchParams.get("to");

  const where: Prisma.TimeLogWhereInput = { userId: session.user.id };
  if (from || to) {
    where.startTime = {};
    if (from) where.startTime.gte = new Date(from);
    if (to) where.startTime.lte = new Date(to);
  }

  const logs = await prisma.timeLog.findMany({
    where,
    orderBy: { startTime: "desc" },
    include: {
      project: { select: { name: true, clientName: true } },
    },
  });

  const headers = [
    "Date",
    "Project",
    "Client",
    "Start",
    "End",
    "Duration (seconds)",
    "Duration (hh:mm:ss)",
    "Note",
  ];

  const rows = logs.map((log) => [
    log.startTime.toISOString().slice(0, 10),
    log.project?.name ?? log.projectName,
    log.project?.clientName ?? "",
    log.startTime.toISOString(),
    log.endTime?.toISOString() ?? "",
    log.duration ?? "",
    log.duration != null ? formatHms(log.duration) : "",
    log.note ?? "",
  ]);

  const csv = buildCsv(headers, rows);
  const filename = `my-time-logs-${new Date().toISOString().slice(0, 10)}.csv`;

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
