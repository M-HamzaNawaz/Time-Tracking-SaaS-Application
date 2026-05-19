import { NextResponse } from "next/server";
import crypto from "crypto";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/db";
import { sendEmail } from "@/lib/email";

export async function POST() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({ where: { id: session.user.id } });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  if (user.isVerified) {
    return NextResponse.json({ message: "Email already verified" });
  }

  const token = crypto.randomBytes(32).toString("hex");

  await prisma.emailVerification.create({
    data: {
      userId: user.id,
      token,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
    },
  });

  const verifyLink = `${process.env.NEXTAUTH_URL}/verify-email?token=${token}`;
  console.log(`[VERIFY LINK FOR ${user.email}]:`, verifyLink);

  await sendEmail({
    to: user.email,
    subject: "Verify your TimeTracker email",
    html: `<p>Click below to verify your email.</p><p><a href="${verifyLink}">Verify email</a></p>`,
    label: "verify-email-resend",
  });

  return NextResponse.json({ message: "Verification email sent" });
}
