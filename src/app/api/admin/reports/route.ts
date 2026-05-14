import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/db";
import type { Prisma } from "@prisma/client";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = req.nextUrl;
    const from = searchParams.get("from");
    const to = searchParams.get("to");

    // Only completed entries contribute to totals.
    const where: Prisma.TimeLogWhereInput = { duration: { not: null } };

    if (from || to) {
      where.startTime = {};
      if (from) where.startTime.gte = new Date(from);
      if (to) where.startTime.lte = new Date(to);
    }

    const [byUserRaw, byProjectRaw, users] = await Promise.all([
      prisma.timeLog.groupBy({
        by: ["userId"],
        where,
        _sum: { duration: true },
        _count: { _all: true },
      }),
      prisma.timeLog.groupBy({
        by: ["projectName"],
        where,
        _sum: { duration: true },
        _count: { _all: true },
      }),
      prisma.user.findMany({ select: { id: true, name: true, email: true } }),
    ]);

    const userMap = new Map(users.map((u) => [u.id, u]));

    const byUser = byUserRaw
      .map((row) => ({
        userId: row.userId,
        name: userMap.get(row.userId)?.name ?? null,
        email: userMap.get(row.userId)?.email ?? "Unknown",
        totalSeconds: row._sum.duration ?? 0,
        entries: row._count._all,
      }))
      .sort((a, b) => b.totalSeconds - a.totalSeconds);

    const byProject = byProjectRaw
      .map((row) => ({
        projectName: row.projectName,
        totalSeconds: row._sum.duration ?? 0,
        entries: row._count._all,
      }))
      .sort((a, b) => b.totalSeconds - a.totalSeconds);

    const totalSeconds = byUser.reduce((sum, u) => sum + u.totalSeconds, 0);

    return NextResponse.json({ byUser, byProject, totalSeconds });
  } catch (error) {
    console.error("Admin reports error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
