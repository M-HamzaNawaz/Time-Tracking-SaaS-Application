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

    const { projectName, startTime, endTime, note } = await req.json();

    if (!projectName || !projectName.trim()) {
      return NextResponse.json({ error: "Project name is required" }, { status: 400 });
    }

    if (!startTime || !endTime) {
      return NextResponse.json(
        { error: "Start and end time are required" },
        { status: 400 }
      );
    }

    const start = new Date(startTime);
    const end = new Date(endTime);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return NextResponse.json({ error: "Invalid start or end time" }, { status: 400 });
    }

    if (end.getTime() <= start.getTime()) {
      return NextResponse.json(
        { error: "End time must be after start time" },
        { status: 400 }
      );
    }

    if (start.getTime() > Date.now()) {
      return NextResponse.json(
        { error: "Start time cannot be in the future" },
        { status: 400 }
      );
    }

    const timeLog = await prisma.timeLog.create({
      data: {
        userId: session.user.id,
        projectName: projectName.trim(),
        startTime: start,
        endTime: end,
        duration: Math.floor((end.getTime() - start.getTime()) / 1000),
        note: typeof note === "string" && note.trim() ? note.trim() : null,
      },
    });

    return NextResponse.json({ log: timeLog });
  } catch (error) {
    console.error("Manual time entry error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
