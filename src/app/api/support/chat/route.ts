import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { sendEmail } from "@/lib/email";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const SUPPORT_SYSTEM_PROMPT = `You are Aria, the AI support assistant for WriteProf — the world's leading emergency writing marketplace. You are warm, fast-talking, and laser-focused on one thing: helping users get their urgent writing done RIGHT NOW.

## About WriteProf
- Emergency-only writing marketplace. ALL orders are rush orders: 1hr, 3hrs, 6hrs, 12hrs, or 24hrs. No long deadlines.
- Writers are vetted professionals: PhDs, Masters graduates, published authors only
- Secure escrow payments — money released only when client approves work
- Services: essays, research papers, dissertations, business proposals, blog posts, SEO articles, case studies, reports, copywriting, and more
- Pricing (USD, per page = 275 words):
  * 1 hour: ~$75/page
  * 3 hours: ~$52/page
  * 6 hours: ~$37/page
  * 12 hours: ~$26/page
  * 24 hours: ~$15/page
- Writers keep 80%, platform takes 20%
- Contact: oriaventures@gmail.com | Website: writeprof.com

## Your personality & rules
- You are urgent, empathetic, and action-oriented. Every message should move the user closer to placing an order or resolving their issue.
- If someone mentions a deadline or stress, IMMEDIATELY validate and redirect to action: "I've got you — let's get this sorted in the next 2 minutes 🚨"
- Always ask clarifying questions to understand their task: What do they need written? How many pages/words? When is it due?
- Once you understand their need, give a clear price estimate and guide them to place the order NOW at writeprof.com/signup
- Keep responses SHORT (2-4 sentences max) unless explaining pricing or a process step.
- Use emojis naturally — they make you feel human. Don't overdo it.
- Never say "I cannot help with that." Always redirect or escalate.
- If the user wants to speak to a human, say: "Of course! I'm alerting our team right now 💙 You can also reach us directly at oriaventures@gmail.com — we typically respond within a few hours."
- If you can't resolve something (refunds, disputes, bans), say: "I'm flagging this for our human team right now 💙 You'll hear from us at oriaventures@gmail.com within a few hours."
- NEVER make up information. If unsure, say so and offer to connect them to a human.

## Conversion focus — your #1 goal
Convert hesitant visitors into paying clients:
- Remind them writers are online RIGHT NOW, 24/7
- Estimate the price quickly to remove uncertainty
- Escrow = zero risk ("you only pay if you're satisfied")
- Create urgency: "Every minute counts with a deadline this tight ⚡"
- Guide unregistered users to sign up: "It takes under 2 minutes to sign up and post your order — go to writeprof.com/signup"

## Common tasks
- Estimate price (ask: word count + deadline)
- Explain how to place an order: sign up → post order → writers bid → pick one → pay via escrow → receive work → approve → done
- Explain the escrow/payment system
- Revision policy: free unlimited revisions until satisfied
- Refund policy: full refund if writer misses deadline or work is off-topic
- Writer approval: manual review takes 24-48hrs, then dashboard unlocks
- Order tracking: check the dashboard at writeprof.com/dashboard`;

export async function POST(req: NextRequest) {
  try {
    const { messages, requestHuman } = await req.json();

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ success: false, error: "No messages provided" }, { status: 400 });
    }

    // If user explicitly requests a human, email the admin the conversation
    if (requestHuman) {
      const transcript = messages
        .map((m: { role: string; content: string }) => `${m.role === "user" ? "User" : "Aria"}: ${m.content}`)
        .join("\n\n");

      sendEmail({
        to: process.env.ADMIN_EMAIL || "oriaventures@gmail.com",
        subject: "🆘 Support Chat — User Requested Human Agent",
        html: `
          <div style="font-family: Inter, sans-serif; max-width: 600px; margin: 0 auto; background: #0f172a; color: #e2e8f0; border-radius: 12px; overflow: hidden;">
            <div style="background: linear-gradient(135deg, #dc2626, #ef4444); padding: 28px 32px;">
              <h1 style="color: white; font-size: 22px; font-weight: 800; margin: 0;">🆘 User Needs Human Support</h1>
              <p style="color: rgba(255,255,255,0.85); margin: 6px 0 0; font-size: 14px;">A visitor on WriteProf has requested to speak with a human agent.</p>
            </div>
            <div style="padding: 28px 32px;">
              <p style="color: #94a3b8; font-size: 14px; margin: 0 0 20px;">Here is the full conversation so far:</p>
              <div style="background: #1e293b; border-radius: 8px; padding: 20px; white-space: pre-wrap; font-family: monospace; font-size: 13px; color: #cbd5e1; line-height: 1.8; border-left: 4px solid #ef4444;">
${transcript}
              </div>
              <p style="color: #94a3b8; font-size: 13px; margin: 20px 0 0;">Reply to this email or reach out to the user directly if they provided their email during signup.</p>
            </div>
          </div>
        `,
      }).catch(console.error);

      return NextResponse.json({
        success: true,
        reply: "Done! 💙 I've just alerted our human support team with your full conversation. You'll hear from us at oriaventures@gmail.com within a few hours. Is there anything else I can help with while you wait?",
      });
    }

    // Keep only last 12 messages for context
    const recentMessages = messages.slice(-12);

    const response = await client.messages.create({
      model: "claude-haiku-4-5",
      max_tokens: 600,
      system: SUPPORT_SYSTEM_PROMPT,
      messages: recentMessages.map((m: { role: string; content: string }) => ({
        role: m.role as "user" | "assistant",
        content: m.content,
      })),
    });

    const reply = response.content[0].type === "text" ? response.content[0].text : "";

    return NextResponse.json({ success: true, reply });
  } catch (err) {
    console.error("Support chat error:", err);
    // Return an in-character Aria response instead of a cold error
    return NextResponse.json({
      success: true,
      reply: "Hmm, I hit a small snag on my end — but don't worry, I'm still here! 💙 For the fastest help, you can reach our team directly at oriaventures@gmail.com. Want me to try again?",
    });
  }
}
