import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import prisma from "@/lib/db";

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token");

  if (!token) {
    return NextResponse.json({ error: "Token is required" }, { status: 400 });
  }

  const verification = await prisma.emailVerification.findUnique({
    where: { token },
  });

  if (!verification) {
    return NextResponse.json({ error: "Invalid verification link" }, { status: 400 });
  }

  if (verification.used) {
    return NextResponse.json({ message: "Email already verified" });
  }

  if (new Date() > verification.expiresAt) {
    return NextResponse.json(
      { error: "Verification link has expired" },
      { status: 400 }
    );
  }

  await prisma.$transaction([
    prisma.user.update({
      where: { id: verification.userId },
      data: { isVerified: true },
    }),
    prisma.emailVerification.update({
      where: { id: verification.id },
      data: { used: true },
    }),
  ]);

  return NextResponse.json({ message: "Email verified" });
}
