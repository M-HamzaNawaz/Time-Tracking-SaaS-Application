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

    const { projectId } = await req.json();

    if (!projectId) {
      return NextResponse.json({ error: "Project is required" }, { status: 400 });
    }

    const project = await prisma.project.findUnique({ where: { id: projectId } });

    if (!project || project.organizationId !== session.user.organizationId) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    if (project.archived) {
      return NextResponse.json(
        { error: "Cannot track time against an archived project" },
        { status: 400 }
      );
    }

    const openLog = await prisma.timeLog.findFirst({
      where: { userId: session.user.id, endTime: null },
    });

    if (openLog) {
      return NextResponse.json(
        { error: "You already have a running timer" },
        { status: 409 }
      );
    }

    const timeLog = await prisma.timeLog.create({
      data: {
        userId: session.user.id,
        projectId: project.id,
        projectName: project.name,
        startTime: new Date(),
      },
    });

    return NextResponse.json({ logId: timeLog.id, startTime: timeLog.startTime });
  } catch (error) {
    console.error("Start timer error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
