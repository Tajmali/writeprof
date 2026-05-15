import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail(options: EmailOptions) {
  return transporter.sendMail({
    from: `"WriteProf" <${process.env.EMAIL_FROM}>`,
    ...options,
  });
}

export const emailTemplates = {
  welcome: (name: string) => ({
    subject: "Welcome to WriteProf — Your Deadline Savior 🚀",
    html: `
      <div style="font-family: Inter, sans-serif; max-width: 600px; margin: 0 auto; background: #0f172a; color: #e2e8f0; border-radius: 12px; overflow: hidden;">
        <div style="background: linear-gradient(135deg, #0369a1, #0ea5e9); padding: 40px 32px; text-align: center;">
          <h1 style="color: white; font-size: 32px; font-weight: 800; margin: 0;">WriteProf</h1>
          <p style="color: rgba(255,255,255,0.8); margin: 8px 0 0;">Emergency Writing Marketplace</p>
        </div>
        <div style="padding: 40px 32px;">
          <h2 style="color: #38bdf8; font-size: 24px;">Welcome, ${name}! 🎉</h2>
          <p style="color: #94a3b8; line-height: 1.6;">
            Your account is ready. You can now submit urgent writing tasks and get them completed by our
            professional writers within hours.
          </p>
          <div style="background: #1e293b; border-radius: 8px; padding: 20px; margin: 24px 0; border-left: 4px solid #0ea5e9;">
            <p style="color: #e2e8f0; margin: 0; font-weight: 600;">What you can do now:</p>
            <ul style="color: #94a3b8; margin: 12px 0 0; padding-left: 20px; line-height: 2;">
              <li>Submit your first urgent order</li>
              <li>Track progress in real-time</li>
              <li>Chat with your assigned writer</li>
              <li>Request revisions anytime</li>
            </ul>
          </div>
          <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard"
             style="display: inline-block; background: linear-gradient(135deg, #0369a1, #0ea5e9); color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 16px; margin-top: 8px;">
            Go to Dashboard →
          </a>
        </div>
        <div style="padding: 24px 32px; background: #0f172a; border-top: 1px solid #1e293b; text-align: center;">
          <p style="color: #475569; font-size: 12px; margin: 0;">WriteProf — Emergency Writing Marketplace | support@writeprof.com</p>
        </div>
      </div>
    `,
  }),

  orderConfirmation: (name: string, orderNumber: string, deadline: string, amount: string) => ({
    subject: `Order ${orderNumber} Confirmed — Writers Notified!`,
    html: `
      <div style="font-family: Inter, sans-serif; max-width: 600px; margin: 0 auto; background: #0f172a; color: #e2e8f0; border-radius: 12px; overflow: hidden;">
        <div style="background: linear-gradient(135deg, #0369a1, #0ea5e9); padding: 40px 32px; text-align: center;">
          <h1 style="color: white; font-size: 32px; font-weight: 800; margin: 0;">WriteProf</h1>
        </div>
        <div style="padding: 40px 32px;">
          <h2 style="color: #38bdf8;">Order Confirmed! ✅</h2>
          <p style="color: #94a3b8;">Hi ${name}, your order has been received and our writers have been notified.</p>
          <div style="background: #1e293b; border-radius: 8px; padding: 20px; margin: 24px 0;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 12px;">
              <span style="color: #94a3b8;">Order Number</span>
              <span style="color: #38bdf8; font-weight: 600;">${orderNumber}</span>
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 12px;">
              <span style="color: #94a3b8;">Deadline</span>
              <span style="color: #f97316; font-weight: 600;">${deadline}</span>
            </div>
            <div style="display: flex; justify-content: space-between;">
              <span style="color: #94a3b8;">Amount Paid</span>
              <span style="color: #22c55e; font-weight: 600;">${amount}</span>
            </div>
          </div>
          <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/orders"
             style="display: inline-block; background: linear-gradient(135deg, #0369a1, #0ea5e9); color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600;">
            Track Your Order →
          </a>
        </div>
      </div>
    `,
  }),

  writerAssigned: (name: string, orderNumber: string, writerName: string) => ({
    subject: `Writer Assigned to Order ${orderNumber} — Work Has Started!`,
    html: `
      <div style="font-family: Inter, sans-serif; max-width: 600px; margin: 0 auto; background: #0f172a; color: #e2e8f0; border-radius: 12px; overflow: hidden;">
        <div style="background: linear-gradient(135deg, #0369a1, #0ea5e9); padding: 40px 32px; text-align: center;">
          <h1 style="color: white; font-size: 32px; font-weight: 800; margin: 0;">WriteProf</h1>
        </div>
        <div style="padding: 40px 32px;">
          <h2 style="color: #38bdf8;">Writer Assigned! ✍️</h2>
          <p style="color: #94a3b8;">Great news, ${name}! <strong style="color: #e2e8f0;">${writerName}</strong> has been assigned to your order <strong style="color: #38bdf8;">${orderNumber}</strong> and has started working.</p>
          <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/orders"
             style="display: inline-block; background: linear-gradient(135deg, #0369a1, #0ea5e9); color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600;">
            Chat with Writer →
          </a>
        </div>
      </div>
    `,
  }),

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
          <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/orders"
             style="display: inline-block; background: linear-gradient(135deg, #22c55e, #16a34a); color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600;">
            Download & Review →
          </a>
        </div>
      </div>
    `,
  }),
};
