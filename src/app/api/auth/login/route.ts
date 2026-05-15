import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { signToken, comparePassword, setAuthCookie } from "@/lib/auth";
import { sendEmail, emailTemplates } from "@/lib/email";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password } = loginSchema.parse(body);

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      include: { writerProfile: true, wallet: true },
    });

    if (!user || !user.passwordHash) {
      return NextResponse.json({ success: false, error: "Invalid email or password" }, { status: 401 });
    }

    if (!comparePassword(password, user.passwordHash)) {
      return NextResponse.json({ success: false, error: "Invalid email or password" }, { status: 401 });
    }

    if (user.isBanned) {
      return NextResponse.json({ success: false, error: "Account suspended. Contact support." }, { status: 403 });
    }

    if (!user.isActive) {
      return NextResponse.json({ success: false, error: "Account is inactive." }, { status: 403 });
    }

    const token = await signToken({ userId: user.id, email: user.email, role: user.role });

    // Store session
    await prisma.session.create({
      data: {
        userId: user.id,
        token,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    const response = NextResponse.json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          avatar: user.avatar,
          role: user.role,
          emailVerified: user.emailVerified,
          isActive: user.isActive,
          writerProfile: user.writerProfile,
          wallet: user.wallet,
          createdAt: user.createdAt,
        },
        token,
      },
    });

    response.cookies.set("wp_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });

    return response;
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ success: false, error: err.errors[0].message }, { status: 400 });
    }
    console.error("Login error:", err);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
