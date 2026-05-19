import { NextResponse } from "next/server";
import crypto from "crypto";
import prisma from "@/lib/db";
import { sendEmail } from "@/lib/email";
import { checkRateLimit, getClientIp } from "@/lib/rateLimit";

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email || typeof email !== "string") {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const rate = checkRateLimit(
      `forgot:${getClientIp(req)}:${email.trim().toLowerCase()}`,
      5,
      60 * 60 * 1000
    );
    if (!rate.ok) {
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        { status: 429, headers: { "Retry-After": String(rate.retryAfter) } }
      );
    }

    const user = await prisma.user.findUnique({ where: { email: email.trim() } });

    // Always respond as if the request succeeded so callers can't enumerate
    // which emails are registered.
    if (user) {
      const token = crypto.randomBytes(32).toString("hex");

      await prisma.passwordReset.create({
        data: {
          userId: user.id,
          token,
          expiresAt: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
        },
      });

      const resetLink = `${process.env.NEXTAUTH_URL}/reset-password?token=${token}`;
      console.log(`[PASSWORD RESET LINK FOR ${user.email}]:`, resetLink);

      await sendEmail({
        to: user.email,
        subject: "Reset your TimeTracker password",
        html: `<p>You requested a password reset. The link is valid for one hour.</p><p><a href="${resetLink}">Reset password</a></p><p>If you didn't request this, you can ignore this email.</p>`,
        label: "password-reset",
      });
    }

    return NextResponse.json({
      message: "If an account exists for that email, a reset link has been sent.",
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
