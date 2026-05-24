import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/auth";
import { rateLimiter } from "@/lib/rate-limit";

const schema = z.object({
  token: z.string().min(10),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export async function POST(req: NextRequest) {
  // 5 attempts per IP per hour
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const rl = rateLimiter.check(`reset-pw:${ip}`, 5, 60 * 60 * 1000);
  if (!rl.allowed) {
    return NextResponse.json({ success: false, error: "Too many attempts. Try again later." }, { status: 429 });
  }

  try {
    const body = await req.json();
    const { token, password } = schema.parse(body);

    // Find the session with the reset token
    const session = await prisma.session.findFirst({
      where: {
        token: `reset_${token}`,
        expiresAt: { gt: new Date() }, // not expired
      },
      include: { user: true },
    });

    if (!session) {
      return NextResponse.json(
        { success: false, error: "Reset link is invalid or has expired. Please request a new one." },
        { status: 400 }
      );
    }

    const hashed = await hashPassword(password);

    // Update password and delete ALL reset tokens for this user in one transaction
    await prisma.$transaction([
      prisma.user.update({
        where: { id: session.userId },
        data: { password: hashed },
      }),
      // Delete all reset sessions for this user
      prisma.session.deleteMany({
        where: {
          userId: session.userId,
          token: { startsWith: "reset_" },
        },
      }),
    ]);

    return NextResponse.json({ success: true, message: "Password reset successfully." });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ success: false, error: err.errors[0].message }, { status: 400 });
    }
    console.error("Reset password error:", err);
    return NextResponse.json({ success: false, error: "Server error" }, { status: 500 });
  }
}
