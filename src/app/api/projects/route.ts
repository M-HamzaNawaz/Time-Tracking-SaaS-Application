import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const includeArchived = req.nextUrl.searchParams.get("archived") === "true";

    const projects = await prisma.project.findMany({
      where: {
        organizationId: session.user.organizationId,
        ...(includeArchived ? {} : { archived: false }),
      },
      orderBy: [{ archived: "asc" }, { name: "asc" }],
    });

    return NextResponse.json({ projects });
  } catch (error) {
    console.error("List projects error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { name, clientName } = await req.json();

    if (!name?.trim()) {
      return NextResponse.json({ error: "Project name is required" }, { status: 400 });
    }

    const project = await prisma.project.create({
      data: {
        name: name.trim(),
        clientName: clientName?.trim() || null,
        organizationId: session.user.organizationId,
      },
    });

    return NextResponse.json({ project });
  } catch (error) {
    console.error("Create project error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
