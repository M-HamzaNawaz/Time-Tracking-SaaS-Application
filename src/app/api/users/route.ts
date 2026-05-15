import { NextResponse as Response } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/db";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "admin") {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const organizationId = session.user.organizationId;

    const users = await prisma.user.findMany({
      where: { organizationId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    });

    const invitations = await prisma.invitation.findMany({
      where: { status: "pending", organizationId },
      select: {
        id: true,
        email: true,
        role: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return Response.json({ users, invitations });
  } catch (error) {
    console.error("Failed to fetch users:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
