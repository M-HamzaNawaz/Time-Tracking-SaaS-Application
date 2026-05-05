import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/db";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { logId } = await req.json();

    if (!logId) {
      return NextResponse.json({ error: "Log ID is required" }, { status: 400 });
    }

    const timeLog = await prisma.timeLog.findUnique({
      where: { id: logId },
    });

    if (!timeLog) {
      return NextResponse.json({ error: "Time log not found" }, { status: 404 });
    }

    if (timeLog.userId !== session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    if (timeLog.endTime) {
      return NextResponse.json({ error: "Timer already stopped" }, { status: 400 });
    }

    const endTime = new Date();
    const duration = Math.floor((endTime.getTime() - timeLog.startTime.getTime()) / 1000);

    const updatedLog = await prisma.timeLog.update({
      where: { id: logId },
      data: {
        endTime,
        duration,
      },
    });

    return NextResponse.json({ message: "Timer stopped", log: updatedLog });
  } catch (error) {
    console.error("Stop timer error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
