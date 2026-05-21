import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { hashPassword, generateReferralCode } from "@/lib/auth";
import { sendEmail, emailTemplates } from "@/lib/email";
import { rateLimiter } from "@/lib/rate-limit";

const signupSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email().max(255),
  phone: z.string().max(20).optional(),
  password: z.string().min(8).max(128),
  role: z.enum(["CLIENT", "WRITER"]),
  referredBy: z.string().max(20).optional(),
});

export async function POST(req: NextRequest) {
  // Rate limiting: 5 sign-ups per IP per hour
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() ?? "unknown";
  const rl = rateLimiter.check(`signup:${ip}`, 5, 60 * 60 * 1000);
  if (!rl.allowed) {
    return NextResponse.json(
      { success: false, error: `Too many sign-up attempts. Try again in ${Math.ceil(rl.retryAfterSeconds!)} seconds.` },
      { status: 429 }
    );
  }

  try {
    const body = await req.json();
    const data = signupSchema.parse(body);

    // Check if email exists
    const existing = await prisma.user.findUnique({ where: { email: data.email.toLowerCase() } });
    if (existing) {
      return NextResponse.json({ success: false, error: "Email already registered" }, { status: 400 });
    }

    // bcrypt hash (async, cost 12)
    const passwordHash = await hashPassword(data.password);
    const referralCode = generateReferralCode(data.name);

    // Generate email verification token (expires in 24 hours)
    const emailVerificationToken = crypto.randomBytes(32).toString("hex");
    const emailVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);

    // Find referrer
    let referredById: string | undefined;
    if (data.referredBy) {
      const referrer = await prisma.user.findUnique({ where: { referralCode: data.referredBy } });
      if (referrer) referredById = referrer.id;
    }

    // Create user — NOT verified yet
    const user = await prisma.user.create({
      data: {
        name: data.name,
        email: data.email.toLowerCase(),
        phone: data.phone,
        role: data.role,
        passwordHash,
        referralCode,
        referredBy: referredById,
        emailVerified: false,
        emailVerificationToken,
        emailVerificationExpires,
        wallet: { create: { balance: 0, totalEarned: 0, totalSpent: 0 } },
        ...(data.role === "WRITER"
          ? {
              writerProfile: {
                create: {
                  specializations: [],
                  languages: ["English"],
                  status: "OFFLINE",
                  isApproved: false,
                },
              },
            }
          : {}),
      },
      include: { writerProfile: true, wallet: true },
    });

    // Send verification email — awaited so Vercel doesn't kill it before delivery
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://writeprof.com";
    const verifyUrl = `${baseUrl}/verify-email?token=${emailVerificationToken}`;
    const verifyTmpl = emailTemplates.verifyEmail(user.name, verifyUrl);
    try {
      await sendEmail({ to: user.email, subject: verifyTmpl.subject, html: verifyTmpl.html });
    } catch (emailErr: any) {
      console.error("Verification email failed:", emailErr?.message);
      // Don't block signup — user can resend via the login page
    }

    // Notify admin (non-blocking, non-critical)
    const adminTmpl = emailTemplates.adminNewSignup(user.name, user.email, user.role);
    sendEmail({
      to: process.env.ADMIN_EMAIL || "oriaventures@gmail.com",
      subject: adminTmpl.subject,
      html: adminTmpl.html,
    }).catch((err) => console.error("Admin signup email failed:", err?.message));

    return NextResponse.json({
      success: true,
      requiresVerification: true,
      message: "Account created! Please check your email to verify your account before logging in.",
      data: { email: user.email, name: user.name, role: user.role },
    });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ success: false, error: err.errors[0].message }, { status: 400 });
    }
    console.error("Signup error:", err);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
