import { NextResponse } from "next/server";
import { sendEmail } from "@/lib/email";

export async function GET() {
  const adminEmail = process.env.ADMIN_EMAIL || "oriaventures@gmail.com";

  try {
    await sendEmail({
      to: adminEmail,
      subject: "✅ WriteProf SMTP Test — Email is Working!",
      html: `
        <div style="font-family: Inter, sans-serif; max-width: 600px; margin: 0 auto; background: #0f172a; color: #e2e8f0; border-radius: 12px; overflow: hidden;">
          <div style="background: linear-gradient(135deg, #22c55e, #16a34a); padding: 32px; text-align: center;">
            <h1 style="color: white; font-size: 28px; font-weight: 800; margin: 0;">WriteProf</h1>
            <p style="color: rgba(255,255,255,0.9); margin: 8px 0 0;">SMTP Test</p>
          </div>
          <div style="padding: 36px 32px;">
            <h2 style="color: #22c55e; margin-top: 0;">✅ Email is working!</h2>
            <p style="color: #94a3b8; line-height: 1.6;">
              Your SMTP configuration is correct. You will now receive email notifications whenever:
            </p>
            <ul style="color: #94a3b8; line-height: 2; padding-left: 20px;">
              <li>A new client registers</li>
              <li>A new writer registers (with approval reminder)</li>
            </ul>
            <div style="background: #1e293b; border-radius: 8px; padding: 16px; margin-top: 20px; border-left: 4px solid #22c55e;">
              <p style="color: #94a3b8; margin: 0; font-size: 13px;">
                SMTP Host: <strong style="color: #e2e8f0;">${process.env.SMTP_HOST || "smtp.gmail.com"}</strong><br/>
                SMTP User: <strong style="color: #e2e8f0;">${process.env.SMTP_USER}</strong><br/>
                Admin Email: <strong style="color: #e2e8f0;">${adminEmail}</strong>
              </p>
            </div>
          </div>
        </div>
      `,
    });

    return NextResponse.json({
      success: true,
      message: `Test email sent to ${adminEmail}`,
      smtp: {
        host: process.env.SMTP_HOST || "smtp.gmail.com",
        user: process.env.SMTP_USER,
        adminEmail,
      },
    });
  } catch (err: any) {
    console.error("Test email error:", err);
    return NextResponse.json(
      {
        success: false,
        error: err?.message || "Unknown error",
        smtp: {
          host: process.env.SMTP_HOST || "smtp.gmail.com",
          user: process.env.SMTP_USER,
          adminEmail,
        },
      },
      { status: 500 }
    );
  }
}
