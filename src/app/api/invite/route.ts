import { NextResponse as Response } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/db";
import crypto from "crypto";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "admin") {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { email, role } = await req.json();

    if (!email) {
      return Response.json({ error: "Email is required" }, { status: 400 });
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return Response.json({ error: "User already exists" }, { status: 400 });
    }

    // Generate token
    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Save invitation (upsert to handle resends)
    const invitation = await prisma.invitation.upsert({
      where: { email },
      update: {
        token,
        role: role || "employee",
        expiresAt,
      },
      create: {
        email,
        token,
        role: role || "employee",
        expiresAt,
      },
    });

    const inviteLink = `${process.env.NEXTAUTH_URL}/accept-invite?token=${token}`;

    console.log(`[INVITE LINK FOR ${email}]:`, inviteLink);

    // Send email using Resend
    if (process.env.RESEND_API_KEY && process.env.RESEND_API_KEY !== "re_123456789") {
      try {
        await resend.emails.send({
          from: "TimeTracker <onboarding@resend.dev>",
          to: email,
          subject: "You've been invited to TimeTracker",
          html: `<p>You have been invited to join the TimeTracker application. Click the link below to set up your account:</p><p><a href="${inviteLink}">Accept Invitation</a></p>`,
        });
      } catch (emailError) {
        console.error("Failed to send email via Resend:", emailError);
      }
    }

    return Response.json({ message: "Invitation sent successfully", inviteLink });
  } catch (error: any) {
    console.error("Invite error:", error);
    return Response.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
