import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

export async function GET() {
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;
  const smtpHost = process.env.SMTP_HOST || "smtp.gmail.com";
  const smtpPort = Number(process.env.SMTP_PORT) || 587;
  const adminEmail = process.env.ADMIN_EMAIL || "oriaventures@gmail.com";

  // Return env var status first
  const envStatus = {
    SMTP_HOST: smtpHost,
    SMTP_PORT: smtpPort,
    SMTP_USER: smtpUser ? `${smtpUser.slice(0, 4)}...` : "❌ NOT SET",
    SMTP_PASS: smtpPass ? `set (${smtpPass.length} chars)` : "❌ NOT SET",
    ADMIN_EMAIL: adminEmail,
    EMAIL_FROM: process.env.EMAIL_FROM || "❌ NOT SET",
  };

  if (!smtpUser || !smtpPass) {
    return NextResponse.json({ success: false, error: "SMTP credentials missing", envStatus }, { status: 500 });
  }

  try {
    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: false,
      auth: { user: smtpUser, pass: smtpPass },
      tls: { rejectUnauthorized: false },
    });

    // Verify connection first
    await transporter.verify();

    // Send test email
    await transporter.sendMail({
      from: `"WriteProf" <${smtpUser}>`,
      to: adminEmail,
      subject: "✅ WriteProf Email Test — It Works!",
      html: `<p>SMTP is working. User: ${smtpUser}, Admin: ${adminEmail}</p>`,
    });

    return NextResponse.json({ success: true, message: `Email sent to ${adminEmail}`, envStatus });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err?.message || "Unknown error", code: err?.code, envStatus },
      { status: 500 }
    );
  }
}
