import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { signToken, hashPassword, generateReferralCode } from "@/lib/auth";
import { sendEmail, emailTemplates } from "@/lib/email";

const signupSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().optional(),
  password: z.string().min(8),
  role: z.enum(["CLIENT", "WRITER"]),
  referredBy: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const data = signupSchema.parse(body);

    // Check if email exists
    const existing = await prisma.user.findUnique({ where: { email: data.email.toLowerCase() } });
    if (existing) {
      return NextResponse.json({ success: false, error: "Email already registered" }, { status: 400 });
    }

    const passwordHash = hashPassword(data.password);
    const referralCode = generateReferralCode(data.name);

    // Find referrer
    let referredById: string | undefined;
    if (data.referredBy) {
      const referrer = await prisma.user.findUnique({ where: { referralCode: data.referredBy } });
      if (referrer) referredById = referrer.id;
    }

    // Create user with wallet
    const user = await prisma.user.create({
      data: {
        name: data.name,
        email: data.email.toLowerCase(),
        phone: data.phone,
        role: data.role,
        passwordHash,
        referralCode,
        referredBy: referredById,
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

    const token = await signToken({ userId: user.id, email: user.email, role: user.role });

    await prisma.session.create({
      data: {
        userId: user.id,
        token,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    // Send welcome email to new user (non-blocking)
    const tmpl = emailTemplates.welcome(user.name);
    sendEmail({ to: user.email, subject: tmpl.subject, html: tmpl.html })
      .catch((err) => console.error("Welcome email failed:", err?.message));

    // Notify admin of new signup (non-blocking)
    const adminTmpl = emailTemplates.adminNewSignup(user.name, user.email, user.role);
    sendEmail({
      to: process.env.ADMIN_EMAIL || "oriaventures@gmail.com",
      subject: adminTmpl.subject,
      html: adminTmpl.html,
    }).catch((err) => console.error("Admin signup email failed:", err?.message));

    const response = NextResponse.json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
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
    console.error("Signup error:", err);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
