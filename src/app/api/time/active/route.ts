import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/db";
import { STALE_TIMER_SECONDS } from "@/lib/timer";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const openLog = await prisma.timeLog.findFirst({
      where: { userId: session.user.id, endTime: null },
      orderBy: { startTime: "desc" },
    });

    if (!openLog) {
      return NextResponse.json({ active: null });
    }

    const elapsedSeconds = Math.floor((Date.now() - openLog.startTime.getTime()) / 1000);

    // Timer was left running too long — auto-close it with a capped duration.
    if (elapsedSeconds > STALE_TIMER_SECONDS) {
      await prisma.timeLog.update({
        where: { id: openLog.id },
        data: {
          endTime: new Date(openLog.startTime.getTime() + STALE_TIMER_SECONDS * 1000),
          duration: STALE_TIMER_SECONDS,
        },
      });
      return NextResponse.json({ active: null, autoClosed: true });
    }

    return NextResponse.json({
      active: {
        id: openLog.id,
        projectName: openLog.projectName,
        startTime: openLog.startTime,
      },
    });
  } catch (error) {
    console.error("Get active timer error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
