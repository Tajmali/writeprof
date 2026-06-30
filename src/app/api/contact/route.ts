import { NextRequest, NextResponse } from "next/server";
import { sendEmail } from "@/lib/email";

export async function POST(req: NextRequest) {
  try {
    const { name, email, subject, message } = await req.json();

    if (!name || !email || !subject || !message) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 });
    }

    const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "oriaventures@gmail.com";

    await sendEmail({
      to: ADMIN_EMAIL,
      subject: `Contact: ${subject} — from ${name}`,
      html: `
        <div style="font-family:Inter,sans-serif;max-width:600px;margin:0 auto;background:#0f172a;color:#e2e8f0;border-radius:12px;overflow:hidden;">
          <div style="background:linear-gradient(135deg,#7c3aed,#a855f7);padding:32px;text-align:center;">
            <h1 style="color:white;font-size:22px;font-weight:800;margin:0;">WriteProf — New Contact Message</h1>
          </div>
          <div style="padding:32px;">
            <table style="width:100%;border-collapse:collapse;">
              <tr><td style="color:#94a3b8;padding:8px 0;width:30%;vertical-align:top;">From</td><td style="color:#e2e8f0;font-weight:600;padding:8px 0;">${name}</td></tr>
              <tr><td style="color:#94a3b8;padding:8px 0;vertical-align:top;">Email</td><td style="color:#7dd3fc;padding:8px 0;">${email}</td></tr>
              <tr><td style="color:#94a3b8;padding:8px 0;vertical-align:top;">Subject</td><td style="color:#e2e8f0;padding:8px 0;">${subject}</td></tr>
            </table>
            <div style="background:#1e293b;border-radius:8px;padding:20px;margin-top:20px;border-left:4px solid #7c3aed;">
              <p style="color:#94a3b8;font-size:12px;margin:0 0 8px;">Message</p>
              <p style="color:#e2e8f0;font-size:15px;line-height:1.7;margin:0;white-space:pre-wrap;">${message}</p>
            </div>
            <a href="mailto:${email}" style="display:inline-block;margin-top:24px;background:linear-gradient(135deg,#7c3aed,#a855f7);color:white;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;">Reply to ${name} →</a>
          </div>
          <div style="padding:16px 32px;border-top:1px solid #1e293b;text-align:center;">
            <p style="color:#475569;font-size:12px;margin:0;">WriteProf Contact Form · ${new Date().toUTCString()}</p>
          </div>
        </div>
      `,
    });

    await sendEmail({
      to: email,
      subject: "We received your message — WriteProf Support",
      html: `
        <div style="font-family:Inter,sans-serif;max-width:600px;margin:0 auto;background:#0f172a;color:#e2e8f0;border-radius:12px;overflow:hidden;">
          <div style="background:linear-gradient(135deg,#b91c1c,#ef6c4d);padding:40px 32px;text-align:center;">
            <div style="display:inline-block;background:rgba(255,255,255,0.15);border-radius:10px;padding:6px 16px;margin-bottom:16px;">
              <span style="color:white;font-size:18px;font-weight:900;letter-spacing:-0.5px;">Write<span style="color:#fde8e3;">Prof</span></span>
            </div>
            <h1 style="color:white;font-size:24px;font-weight:800;margin:0;">Message received, ${name}!</h1>
          </div>
          <div style="padding:36px 32px;">
            <p style="color:#94a3b8;font-size:15px;line-height:1.8;margin:0 0 20px;">
              Thanks for reaching out. We've received your message and will get back to you within a few hours.
            </p>
            <div style="background:#1e293b;border-radius:8px;padding:16px 20px;margin-bottom:24px;">
              <p style="color:#64748b;font-size:12px;margin:0 0 4px;">Your subject</p>
              <p style="color:#e2e8f0;font-weight:600;margin:0;">${subject}</p>
            </div>
            <p style="color:#475569;font-size:13px;line-height:1.7;margin:0;">
              For urgent order issues, use the live chat button on our site — it's faster.
            </p>
          </div>
          <div style="padding:20px 32px;border-top:1px solid #1e293b;text-align:center;">
            <p style="color:#334155;font-size:12px;margin:0;">© ${new Date().getFullYear()} WriteProf · Emergency Writing Marketplace</p>
          </div>
        </div>
      `,
    });

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    console.error("Contact form error:", err);
    return NextResponse.json({ error: "Failed to send message. Please try again." }, { status: 500 });
  }
}
