import { Resend } from "resend";

// ─── Resend client ────────────────────────────────────────────────────────────
// Sign up free at https://resend.com → API Keys → Create key
// Add RESEND_API_KEY to your Vercel environment variables.
const resend = new Resend(process.env.RESEND_API_KEY);

const FROM_ADDRESS = "WriteProf <onboarding@resend.dev>";
const ADMIN_EMAIL  = process.env.ADMIN_EMAIL || "oriaventures@gmail.com";

// ─── Core send helper ─────────────────────────────────────────────────────────
interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail(options: EmailOptions): Promise<void> {
  if (!process.env.RESEND_API_KEY) {
    console.warn("⚠️  RESEND_API_KEY is not set — email not sent to:", options.to);
    return;
  }

  const { error } = await resend.emails.send({
    from: FROM_ADDRESS,
    to: options.to,
    subject: options.subject,
    html: options.html,
  });

  if (error) {
    throw new Error(`Resend error: ${error.message}`);
  }
}

// ─── Email templates ──────────────────────────────────────────────────────────
export const emailTemplates = {

  // ── Email verification ──────────────────────────────────────────────────────
  verifyEmail: (name: string, verifyUrl: string) => ({
    subject: "✅ Verify your WriteProf account",
    html: `
      <div style="font-family: Inter, Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0f172a; color: #e2e8f0; border-radius: 16px; overflow: hidden;">
        <div style="background: linear-gradient(135deg, #0c1445 0%, #0369a1 100%); padding: 44px 32px; text-align: center;">
          <div style="display: inline-block; background: rgba(255,255,255,0.15); border-radius: 12px; padding: 8px 18px; margin-bottom: 20px;">
            <span style="color: white; font-size: 20px; font-weight: 900; letter-spacing: -0.5px;">Write<span style="color: #7dd3fc;">Prof</span></span>
          </div>
          <div style="font-size: 48px; margin-bottom: 12px;">✉️</div>
          <h1 style="color: white; font-size: 26px; font-weight: 800; margin: 0 0 8px;">Confirm your email, ${name}</h1>
          <p style="color: rgba(255,255,255,0.8); margin: 0; font-size: 15px;">One click and you're ready to go</p>
        </div>
        <div style="padding: 40px 32px;">
          <p style="color: #94a3b8; font-size: 15px; line-height: 1.8; margin: 0 0 32px;">
            Thanks for signing up! Before you can place orders or start earning, we need to verify that this email address belongs to you. Click the button below — it only takes a second.
          </p>
          <div style="text-align: center; margin-bottom: 32px;">
            <a href="${verifyUrl}"
               style="display: inline-block; background: linear-gradient(135deg, #0ea5e9, #0369a1); color: white; padding: 16px 40px; border-radius: 12px; text-decoration: none; font-weight: 700; font-size: 16px; letter-spacing: 0.3px;">
              ✅ Verify My Email
            </a>
          </div>
          <div style="background: #1e293b; border-radius: 10px; padding: 16px 20px; margin-bottom: 24px;">
            <p style="color: #64748b; font-size: 12px; margin: 0 0 6px;">Or copy and paste this link into your browser:</p>
            <p style="color: #38bdf8; font-size: 12px; word-break: break-all; margin: 0;">${verifyUrl}</p>
          </div>
          <p style="color: #475569; font-size: 13px; line-height: 1.7; margin: 0;">
            This link expires in <strong style="color: #94a3b8;">24 hours</strong>. If you didn't create a WriteProf account, you can safely ignore this email.
          </p>
        </div>
        <div style="padding: 20px 32px; border-top: 1px solid rgba(255,255,255,0.07); text-align: center;">
          <p style="color: #334155; font-size: 12px; margin: 0;">© ${new Date().getFullYear()} WriteProf · Emergency Writing Marketplace</p>
        </div>
      </div>
    `,
  }),

  // ── Admin: new signup alert ──────────────────────────────────────────────────
  adminNewSignup: (newUserName: string, newUserEmail: string, role: string) => ({
    subject: `🆕 New ${role === "WRITER" ? "Writer" : "Client"} Signup — ${newUserName}`,
    html: `
      <div style="font-family: Inter, sans-serif; max-width: 600px; margin: 0 auto; background: #0f172a; color: #e2e8f0; border-radius: 12px; overflow: hidden;">
        <div style="background: linear-gradient(135deg, #7c3aed, #a855f7); padding: 32px; text-align: center;">
          <h1 style="color: white; font-size: 28px; font-weight: 800; margin: 0;">WriteProf Admin</h1>
          <p style="color: rgba(255,255,255,0.8); margin: 8px 0 0; font-size: 14px;">New Registration Alert</p>
        </div>
        <div style="padding: 36px 32px;">
          <h2 style="color: #a855f7; font-size: 20px; margin-top: 0;">
            ${role === "WRITER" ? "✍️ New Writer Registered" : "🙋 New Client Registered"}
          </h2>
          <div style="background: #1e293b; border-radius: 8px; padding: 20px; margin: 20px 0; border-left: 4px solid #a855f7;">
            <table style="width: 100%; border-collapse: collapse;">
              <tr><td style="color: #94a3b8; padding: 8px 0; width: 40%;">Name</td><td style="color: #e2e8f0; font-weight: 600; padding: 8px 0;">${newUserName}</td></tr>
              <tr><td style="color: #94a3b8; padding: 8px 0;">Email</td><td style="color: #38bdf8; padding: 8px 0;">${newUserEmail}</td></tr>
              <tr><td style="color: #94a3b8; padding: 8px 0;">Role</td><td style="padding: 8px 0;"><span style="background: ${role === "WRITER" ? "#7c3aed" : "#0369a1"}; color: white; padding: 2px 10px; border-radius: 999px; font-size: 12px; font-weight: 700;">${role}</span></td></tr>
              <tr><td style="color: #94a3b8; padding: 8px 0;">Time</td><td style="color: #e2e8f0; padding: 8px 0;">${new Date().toUTCString()}</td></tr>
            </table>
          </div>
          ${role === "WRITER" ? `<div style="background: #1e293b; border-radius: 8px; padding: 16px; margin-bottom: 20px; border-left: 4px solid #f59e0b;"><p style="color: #fbbf24; margin: 0; font-size: 14px; font-weight: 600;">⚠️ Action Required</p><p style="color: #94a3b8; margin: 6px 0 0; font-size: 13px;">This writer needs your approval before they can accept orders.</p></div>` : ""}
          <a href="${process.env.NEXT_PUBLIC_APP_URL}/admin/users" style="display: inline-block; background: linear-gradient(135deg, #7c3aed, #a855f7); color: white; padding: 13px 28px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 15px;">View in Admin Panel →</a>
        </div>
        <div style="padding: 20px 32px; background: #0f172a; border-top: 1px solid #1e293b; text-align: center;">
          <p style="color: #475569; font-size: 12px; margin: 0;">WriteProf Admin Notifications</p>
        </div>
      </div>
    `,
  }),

  // ── Welcome: client ─────────────────────────────────────────────────────────
  welcomeClient: (name: string) => ({
    subject: "🚨 WriteProf is Ready — Got a Deadline? We've Got You.",
    html: `
      <div style="font-family: Inter, Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0f172a; color: #e2e8f0; border-radius: 16px; overflow: hidden;">
        <div style="background: linear-gradient(135deg, #b91c1c 0%, #ef4444 100%); padding: 44px 32px; text-align: center;">
          <div style="font-size: 36px; margin-bottom: 10px;">🚨</div>
          <h1 style="color: white; font-size: 26px; font-weight: 800; margin: 0 0 8px;">You're in, ${name}.<br/>No deadline is too tight.</h1>
          <p style="color: rgba(255,255,255,0.85); margin: 0; font-size: 15px;">WriteProf — Emergency Writing Marketplace</p>
        </div>
        <div style="padding: 36px 32px; text-align: center;">
          <p style="color: #94a3b8; font-size: 15px; line-height: 1.8; margin: 0 0 24px;">Writers are online right now — post your order in under 2 minutes.</p>
          <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard" style="display: inline-block; background: linear-gradient(135deg, #b91c1c, #ef4444); color: white; padding: 16px 44px; border-radius: 10px; text-decoration: none; font-weight: 800; font-size: 16px;">🚨 Post My Urgent Order Now →</a>
        </div>
        <div style="padding: 20px 32px; background: #0a0f1e; border-top: 1px solid #1e293b; text-align: center;">
          <p style="color: #334155; font-size: 12px; margin: 0;">WriteProf — Emergency Writing Marketplace</p>
        </div>
      </div>
    `,
  }),

  // ── Welcome: writer ─────────────────────────────────────────────────────────
  welcomeWriter: (name: string) => ({
    subject: "✍️ WriteProf Writer Application Received — Here's What Happens Next",
    html: `
      <div style="font-family: Inter, Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0f172a; color: #e2e8f0; border-radius: 16px; overflow: hidden;">
        <div style="background: linear-gradient(135deg, #6d28d9 0%, #a855f7 100%); padding: 44px 32px; text-align: center;">
          <div style="font-size: 36px; margin-bottom: 10px;">✍️</div>
          <h1 style="color: white; font-size: 26px; font-weight: 800; margin: 0 0 8px;">Application received, ${name}!<br/>Approval coming soon.</h1>
        </div>
        <div style="padding: 36px 32px; text-align: center;">
          <p style="color: #94a3b8; font-size: 15px; line-height: 1.8; margin: 0 0 24px;">Your profile is under review. This usually takes 24–48 hours. You'll get an email the moment you're approved.</p>
          <a href="${process.env.NEXT_PUBLIC_APP_URL}/writer-dashboard" style="display: inline-block; background: linear-gradient(135deg, #6d28d9, #a855f7); color: white; padding: 16px 44px; border-radius: 10px; text-decoration: none; font-weight: 800; font-size: 16px;">View My Writer Dashboard →</a>
        </div>
        <div style="padding: 20px 32px; background: #0a0f1e; border-top: 1px solid #1e293b; text-align: center;">
          <p style="color: #334155; font-size: 12px; margin: 0;">WriteProf — Emergency Writing Marketplace</p>
        </div>
      </div>
    `,
  }),

  // ── Order confirmation ──────────────────────────────────────────────────────
  orderConfirmation: (name: string, orderNumber: string, deadline: string, amount: string) => ({
    subject: `Order ${orderNumber} Confirmed — Writers Notified!`,
    html: `
      <div style="font-family: Inter, sans-serif; max-width: 600px; margin: 0 auto; background: #0f172a; color: #e2e8f0; border-radius: 12px; overflow: hidden;">
        <div style="background: linear-gradient(135deg, #0369a1, #0ea5e9); padding: 40px 32px; text-align: center;">
          <h1 style="color: white; font-size: 32px; font-weight: 800; margin: 0;">WriteProf</h1>
        </div>
        <div style="padding: 40px 32px;">
          <h2 style="color: #38bdf8;">Order Confirmed! ✅</h2>
          <p style="color: #94a3b8;">Hi ${name}, your order has been received.</p>
          <div style="background: #1e293b; border-radius: 8px; padding: 20px; margin: 24px 0;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 12px;"><span style="color: #94a3b8;">Order Number</span><span style="color: #38bdf8; font-weight: 600;">${orderNumber}</span></div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 12px;"><span style="color: #94a3b8;">Deadline</span><span style="color: #f97316; font-weight: 600;">${deadline}</span></div>
            <div style="display: flex; justify-content: space-between;"><span style="color: #94a3b8;">Amount Paid</span><span style="color: #22c55e; font-weight: 600;">${amount}</span></div>
          </div>
          <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/orders" style="display: inline-block; background: linear-gradient(135deg, #0369a1, #0ea5e9); color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600;">Track Your Order →</a>
        </div>
      </div>
    `,
  }),

  // ── Writer assigned ─────────────────────────────────────────────────────────
  writerAssigned: (name: string, orderNumber: string, writerName: string) => ({
    subject: `Writer Assigned to Order ${orderNumber} — Work Has Started!`,
    html: `
      <div style="font-family: Inter, sans-serif; max-width: 600px; margin: 0 auto; background: #0f172a; color: #e2e8f0; border-radius: 12px; overflow: hidden;">
        <div style="background: linear-gradient(135deg, #0369a1, #0ea5e9); padding: 40px 32px; text-align: center;">
          <h1 style="color: white; font-size: 32px; font-weight: 800; margin: 0;">WriteProf</h1>
        </div>
        <div style="padding: 40px 32px;">
          <h2 style="color: #38bdf8;">Writer Assigned! ✍️</h2>
          <p style="color: #94a3b8;">Hi ${name}! <strong style="color: #e2e8f0;">${writerName}</strong> has been assigned to order <strong style="color: #38bdf8;">${orderNumber}</strong> and has started working.</p>
          <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/orders" style="display: inline-block; background: linear-gradient(135deg, #0369a1, #0ea5e9); color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600;">Chat with Writer →</a>
        </div>
      </div>
    `,
  }),

  // ── Order completed ─────────────────────────────────────────────────────────
  orderCompleted: (name: string, orderNumber: string) => ({
    subject: `Order ${orderNumber} Completed — Download Your Work!`,
    html: `
      <div style="font-family: Inter, sans-serif; max-width: 600px; margin: 0 auto; background: #0f172a; color: #e2e8f0; border-radius: 12px; overflow: hidden;">
        <div style="background: linear-gradient(135deg, #22c55e, #16a34a); padding: 40px 32px; text-align: center;">
          <h1 style="color: white; font-size: 32px; font-weight: 800; margin: 0;">WriteProf</h1>
        </div>
        <div style="padding: 40px 32px;">
          <h2 style="color: #22c55e;">Order Complete! 🎉</h2>
          <p style="color: #94a3b8;">Hi ${name}! Your order <strong style="color: #38bdf8;">${orderNumber}</strong> has been completed and is ready for download.</p>
          <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/orders" style="display: inline-block; background: linear-gradient(135deg, #22c55e, #16a34a); color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600;">Download & Review →</a>
        </div>
      </div>
    `,
  }),

};
