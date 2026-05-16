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
    subject: "🚨 WriteProf is Ready — Got a Deadline? We've Got You.",
    html: `
      <div style="font-family: Inter, Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0f172a; color: #e2e8f0; border-radius: 16px; overflow: hidden;">
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #b91c1c 0%, #ef4444 100%); padding: 44px 32px; text-align: center;">
          <div style="display: inline-block; background: rgba(255,255,255,0.15); border-radius: 12px; padding: 8px 18px; margin-bottom: 14px;">
            <span style="color: white; font-size: 20px; font-weight: 900; letter-spacing: -0.5px;">Write<span style="color: #fecaca;">Prof</span></span>
          </div>
          <div style="font-size: 36px; margin-bottom: 10px;">🚨</div>
          <h1 style="color: white; font-size: 26px; font-weight: 800; margin: 0 0 8px; line-height: 1.3;">You're in, ${name}.<br/>No deadline is too tight.</h1>
          <p style="color: rgba(255,255,255,0.85); margin: 0; font-size: 15px;">Emergency Writing Marketplace — writeprof.com</p>
        </div>

        <!-- Urgency intro -->
        <div style="padding: 36px 32px 0;">
          <p style="color: #94a3b8; font-size: 15px; line-height: 1.9; margin: 0 0 24px;">
            WriteProf exists for one reason: <strong style="color: #f87171;">you have a deadline and you need it done — now.</strong> Whether your paper is due in 1 hour or your pitch is due by morning, our professional writers are on standby 24/7, ready to take your order the moment you post it.
          </p>
        </div>

        <!-- How fast -->
        <div style="padding: 0 32px;">
          <div style="background: linear-gradient(135deg, #1c0a0a, #2d1010); border-radius: 12px; padding: 24px; margin-bottom: 24px; border: 1px solid rgba(239,68,68,0.25);">
            <p style="color: #f87171; font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; margin: 0 0 16px;">⏱ How fast can you get your work?</p>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; border-bottom: 1px solid rgba(255,255,255,0.05);">
                  <span style="background: #ef4444; color: white; font-size: 11px; font-weight: 800; padding: 3px 10px; border-radius: 999px;">1 HOUR</span>
                </td>
                <td style="padding: 8px 0; border-bottom: 1px solid rgba(255,255,255,0.05); color: #94a3b8; font-size: 13px; text-align: right;">Most urgent — writer starts immediately</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; border-bottom: 1px solid rgba(255,255,255,0.05);">
                  <span style="background: #f97316; color: white; font-size: 11px; font-weight: 800; padding: 3px 10px; border-radius: 999px;">3 HOURS</span>
                </td>
                <td style="padding: 8px 0; border-bottom: 1px solid rgba(255,255,255,0.05); color: #94a3b8; font-size: 13px; text-align: right;">Super rush — for same-morning deadlines</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; border-bottom: 1px solid rgba(255,255,255,0.05);">
                  <span style="background: #eab308; color: white; font-size: 11px; font-weight: 800; padding: 3px 10px; border-radius: 999px;">6 HOURS</span>
                </td>
                <td style="padding: 8px 0; border-bottom: 1px solid rgba(255,255,255,0.05); color: #94a3b8; font-size: 13px; text-align: right;">Rush — half-day turnaround</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; border-bottom: 1px solid rgba(255,255,255,0.05);">
                  <span style="background: #22c55e; color: white; font-size: 11px; font-weight: 800; padding: 3px 10px; border-radius: 999px;">12 HOURS</span>
                </td>
                <td style="padding: 8px 0; border-bottom: 1px solid rgba(255,255,255,0.05); color: #94a3b8; font-size: 13px; text-align: right;">Express — overnight delivery</td>
              </tr>
              <tr>
                <td style="padding: 8px 0;">
                  <span style="background: #0ea5e9; color: white; font-size: 11px; font-weight: 800; padding: 3px 10px; border-radius: 999px;">24 HOURS</span>
                </td>
                <td style="padding: 8px 0; color: #94a3b8; font-size: 13px; text-align: right;">Standard rush — due tomorrow</td>
              </tr>
            </table>
          </div>
        </div>

        <!-- What we handle -->
        <div style="padding: 0 32px;">
          <div style="background: #1e293b; border-radius: 12px; padding: 22px 24px; margin-bottom: 24px; border: 1px solid rgba(255,255,255,0.06);">
            <p style="color: #f87171; font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; margin: 0 0 14px;">We handle every kind of rush order</p>
            <div>
              ${["📄 Research Papers", "✍️ Essays & Assignments", "💼 Business Proposals", "📝 Blog Posts", "🔍 SEO Articles", "📊 Case Studies", "📚 Dissertations", "📣 Copywriting", "🧾 Reports", "📧 Email Campaigns"].map(s => `<span style="background: rgba(239,68,68,0.08); border: 1px solid rgba(239,68,68,0.2); color: #fca5a5; font-size: 12px; font-weight: 600; padding: 5px 12px; border-radius: 999px; display: inline-block; margin: 0 6px 8px 0;">${s}</span>`).join("")}
            </div>
          </div>
        </div>

        <!-- 3 reasons -->
        <div style="padding: 0 32px;">
          <p style="color: #f87171; font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; margin: 0 0 16px;">Why thousands trust WriteProf under pressure</p>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="width: 50%; padding: 0 8px 12px 0; vertical-align: top;">
                <div style="background: #1e293b; border-radius: 10px; padding: 18px; border: 1px solid rgba(255,255,255,0.06);">
                  <div style="font-size: 22px; margin-bottom: 8px;">🎓</div>
                  <p style="color: #e2e8f0; font-weight: 700; font-size: 14px; margin: 0 0 6px;">PhD-Level Writers</p>
                  <p style="color: #64748b; font-size: 13px; margin: 0; line-height: 1.6;">Every writer is vetted. Only PhDs, Masters holders & published authors make the cut.</p>
                </div>
              </td>
              <td style="width: 50%; padding: 0 0 12px 8px; vertical-align: top;">
                <div style="background: #1e293b; border-radius: 10px; padding: 18px; border: 1px solid rgba(255,255,255,0.06);">
                  <div style="font-size: 22px; margin-bottom: 8px;">🔒</div>
                  <p style="color: #e2e8f0; font-weight: 700; font-size: 14px; margin: 0 0 6px;">Safe Escrow</p>
                  <p style="color: #64748b; font-size: 13px; margin: 0; line-height: 1.6;">Your payment is held securely and only released when you approve the work.</p>
                </div>
              </td>
            </tr>
            <tr>
              <td style="width: 50%; padding: 0 8px 0 0; vertical-align: top;">
                <div style="background: #1e293b; border-radius: 10px; padding: 18px; border: 1px solid rgba(255,255,255,0.06);">
                  <div style="font-size: 22px; margin-bottom: 8px;">💬</div>
                  <p style="color: #e2e8f0; font-weight: 700; font-size: 14px; margin: 0 0 6px;">Live Chat</p>
                  <p style="color: #64748b; font-size: 13px; margin: 0; line-height: 1.6;">Message your writer directly as they work. Real-time updates on your order.</p>
                </div>
              </td>
              <td style="width: 50%; padding: 0 0 0 8px; vertical-align: top;">
                <div style="background: #1e293b; border-radius: 10px; padding: 18px; border: 1px solid rgba(255,255,255,0.06);">
                  <div style="font-size: 22px; margin-bottom: 8px;">♾️</div>
                  <p style="color: #e2e8f0; font-weight: 700; font-size: 14px; margin: 0 0 6px;">Free Revisions</p>
                  <p style="color: #64748b; font-size: 13px; margin: 0; line-height: 1.6;">Not perfect? Request unlimited revisions until you're 100% satisfied.</p>
                </div>
              </td>
            </tr>
          </table>
        </div>

        <!-- CTA -->
        <div style="padding: 36px 32px; text-align: center;">
          <p style="color: #64748b; font-size: 14px; margin: 0 0 20px;">⚡ Writers are online right now — post your order in under 2 minutes.</p>
          <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard"
             style="display: inline-block; background: linear-gradient(135deg, #b91c1c, #ef4444); color: white; padding: 16px 44px; border-radius: 10px; text-decoration: none; font-weight: 800; font-size: 16px; letter-spacing: 0.3px;">
            🚨 Post My Urgent Order Now →
          </a>
          <p style="color: #475569; font-size: 12px; margin: 16px 0 0;">Stuck? Chat with <strong>Aria</strong>, our 24/7 AI support, directly on the site.</p>
        </div>

        <!-- Footer -->
        <div style="padding: 20px 32px; background: #0a0f1e; border-top: 1px solid #1e293b; text-align: center;">
          <p style="color: #334155; font-size: 12px; margin: 0;">WriteProf — Emergency Writing Marketplace &nbsp;|&nbsp; <a href="mailto:oriaventures@gmail.com" style="color: #475569; text-decoration: none;">oriaventures@gmail.com</a></p>
        </div>
      </div>
    `,
  }),

  welcomeWriter: (name: string) => ({
    subject: "✍️ WriteProf Writer Application Received — Here's What Happens Next",
    html: `
      <div style="font-family: Inter, Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0f172a; color: #e2e8f0; border-radius: 16px; overflow: hidden;">
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #6d28d9 0%, #a855f7 100%); padding: 44px 32px; text-align: center;">
          <div style="display: inline-block; background: rgba(255,255,255,0.15); border-radius: 12px; padding: 8px 18px; margin-bottom: 14px;">
            <span style="color: white; font-size: 20px; font-weight: 900; letter-spacing: -0.5px;">Write<span style="color: #e9d5ff;">Prof</span></span>
          </div>
          <div style="font-size: 36px; margin-bottom: 10px;">✍️</div>
          <h1 style="color: white; font-size: 26px; font-weight: 800; margin: 0 0 8px; line-height: 1.3;">Application received, ${name}!<br/>Approval coming soon.</h1>
          <p style="color: rgba(255,255,255,0.85); margin: 0; font-size: 15px;">Writer's Portal — writeprof.com</p>
        </div>

        <!-- Approval status -->
        <div style="padding: 36px 32px 0;">
          <div style="background: linear-gradient(135deg, #1c1535, #1a1030); border-radius: 12px; padding: 22px 24px; margin-bottom: 24px; border: 1px solid rgba(168,85,247,0.3);">
            <p style="color: #c084fc; font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; margin: 0 0 10px;">⏳ Your Profile Is Under Review</p>
            <p style="color: #94a3b8; font-size: 14px; line-height: 1.8; margin: 0;">
              Our admin team manually reviews every writer before granting access. This usually takes <strong style="color: #e2e8f0;">24–48 hours</strong>. You'll get an email the moment you're approved — then your dashboard unlocks and orders start flowing in.
            </p>
          </div>
        </div>

        <!-- What WriteProf is for writers -->
        <div style="padding: 0 32px;">
          <div style="background: #1e293b; border-radius: 12px; padding: 22px 24px; margin-bottom: 24px; border: 1px solid rgba(255,255,255,0.06);">
            <p style="color: #a855f7; font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; margin: 0 0 12px;">What is WriteProf — for writers?</p>
            <p style="color: #94a3b8; font-size: 14px; line-height: 1.9; margin: 0;">
              WriteProf is built entirely around <strong style="color: #e2e8f0;">rush and short-deadline orders</strong>. Clients come to us when they're in a crunch — a paper due tonight, a proposal needed by morning, a blog post that was supposed to go live an hour ago. They need someone fast, skilled, and reliable. <strong style="color: #c084fc;">That's you.</strong>
              <br/><br/>
              Orders are typically due within <strong style="color: #e2e8f0;">1 to 24 hours</strong>. The tighter the deadline, the higher the payout. Writers who thrive here love the intensity, the variety, and the fact that every completed order puts money in their wallet the same day.
            </p>
          </div>
        </div>

        <!-- Earning potential -->
        <div style="padding: 0 32px;">
          <p style="color: #a855f7; font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; margin: 0 0 16px;">💰 What you can earn per order</p>
          <div style="background: #1e293b; border-radius: 12px; overflow: hidden; border: 1px solid rgba(255,255,255,0.06); margin-bottom: 24px;">
            <table style="width: 100%; border-collapse: collapse;">
              <tr style="background: rgba(168,85,247,0.1);">
                <th style="text-align: left; padding: 12px 16px; color: #a855f7; font-size: 12px; font-weight: 700; text-transform: uppercase;">Deadline</th>
                <th style="text-align: left; padding: 12px 16px; color: #a855f7; font-size: 12px; font-weight: 700; text-transform: uppercase;">Urgency Multiplier</th>
                <th style="text-align: right; padding: 12px 16px; color: #a855f7; font-size: 12px; font-weight: 700; text-transform: uppercase;">Your Cut (80%)</th>
              </tr>
              <tr style="border-top: 1px solid rgba(255,255,255,0.05);">
                <td style="padding: 11px 16px; color: #f87171; font-weight: 700; font-size: 13px;">1 Hour</td>
                <td style="padding: 11px 16px; color: #94a3b8; font-size: 13px;">×5.0</td>
                <td style="padding: 11px 16px; color: #22c55e; font-weight: 700; font-size: 13px; text-align: right;">~$60/page</td>
              </tr>
              <tr style="border-top: 1px solid rgba(255,255,255,0.05);">
                <td style="padding: 11px 16px; color: #fb923c; font-weight: 700; font-size: 13px;">3 Hours</td>
                <td style="padding: 11px 16px; color: #94a3b8; font-size: 13px;">×3.5</td>
                <td style="padding: 11px 16px; color: #22c55e; font-weight: 700; font-size: 13px; text-align: right;">~$42/page</td>
              </tr>
              <tr style="border-top: 1px solid rgba(255,255,255,0.05);">
                <td style="padding: 11px 16px; color: #facc15; font-weight: 700; font-size: 13px;">6 Hours</td>
                <td style="padding: 11px 16px; color: #94a3b8; font-size: 13px;">×2.5</td>
                <td style="padding: 11px 16px; color: #22c55e; font-weight: 700; font-size: 13px; text-align: right;">~$30/page</td>
              </tr>
              <tr style="border-top: 1px solid rgba(255,255,255,0.05);">
                <td style="padding: 11px 16px; color: #4ade80; font-weight: 700; font-size: 13px;">12 Hours</td>
                <td style="padding: 11px 16px; color: #94a3b8; font-size: 13px;">×1.75</td>
                <td style="padding: 11px 16px; color: #22c55e; font-weight: 700; font-size: 13px; text-align: right;">~$21/page</td>
              </tr>
              <tr style="border-top: 1px solid rgba(255,255,255,0.05);">
                <td style="padding: 11px 16px; color: #38bdf8; font-weight: 700; font-size: 13px;">24 Hours</td>
                <td style="padding: 11px 16px; color: #94a3b8; font-size: 13px;">×1.0</td>
                <td style="padding: 11px 16px; color: #22c55e; font-weight: 700; font-size: 13px; text-align: right;">~$12/page</td>
              </tr>
            </table>
          </div>
        </div>

        <!-- Writer perks -->
        <div style="padding: 0 32px;">
          <p style="color: #a855f7; font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; margin: 0 0 16px;">What you get as a WriteProf writer</p>
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 8px;">
            <tr>
              <td style="width: 50%; padding: 0 8px 12px 0; vertical-align: top;">
                <div style="background: #1e293b; border-radius: 10px; padding: 16px; border: 1px solid rgba(255,255,255,0.06);">
                  <div style="font-size: 20px; margin-bottom: 6px;">💸</div>
                  <p style="color: #e2e8f0; font-weight: 700; font-size: 13px; margin: 0 0 4px;">80% of Every Order</p>
                  <p style="color: #64748b; font-size: 12px; margin: 0; line-height: 1.6;">Industry-leading payout. We keep 20%, you keep the rest.</p>
                </div>
              </td>
              <td style="width: 50%; padding: 0 0 12px 8px; vertical-align: top;">
                <div style="background: #1e293b; border-radius: 10px; padding: 16px; border: 1px solid rgba(255,255,255,0.06);">
                  <div style="font-size: 20px; margin-bottom: 6px;">⚡</div>
                  <p style="color: #e2e8f0; font-weight: 700; font-size: 13px; margin: 0 0 4px;">Same-Day Pay</p>
                  <p style="color: #64748b; font-size: 12px; margin: 0; line-height: 1.6;">Funds hit your wallet the moment the client approves your work.</p>
                </div>
              </td>
            </tr>
            <tr>
              <td style="width: 50%; padding: 0 8px 0 0; vertical-align: top;">
                <div style="background: #1e293b; border-radius: 10px; padding: 16px; border: 1px solid rgba(255,255,255,0.06);">
                  <div style="font-size: 20px; margin-bottom: 6px;">📈</div>
                  <p style="color: #e2e8f0; font-weight: 700; font-size: 13px; margin: 0 0 4px;">Rank Up & Earn More</p>
                  <p style="color: #64748b; font-size: 12px; margin: 0; line-height: 1.6;">Rise from Active → Rising Star → Top Writer → Elite Pro.</p>
                </div>
              </td>
              <td style="width: 50%; padding: 0 0 0 8px; vertical-align: top;">
                <div style="background: #1e293b; border-radius: 10px; padding: 16px; border: 1px solid rgba(255,255,255,0.06);">
                  <div style="font-size: 20px; margin-bottom: 6px;">🌍</div>
                  <p style="color: #e2e8f0; font-weight: 700; font-size: 13px; margin: 0 0 4px;">Global Clients</p>
                  <p style="color: #64748b; font-size: 12px; margin: 0; line-height: 1.6;">Orders from the US, UK, Canada, Australia, UAE, and more — 24/7.</p>
                </div>
              </td>
            </tr>
          </table>
        </div>

        <!-- CTA -->
        <div style="padding: 36px 32px; text-align: center;">
          <p style="color: #64748b; font-size: 14px; margin: 0 0 20px;">We'll notify you the moment your account is approved. Get ready.</p>
          <a href="${process.env.NEXT_PUBLIC_APP_URL}/writer-dashboard"
             style="display: inline-block; background: linear-gradient(135deg, #6d28d9, #a855f7); color: white; padding: 16px 44px; border-radius: 10px; text-decoration: none; font-weight: 800; font-size: 16px; letter-spacing: 0.3px;">
            View My Writer Dashboard →
          </a>
          <p style="color: #475569; font-size: 12px; margin: 16px 0 0;">Questions? <a href="mailto:oriaventures@gmail.com" style="color: #a855f7; text-decoration: none;">oriaventures@gmail.com</a></p>
        </div>

        <!-- Footer -->
        <div style="padding: 20px 32px; background: #0a0f1e; border-top: 1px solid #1e293b; text-align: center;">
          <p style="color: #334155; font-size: 12px; margin: 0;">WriteProf — Emergency Writing Marketplace &nbsp;|&nbsp; <a href="mailto:oriaventures@gmail.com" style="color: #475569; text-decoration: none;">oriaventures@gmail.com</a></p>
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
