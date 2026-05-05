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

    const { projectName } = await req.json();

    const timeLog = await prisma.timeLog.create({
      data: {
        userId: session.user.id,
        projectName: projectName || "Untitled Project",
        startTime: new Date(),
      },
    });

    return NextResponse.json({ logId: timeLog.id, startTime: timeLog.startTime });
  } catch (error) {
    console.error("Start timer error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
