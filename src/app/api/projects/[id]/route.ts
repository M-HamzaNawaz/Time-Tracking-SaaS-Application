import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/db";

async function authorize(projectId: string) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "admin") {
    return { error: "Unauthorized", status: 401 as const };
  }

  const project = await prisma.project.findUnique({ where: { id: projectId } });

  if (!project) {
    return { error: "Project not found", status: 404 as const };
  }

  if (project.organizationId !== session.user.organizationId) {
    return { error: "Forbidden", status: 403 as const };
  }

  return { project };
}

export async function PATCH(req: NextRequest, ctx: RouteContext<"/api/projects/[id]">) {
  try {
    const { id } = await ctx.params;
    const result = await authorize(id);

    if ("error" in result) {
      return NextResponse.json({ error: result.error }, { status: result.status });
    }

    const { name, clientName, archived } = await req.json();

    const data: { name?: string; clientName?: string | null; archived?: boolean } = {};

    if (typeof name === "string") {
      if (!name.trim()) {
        return NextResponse.json({ error: "Project name cannot be empty" }, { status: 400 });
      }
      data.name = name.trim();
    }

    if (clientName !== undefined) {
      data.clientName =
        typeof clientName === "string" && clientName.trim() ? clientName.trim() : null;
    }

    if (typeof archived === "boolean") {
      data.archived = archived;
    }

    const updated = await prisma.project.update({ where: { id }, data });

    return NextResponse.json({ project: updated });
  } catch (error) {
    console.error("Update project error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
