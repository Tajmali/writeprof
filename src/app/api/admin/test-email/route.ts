import { NextResponse } from "next/server";
import { Resend } from "resend";

export async function GET() {
  const apiKey = process.env.RESEND_API_KEY;
  const adminEmail = process.env.ADMIN_EMAIL || "oriaventures@gmail.com";

  const envStatus = {
    RESEND_API_KEY: apiKey ? `set (${apiKey.slice(0, 8)}...)` : "❌ NOT SET",
    ADMIN_EMAIL: adminEmail,
  };

  if (!apiKey) {
    return NextResponse.json({ success: false, error: "RESEND_API_KEY is not set in environment variables", envStatus }, { status: 500 });
  }

  try {
    const resend = new Resend(apiKey);
    const { data, error } = await resend.emails.send({
      from: "WriteProf <onboarding@resend.dev>",
      to: adminEmail,
      subject: "✅ WriteProf Email Test — Resend is working!",
      html: `<div style="font-family:sans-serif;padding:24px;background:#0f172a;color:#e2e8f0;border-radius:12px;">
        <h2 style="color:#38bdf8;">✅ Resend is working!</h2>
        <p>Test email sent successfully to <strong>${adminEmail}</strong></p>
        <p style="color:#64748b;font-size:12px;margin-top:16px;">Sent at ${new Date().toUTCString()}</p>
      </div>`,
    });

    if (error) {
      return NextResponse.json({ success: false, error: error.message, envStatus }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: `Test email sent to ${adminEmail}`, emailId: data?.id, envStatus });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err?.message || "Unknown error", envStatus }, { status: 500 });
  }
}
