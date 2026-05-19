import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { signToken } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const token = req.nextUrl.searchParams.get("token");

    if (!token) {
      return NextResponse.json({ success: false, error: "Missing verification token" }, { status: 400 });
    }

    // Find user with this token
    const user = await prisma.user.findUnique({
      where: { emailVerificationToken: token },
      include: { writerProfile: true, wallet: true },
    });

    if (!user) {
      return NextResponse.json({ success: false, error: "Invalid or already used verification link" }, { status: 400 });
    }

    // Check expiry
    if (user.emailVerificationExpires && user.emailVerificationExpires < new Date()) {
      return NextResponse.json({ success: false, error: "Verification link has expired. Please request a new one." }, { status: 400 });
    }

    // Mark as verified and clear token
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerified: true,
        emailVerificationToken: null,
        emailVerificationExpires: null,
      },
      include: { writerProfile: true, wallet: true },
    });

    // Create session and log them in automatically
    const authToken = await signToken({ userId: updatedUser.id, email: updatedUser.email, role: updatedUser.role });

    await prisma.session.create({
      data: {
        userId: updatedUser.id,
        token: authToken,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    // Redirect to dashboard with cookie set
    const dashboardUrl =
      updatedUser.role === "WRITER"
        ? "/writer-dashboard"
        : updatedUser.role === "ADMIN"
        ? "/admin"
        : "/dashboard";

    const response = NextResponse.redirect(new URL(dashboardUrl, req.url));

    response.cookies.set("wp_token", authToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });

    return response;
  } catch (err) {
    console.error("Email verification error:", err);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
