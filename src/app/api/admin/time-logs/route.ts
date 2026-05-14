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
    const userId = searchParams.get("userId");
    const from = searchParams.get("from");
    const to = searchParams.get("to");

    const where: Prisma.TimeLogWhereInput = {};

    if (userId) {
      where.userId = userId;
    }

    if (from || to) {
      where.startTime = {};
      if (from) where.startTime.gte = new Date(from);
      if (to) where.startTime.lte = new Date(to);
    }

    const logs = await prisma.timeLog.findMany({
      where,
      orderBy: { startTime: "desc" },
      take: 200,
      include: {
        user: { select: { name: true, email: true } },
      },
    });

    return NextResponse.json({ logs });
  } catch (error) {
    console.error("Admin time logs error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
