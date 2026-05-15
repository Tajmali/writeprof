import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/email";
import * as crypto from "crypto";

const schema = z.object({ email: z.string().email() });

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email } = schema.parse(body);

    const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });

    // Always return success for security (don't reveal if email exists)
    if (!user) {
      return NextResponse.json({ success: true, message: "If this email exists, you'll receive a reset link." });
    }

    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${resetToken}`;

    // Store token in session (simplified - in production use a dedicated reset_tokens table)
    await prisma.session.create({
      data: {
        userId: user.id,
        token: `reset_${resetToken}`,
        expiresAt: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
      },
    });

    await sendEmail({
      to: email,
      subject: "Reset Your WriteProf Password",
      html: `
        <div style="font-family: Inter, sans-serif; max-width: 600px; margin: 0 auto; background: #0f172a; color: #e2e8f0; border-radius: 12px; overflow: hidden;">
          <div style="background: linear-gradient(135deg, #0369a1, #0ea5e9); padding: 40px 32px; text-align: center;">
            <h1 style="color: white; font-size: 32px; font-weight: 800; margin: 0;">WriteProf</h1>
          </div>
          <div style="padding: 40px 32px;">
            <h2 style="color: #38bdf8;">Reset Your Password</h2>
            <p style="color: #94a3b8;">Click the button below to reset your password. This link expires in 1 hour.</p>
            <a href="${resetUrl}" style="display: inline-block; background: linear-gradient(135deg, #0369a1, #0ea5e9); color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; margin-top: 16px;">
              Reset Password →
            </a>
            <p style="color: #475569; font-size: 12px; margin-top: 24px;">If you didn't request this, ignore this email.</p>
          </div>
        </div>
      `,
    });

    return NextResponse.json({ success: true, message: "Password reset email sent." });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ success: false, error: err.errors[0].message }, { status: 400 });
    }
    return NextResponse.json({ success: false, error: "Server error" }, { status: 500 });
  }
}
