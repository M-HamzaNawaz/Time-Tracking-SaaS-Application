import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/db";

async function authorize(logId: string) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return { error: "Unauthorized", status: 401 as const };
  }

  const log = await prisma.timeLog.findUnique({ where: { id: logId } });

  if (!log) {
    return { error: "Time log not found", status: 404 as const };
  }

  if (log.userId !== session.user.id && session.user.role !== "admin") {
    return { error: "Forbidden", status: 403 as const };
  }

  return { log };
}

export async function PATCH(req: NextRequest, ctx: RouteContext<"/api/time/logs/[id]">) {
  try {
    const { id } = await ctx.params;
    const result = await authorize(id);

    if ("error" in result) {
      return NextResponse.json({ error: result.error }, { status: result.status });
    }

    const { projectName, note, startTime, endTime } = await req.json();

    const data: {
      projectName?: string;
      note?: string | null;
      startTime?: Date;
      endTime?: Date;
      duration?: number;
    } = {};

    if (typeof projectName === "string" && projectName.trim()) {
      data.projectName = projectName.trim();
    }

    if (typeof note === "string") {
      data.note = note.trim() ? note.trim() : null;
    }

    const newStart = startTime ? new Date(startTime) : result.log.startTime;
    const newEnd = endTime ? new Date(endTime) : result.log.endTime;

    if (startTime || endTime) {
      if (startTime && isNaN(newStart.getTime())) {
        return NextResponse.json({ error: "Invalid start time" }, { status: 400 });
      }
      if (endTime && (!newEnd || isNaN(newEnd.getTime()))) {
        return NextResponse.json({ error: "Invalid end time" }, { status: 400 });
      }
      if (newEnd && newEnd.getTime() <= newStart.getTime()) {
        return NextResponse.json(
          { error: "End time must be after start time" },
          { status: 400 }
        );
      }
      if (startTime) data.startTime = newStart;
      if (endTime) data.endTime = newEnd as Date;
      if (newEnd) {
        data.duration = Math.floor((newEnd.getTime() - newStart.getTime()) / 1000);
      }
    }

    const updated = await prisma.timeLog.update({ where: { id }, data });

    return NextResponse.json({ log: updated });
  } catch (error) {
    console.error("Update time log error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, ctx: RouteContext<"/api/time/logs/[id]">) {
  try {
    const { id } = await ctx.params;
    const result = await authorize(id);

    if ("error" in result) {
      return NextResponse.json({ error: result.error }, { status: result.status });
    }

    await prisma.timeLog.delete({ where: { id } });

    return NextResponse.json({ message: "Time log deleted" });
  } catch (error) {
    console.error("Delete time log error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
