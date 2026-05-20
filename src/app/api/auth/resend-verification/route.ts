import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { sendEmail, emailTemplates } from "@/lib/email";
import { rateLimiter } from "@/lib/rate-limit";

export async function POST(req: NextRequest) {
  // 3 resend attempts per IP per hour
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() ?? "unknown";
  const rl = rateLimiter.check(`resend-verify:${ip}`, 3, 60 * 60 * 1000);
  if (!rl.allowed) {
    return NextResponse.json(
      { success: false, error: "Too many requests. Please wait before requesting another email." },
      { status: 429 }
    );
  }

  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ success: false, error: "Email is required" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });

    // Don't reveal if email exists or not
    if (!user || user.emailVerified) {
      return NextResponse.json({
        success: true,
        message: "If that email exists and is unverified, a new link has been sent.",
      });
    }

    // Generate new token
    const emailVerificationToken = crypto.randomBytes(32).toString("hex");
    const emailVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);

    await prisma.user.update({
      where: { id: user.id },
      data: { emailVerificationToken, emailVerificationExpires },
    });

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://writeprof.com";
    const verifyUrl = `${baseUrl}/verify-email?token=${emailVerificationToken}`;
    const tmpl = emailTemplates.verifyEmail(user.name, verifyUrl);

    sendEmail({ to: user.email, subject: tmpl.subject, html: tmpl.html })
      .catch((err) => console.error("Resend verification email failed:", err?.message));

    return NextResponse.json({
      success: true,
      message: "A new verification link has been sent to your email.",
    });
  } catch (err) {
    console.error("Resend verification error:", err);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
