import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: Number(process.env.SMTP_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  tls: {
    rejectUnauthorized: false,
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
  welcomeClient: (name: string) => ({
    subject: "Welcome to WriteProf — Your Deadline Just Got Easier 🚀",
    html: `
      <div style="font-family: Inter, Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0f172a; color: #e2e8f0; border-radius: 16px; overflow: hidden; box-shadow: 0 20px 60px rgba(0,0,0,0.5);">
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #0369a1 0%, #0ea5e9 100%); padding: 48px 32px; text-align: center;">
          <div style="display: inline-block; background: rgba(255,255,255,0.15); border-radius: 12px; padding: 10px 20px; margin-bottom: 16px;">
            <span style="color: white; font-size: 22px; font-weight: 900; letter-spacing: -0.5px;">Write<span style="color: #bae6fd;">Prof</span></span>
          </div>
          <h1 style="color: white; font-size: 28px; font-weight: 800; margin: 0 0 8px;">You're in — welcome aboard! 🎉</h1>
          <p style="color: rgba(255,255,255,0.85); margin: 0; font-size: 16px;">Emergency Writing Marketplace</p>
        </div>

        <!-- Greeting -->
        <div style="padding: 40px 32px 0;">
          <p style="color: #e2e8f0; font-size: 17px; line-height: 1.7; margin: 0 0 8px;">Hi <strong>${name}</strong>,</p>
          <p style="color: #94a3b8; font-size: 15px; line-height: 1.8; margin: 0 0 28px;">
            We're thrilled to have you. WriteProf connects you with vetted professional writers — PhDs, published authors, and industry experts — who deliver polished, high-quality work in as little as <strong style="color: #38bdf8;">1 hour</strong>. No stress. No missed deadlines. Ever.
          </p>
        </div>

        <!-- What is WriteProf -->
        <div style="padding: 0 32px;">
          <div style="background: #1e293b; border-radius: 12px; padding: 24px; margin-bottom: 24px; border: 1px solid rgba(255,255,255,0.06);">
            <p style="color: #38bdf8; font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; margin: 0 0 16px;">What is WriteProf?</p>
            <p style="color: #94a3b8; font-size: 14px; line-height: 1.8; margin: 0;">
              WriteProf is the world's leading <strong style="color: #e2e8f0;">emergency writing marketplace</strong>. Whether you need a research paper, business proposal, blog post, SEO content, or a complete essay — we match you with the right expert instantly and get it done fast.
            </p>
          </div>
        </div>

        <!-- Benefits grid -->
        <div style="padding: 0 32px;">
          <p style="color: #38bdf8; font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; margin: 0 0 16px;">Why clients love WriteProf</p>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="width: 50%; padding: 0 8px 12px 0; vertical-align: top;">
                <div style="background: #1e293b; border-radius: 10px; padding: 18px; border: 1px solid rgba(255,255,255,0.06); height: 100%;">
                  <div style="font-size: 22px; margin-bottom: 8px;">⚡</div>
                  <p style="color: #e2e8f0; font-weight: 700; font-size: 14px; margin: 0 0 6px;">Lightning Fast</p>
                  <p style="color: #64748b; font-size: 13px; margin: 0; line-height: 1.6;">Get work delivered in 1, 3, 6, 12, or 24 hours — your call.</p>
                </div>
              </td>
              <td style="width: 50%; padding: 0 0 12px 8px; vertical-align: top;">
                <div style="background: #1e293b; border-radius: 10px; padding: 18px; border: 1px solid rgba(255,255,255,0.06); height: 100%;">
                  <div style="font-size: 22px; margin-bottom: 8px;">🎓</div>
                  <p style="color: #e2e8f0; font-weight: 700; font-size: 14px; margin: 0 0 6px;">Vetted Experts</p>
                  <p style="color: #64748b; font-size: 13px; margin: 0; line-height: 1.6;">Every writer is screened — PhDs, Masters holders & published authors only.</p>
                </div>
              </td>
            </tr>
            <tr>
              <td style="width: 50%; padding: 0 8px 12px 0; vertical-align: top;">
                <div style="background: #1e293b; border-radius: 10px; padding: 18px; border: 1px solid rgba(255,255,255,0.06); height: 100%;">
                  <div style="font-size: 22px; margin-bottom: 8px;">🔒</div>
                  <p style="color: #e2e8f0; font-weight: 700; font-size: 14px; margin: 0 0 6px;">Secure Payments</p>
                  <p style="color: #64748b; font-size: 13px; margin: 0; line-height: 1.6;">Funds held in escrow — released only when you approve the work.</p>
                </div>
              </td>
              <td style="width: 50%; padding: 0 0 12px 8px; vertical-align: top;">
                <div style="background: #1e293b; border-radius: 10px; padding: 18px; border: 1px solid rgba(255,255,255,0.06); height: 100%;">
                  <div style="font-size: 22px; margin-bottom: 8px;">♾️</div>
                  <p style="color: #e2e8f0; font-weight: 700; font-size: 14px; margin: 0 0 6px;">Free Revisions</p>
                  <p style="color: #64748b; font-size: 13px; margin: 0; line-height: 1.6;">Not 100% happy? Request revisions until it's exactly right.</p>
                </div>
              </td>
            </tr>
          </table>
        </div>

        <!-- Services -->
        <div style="padding: 8px 32px 0;">
          <div style="background: linear-gradient(135deg, #0c1a2e, #0f2040); border-radius: 12px; padding: 24px; border: 1px solid rgba(14,165,233,0.2);">
            <p style="color: #38bdf8; font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; margin: 0 0 14px;">We cover everything you need</p>
            <div style="display: flex; flex-wrap: wrap; gap: 8px;">
              ${["📄 Research Papers", "✍️ Essays", "💼 Business Proposals", "📝 Blog Posts", "🔍 SEO Content", "📊 Reports", "📚 Dissertations", "📣 Copywriting"].map(s => `<span style="background: rgba(14,165,233,0.1); border: 1px solid rgba(14,165,233,0.25); color: #7dd3fc; font-size: 12px; font-weight: 600; padding: 5px 12px; border-radius: 999px; display: inline-block;">${s}</span>`).join("")}
            </div>
          </div>
        </div>

        <!-- CTA -->
        <div style="padding: 32px; text-align: center;">
          <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard"
             style="display: inline-block; background: linear-gradient(135deg, #0369a1, #0ea5e9); color: white; padding: 16px 40px; border-radius: 10px; text-decoration: none; font-weight: 700; font-size: 16px; letter-spacing: 0.3px;">
            Place Your First Order →
          </a>
          <p style="color: #475569; font-size: 13px; margin: 16px 0 0;">Need help? Chat with Aria, our 24/7 AI support, right on the site.</p>
        </div>

        <!-- Footer -->
        <div style="padding: 20px 32px; background: #0a0f1e; border-top: 1px solid #1e293b; text-align: center;">
          <p style="color: #334155; font-size: 12px; margin: 0;">WriteProf — Emergency Writing Marketplace &nbsp;|&nbsp; <a href="mailto:oriaventures@gmail.com" style="color: #475569; text-decoration: none;">oriaventures@gmail.com</a></p>
          <p style="color: #1e293b; font-size: 11px; margin: 8px 0 0;">writeprof.com</p>
        </div>
      </div>
    `,
  }),

  welcomeWriter: (name: string) => ({
    subject: "Welcome to WriteProf — Start Earning From Your Skills ✍️",
    html: `
      <div style="font-family: Inter, Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0f172a; color: #e2e8f0; border-radius: 16px; overflow: hidden; box-shadow: 0 20px 60px rgba(0,0,0,0.5);">
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #6d28d9 0%, #a855f7 100%); padding: 48px 32px; text-align: center;">
          <div style="display: inline-block; background: rgba(255,255,255,0.15); border-radius: 12px; padding: 10px 20px; margin-bottom: 16px;">
            <span style="color: white; font-size: 22px; font-weight: 900; letter-spacing: -0.5px;">Write<span style="color: #e9d5ff;">Prof</span></span>
          </div>
          <h1 style="color: white; font-size: 28px; font-weight: 800; margin: 0 0 8px;">Your application is received! ✍️</h1>
          <p style="color: rgba(255,255,255,0.85); margin: 0; font-size: 16px;">Writer's Portal — WriteProf</p>
        </div>

        <!-- Greeting -->
        <div style="padding: 40px 32px 0;">
          <p style="color: #e2e8f0; font-size: 17px; line-height: 1.7; margin: 0 0 8px;">Hi <strong>${name}</strong>,</p>
          <p style="color: #94a3b8; font-size: 15px; line-height: 1.8; margin: 0 0 28px;">
            Thank you for joining WriteProf as a writer. Your profile is currently under review by our admin team. Once approved, you'll get immediate access to orders from clients worldwide — and start earning on your own schedule.
          </p>
        </div>

        <!-- Approval notice -->
        <div style="padding: 0 32px;">
          <div style="background: linear-gradient(135deg, #1c1a2e, #1e1535); border-radius: 12px; padding: 22px 24px; margin-bottom: 24px; border-left: 4px solid #a855f7; border: 1px solid rgba(168,85,247,0.25);">
            <p style="color: #c084fc; font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; margin: 0 0 8px;">⏳ Approval in Progress</p>
            <p style="color: #94a3b8; font-size: 14px; line-height: 1.8; margin: 0;">
              Our team reviews every writer application carefully. You'll receive an email confirmation within <strong style="color: #e2e8f0;">24–48 hours</strong>. Once approved, your writer dashboard will be fully unlocked.
            </p>
          </div>
        </div>

        <!-- What is WriteProf for writers -->
        <div style="padding: 0 32px;">
          <div style="background: #1e293b; border-radius: 12px; padding: 24px; margin-bottom: 24px; border: 1px solid rgba(255,255,255,0.06);">
            <p style="color: #a855f7; font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; margin: 0 0 16px;">What is WriteProf?</p>
            <p style="color: #94a3b8; font-size: 14px; line-height: 1.8; margin: 0;">
              WriteProf is the world's leading <strong style="color: #e2e8f0;">emergency writing marketplace</strong>. Clients post urgent writing tasks 24/7 — from academic papers to business proposals — and our approved writers bid on and complete them. You set your own pace, pick your orders, and get paid fast.
            </p>
          </div>
        </div>

        <!-- Writer benefits -->
        <div style="padding: 0 32px;">
          <p style="color: #a855f7; font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; margin: 0 0 16px;">Why writers choose WriteProf</p>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="width: 50%; padding: 0 8px 12px 0; vertical-align: top;">
                <div style="background: #1e293b; border-radius: 10px; padding: 18px; border: 1px solid rgba(255,255,255,0.06);">
                  <div style="font-size: 22px; margin-bottom: 8px;">💰</div>
                  <p style="color: #e2e8f0; font-weight: 700; font-size: 14px; margin: 0 0 6px;">Earn 80% Per Order</p>
                  <p style="color: #64748b; font-size: 13px; margin: 0; line-height: 1.6;">Keep 80% of every order value — one of the highest payouts in the industry.</p>
                </div>
              </td>
              <td style="width: 50%; padding: 0 0 12px 8px; vertical-align: top;">
                <div style="background: #1e293b; border-radius: 10px; padding: 18px; border: 1px solid rgba(255,255,255,0.06);">
                  <div style="font-size: 22px; margin-bottom: 8px;">🌍</div>
                  <p style="color: #e2e8f0; font-weight: 700; font-size: 14px; margin: 0 0 6px;">Global Clients</p>
                  <p style="color: #64748b; font-size: 13px; margin: 0; line-height: 1.6;">Work with clients from the US, UK, Australia, Canada, UAE and beyond.</p>
                </div>
              </td>
            </tr>
            <tr>
              <td style="width: 50%; padding: 0 8px 12px 0; vertical-align: top;">
                <div style="background: #1e293b; border-radius: 10px; padding: 18px; border: 1px solid rgba(255,255,255,0.06);">
                  <div style="font-size: 22px; margin-bottom: 8px;">🕐</div>
                  <p style="color: #e2e8f0; font-weight: 700; font-size: 14px; margin: 0 0 6px;">Work On Your Terms</p>
                  <p style="color: #64748b; font-size: 13px; margin: 0; line-height: 1.6;">Pick orders that suit your schedule. No minimums, no commitments.</p>
                </div>
              </td>
              <td style="width: 50%; padding: 0 0 12px 8px; vertical-align: top;">
                <div style="background: #1e293b; border-radius: 10px; padding: 18px; border: 1px solid rgba(255,255,255,0.06);">
                  <div style="font-size: 22px; margin-bottom: 8px;">📈</div>
                  <p style="color: #e2e8f0; font-weight: 700; font-size: 14px; margin: 0 0 6px;">Grow Your Rank</p>
                  <p style="color: #64748b; font-size: 13px; margin: 0; line-height: 1.6;">Climb from Active → Rising Star → Top Writer → Elite Pro with higher pay.</p>
                </div>
              </td>
            </tr>
          </table>
        </div>

        <!-- How it works for writers -->
        <div style="padding: 8px 32px 0;">
          <div style="background: linear-gradient(135deg, #1a0f2e, #200f35); border-radius: 12px; padding: 24px; border: 1px solid rgba(168,85,247,0.2);">
            <p style="color: #a855f7; font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; margin: 0 0 18px;">How it works — in 3 steps</p>
            <div style="display: flex; flex-direction: column; gap: 14px;">
              <div style="display: flex; align-items: flex-start; gap: 14px;">
                <div style="width: 28px; height: 28px; border-radius: 50%; background: #6d28d9; color: white; font-weight: 800; font-size: 13px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; text-align: center; line-height: 28px;">1</div>
                <div>
                  <p style="color: #e2e8f0; font-weight: 700; font-size: 14px; margin: 0 0 3px;">Browse & Bid</p>
                  <p style="color: #64748b; font-size: 13px; margin: 0; line-height: 1.6;">Browse available orders and submit proposals on projects that match your expertise.</p>
                </div>
              </div>
              <div style="display: flex; align-items: flex-start; gap: 14px;">
                <div style="width: 28px; height: 28px; border-radius: 50%; background: #6d28d9; color: white; font-weight: 800; font-size: 13px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; text-align: center; line-height: 28px;">2</div>
                <div>
                  <p style="color: #e2e8f0; font-weight: 700; font-size: 14px; margin: 0 0 3px;">Write & Deliver</p>
                  <p style="color: #64748b; font-size: 13px; margin: 0; line-height: 1.6;">Complete the work and submit before the deadline. Chat with the client if needed.</p>
                </div>
              </div>
              <div style="display: flex; align-items: flex-start; gap: 14px;">
                <div style="width: 28px; height: 28px; border-radius: 50%; background: #6d28d9; color: white; font-weight: 800; font-size: 13px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; text-align: center; line-height: 28px;">3</div>
                <div>
                  <p style="color: #e2e8f0; font-weight: 700; font-size: 14px; margin: 0 0 3px;">Get Paid</p>
                  <p style="color: #64748b; font-size: 13px; margin: 0; line-height: 1.6;">Funds are released to your wallet once the client approves. Withdraw anytime.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- CTA -->
        <div style="padding: 32px; text-align: center;">
          <a href="${process.env.NEXT_PUBLIC_APP_URL}/writer-dashboard"
             style="display: inline-block; background: linear-gradient(135deg, #6d28d9, #a855f7); color: white; padding: 16px 40px; border-radius: 10px; text-decoration: none; font-weight: 700; font-size: 16px; letter-spacing: 0.3px;">
            Go to My Writer Dashboard →
          </a>
          <p style="color: #475569; font-size: 13px; margin: 16px 0 0;">Questions? Email us at <a href="mailto:oriaventures@gmail.com" style="color: #a855f7; text-decoration: none;">oriaventures@gmail.com</a></p>
        </div>

        <!-- Footer -->
        <div style="padding: 20px 32px; background: #0a0f1e; border-top: 1px solid #1e293b; text-align: center;">
          <p style="color: #334155; font-size: 12px; margin: 0;">WriteProf — Emergency Writing Marketplace &nbsp;|&nbsp; <a href="mailto:oriaventures@gmail.com" style="color: #475569; text-decoration: none;">oriaventures@gmail.com</a></p>
          <p style="color: #1e293b; font-size: 11px; margin: 8px 0 0;">writeprof.com</p>
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
              <tr>
                <td style="color: #94a3b8; padding: 8px 0; width: 40%;">Name</td>
                <td style="color: #e2e8f0; font-weight: 600; padding: 8px 0;">${newUserName}</td>
              </tr>
              <tr>
                <td style="color: #94a3b8; padding: 8px 0;">Email</td>
                <td style="color: #38bdf8; padding: 8px 0;">${newUserEmail}</td>
              </tr>
              <tr>
                <td style="color: #94a3b8; padding: 8px 0;">Role</td>
                <td style="padding: 8px 0;">
                  <span style="background: ${role === "WRITER" ? "#7c3aed" : "#0369a1"}; color: white; padding: 2px 10px; border-radius: 999px; font-size: 12px; font-weight: 700;">
                    ${role}
                  </span>
                </td>
              </tr>
              <tr>
                <td style="color: #94a3b8; padding: 8px 0;">Time</td>
                <td style="color: #e2e8f0; padding: 8px 0;">${new Date().toUTCString()}</td>
              </tr>
            </table>
          </div>
          ${role === "WRITER" ? `
          <div style="background: #1e293b; border-radius: 8px; padding: 16px; margin-bottom: 20px; border-left: 4px solid #f59e0b;">
            <p style="color: #fbbf24; margin: 0; font-size: 14px; font-weight: 600;">⚠️ Action Required</p>
            <p style="color: #94a3b8; margin: 6px 0 0; font-size: 13px;">This writer needs your approval before they can accept orders. Review their profile in the admin panel.</p>
          </div>` : ""}
          <a href="${process.env.NEXT_PUBLIC_APP_URL}/admin/users"
             style="display: inline-block; background: linear-gradient(135deg, #7c3aed, #a855f7); color: white; padding: 13px 28px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 15px;">
            View in Admin Panel →
          </a>
        </div>
        <div style="padding: 20px 32px; background: #0f172a; border-top: 1px solid #1e293b; text-align: center;">
          <p style="color: #475569; font-size: 12px; margin: 0;">WriteProf Admin Notifications — oriaventures@gmail.com</p>
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
