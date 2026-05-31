import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// ─── Security ────────────────────────────────────────────────────────────────
function getSecret(): string {
  return process.env.SAMPLE_UPLOAD_SECRET || "";
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 80)
    || "sample-" + Date.now().toString(36);
}

// ─── Clean a raw email subject into a readable title ─────────────────────────
function cleanSubject(raw: string): string {
  return raw
    .replace(/^\s*(re|fw|fwd|sv|aw)\s*:\s*/gi, "")   // strip Re: Fw: etc.
    .replace(/^order\s*#?\d+\s*[-–:]\s*/gi, "")       // strip "Order #123 - "
    .replace(/^\[.*?\]\s*/g, "")                       // strip [SAMPLE] [completed] etc.
    .replace(/\s{2,}/g, " ")
    .trim()
    || "Untitled Sample";
}

// ─── Strip email clutter from body ───────────────────────────────────────────
function cleanBody(raw: string): string {
  const lines = raw.split("\n");
  const cleaned: string[] = [];

  for (const line of lines) {
    const trimmed = line.trim();
    // Stop at email signature / quoted thread markers
    if (/^--\s*$/.test(trimmed)) break;
    if (/^>{1,}/.test(trimmed)) continue;          // quoted reply lines
    if (/^On .+wrote:$/.test(trimmed)) break;       // "On Mon, ... wrote:"
    if (/^From:\s/.test(trimmed)) break;            // forwarded header
    if (/^Sent:\s/.test(trimmed)) break;
    if (/^(Best|Kind|Warm)?\s*(regards|wishes|thanks|cheers)[,.]?\s*$/i.test(trimmed)) break;
    cleaned.push(line);
  }

  return cleaned.join("\n").trim();
}

// ─── AI: extract subject area, level, type, and a clean title ────────────────
async function extractMetadata(subject: string, body: string): Promise<{
  title: string;
  subjectField: string;
  educationLevel: string;
  orderType: string;
  citationStyle: string | null;
}> {
  try {
    const snippet = body.slice(0, 1200); // keep tokens low
    const prompt = `You are classifying a completed writing sample for an academic writing marketplace.

Email subject: "${subject}"
Content snippet:
"""
${snippet}
"""

Reply with ONLY valid JSON, no explanation:
{
  "title": "A clean descriptive title (max 80 chars, no order numbers)",
  "subjectField": "One of: English, Business, Psychology, History, Biology, Chemistry, Physics, Sociology, Political Science, Economics, Law, Education, Nursing, Marketing, Computer Science, Environmental Science, Philosophy, Communications, Mathematics, General",
  "educationLevel": "One of: High School, Undergraduate, Graduate, PhD",
  "orderType": "One of: Essay, Research Paper, Dissertation Chapter, Case Study, Lab Report, Literature Review, Annotated Bibliography, Coursework, Term Paper, Thesis, Book Report, Article Review",
  "citationStyle": "One of: APA, MLA, Chicago, Harvard, Vancouver, or null if not detected"
}`;

    const response = await anthropic.messages.create({
      model: "claude-haiku-4-5",
      max_tokens: 300,
      messages: [{ role: "user", content: prompt }],
    });

    const text = response.content[0].type === "text" ? response.content[0].text : "{}";
    const json = JSON.parse(text.match(/\{[\s\S]*\}/)?.[0] || "{}");

    return {
      title:          json.title          || subject,
      subjectField:   json.subjectField   || "General",
      educationLevel: json.educationLevel || "Undergraduate",
      orderType:      json.orderType      || "Essay",
      citationStyle:  json.citationStyle  || null,
    };
  } catch {
    // Fall back to defaults if AI fails — never block the upload
    return {
      title:          subject,
      subjectField:   "General",
      educationLevel: "Undergraduate",
      orderType:      "Essay",
      citationStyle:  null,
    };
  }
}

// ─── POST /api/webhooks/sample-upload ────────────────────────────────────────
export async function POST(req: NextRequest) {
  try {
    // ── Auth ──────────────────────────────────────────────────────────────────
    const secret = getSecret();
    if (secret) {
      const headerSecret = req.headers.get("x-webhook-secret") || "";
      const body = await req.json();
      const bodySecret = body.secret || "";

      if (headerSecret !== secret && bodySecret !== secret) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }

      const { subject = "", body: rawBody = "" } = body;
      const cleanedSubject = cleanSubject(subject);
      const cleanedBody    = cleanBody(rawBody);

      if (cleanedBody.length < 50) {
        return NextResponse.json({ error: "Content too short after cleaning" }, { status: 400 });
      }

      // ── AI metadata extraction ─────────────────────────────────────────────
      const meta = await extractMetadata(cleanedSubject, cleanedBody);

      // ── Generate unique slug ───────────────────────────────────────────────
      const baseSlug = slugify(`${meta.subjectField}-${meta.orderType}-${meta.title}`);
      let slug = baseSlug;
      let counter = 1;
      while (await prisma.sampleOrder.findUnique({ where: { slug } })) {
        slug = `${baseSlug}-${counter++}`;
      }

      const words = cleanedBody.trim().split(/\s+/).filter(Boolean).length;
      const pages = Math.max(1, Math.round(words / 275));

      // ── Save as draft ──────────────────────────────────────────────────────
      const sample = await prisma.sampleOrder.create({
        data: {
          slug,
          title:          meta.title,
          subject:        meta.subjectField,
          orderType:      meta.orderType,
          educationLevel: meta.educationLevel,
          citationStyle:  meta.citationStyle,
          pages,
          wordCount:      words,
          sources:        null,
          language:       "English (US)",
          description:    cleanedBody,
          tags:           [meta.subjectField, meta.orderType, meta.educationLevel],
          isPublished:    false,
          views:          0,
        },
      });

      return NextResponse.json({
        success: true,
        message: `Draft created: "${meta.title}"`,
        data: { id: sample.id, slug: sample.slug },
      });
    }

    return NextResponse.json({ error: "Server not configured" }, { status: 500 });
  } catch (err) {
    console.error("Webhook sample-upload error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
