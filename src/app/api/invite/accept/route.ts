import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    const { token, password, name } = await req.json();

    if (!token || !password) {
      return NextResponse.json({ error: "Token and password are required" }, { status: 400 });
    }

    if (!name || !name.trim()) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    // Find invitation
    const invitation = await prisma.invitation.findUnique({
      where: { token },
    });

    if (!invitation) {
      return NextResponse.json({ error: "Invalid invitation token" }, { status: 400 });
    }

    if (invitation.status === "accepted") {
      return NextResponse.json({ error: "Invitation already accepted" }, { status: 400 });
    }

    if (new Date() > invitation.expiresAt) {
      return NextResponse.json({ error: "Invitation expired" }, { status: 400 });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user and update invitation in a transaction
    await prisma.$transaction([
      prisma.user.create({
        data: {
          email: invitation.email,
          name: name.trim(),
          password: hashedPassword,
          role: invitation.role,
          isVerified: true,
        },
      }),
      prisma.invitation.update({
        where: { id: invitation.id },
        data: { status: "accepted" },
      }),
    ]);

    return NextResponse.json({ message: "Account created successfully" });
  } catch (error) {
    console.error("Accept invite error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
