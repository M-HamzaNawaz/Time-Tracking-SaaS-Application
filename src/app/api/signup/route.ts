import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { sendEmail } from "@/lib/email";

export async function POST(req: Request) {
  try {
    const { name, email, password, organizationName } = await req.json();

    if (!name?.trim() || !email?.trim() || !password || !organizationName?.trim()) {
      return NextResponse.json(
        { error: "Name, email, password, and organization name are required" },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters" },
        { status: 400 }
      );
    }

    const existingUser = await prisma.user.findUnique({
      where: { email: email.trim() },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "An account with this email already exists" },
        { status: 409 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const verificationToken = crypto.randomBytes(32).toString("hex");

    const user = await prisma.$transaction(async (tx) => {
      const org = await tx.organization.create({
        data: { name: organizationName.trim() },
      });

      const created = await tx.user.create({
        data: {
          name: name.trim(),
          email: email.trim(),
          password: hashedPassword,
          role: "admin",
          isVerified: false,
          organizationId: org.id,
        },
      });

      await tx.emailVerification.create({
        data: {
          userId: created.id,
          token: verificationToken,
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
        },
      });

      return created;
    });

    const verifyLink = `${process.env.NEXTAUTH_URL}/verify-email?token=${verificationToken}`;
    console.log(`[VERIFY LINK FOR ${user.email}]:`, verifyLink);
    await sendEmail({
      to: user.email,
      subject: "Verify your TimeTracker email",
      html: `<p>Welcome to TimeTracker! Please confirm your email to finish setting up your account.</p><p><a href="${verifyLink}">Verify email</a></p>`,
      label: "verify-email",
    });

    return NextResponse.json({ message: "Account created successfully" });
  } catch (error) {
    console.error("Signup error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
