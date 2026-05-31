import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

function slugify(text: string): string {
  return (
    text
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .slice(0, 80) || "sample-" + Date.now().toString(36)
  );
}

function cleanSubject(raw: string): string {
  return raw
    .replace(/^\s*(re|fw|fwd)\s*:\s*/gi, "")
    .replace(/^order\s*(id\s*)?#?\d+\s*[-–:]\s*/gi, "")
    .replace(/^\[.*?\]\s*/g, "")
    .replace(/\s{2,}/g, " ")
    .trim() || "Untitled Sample";
}

// Extract "Customer's subject: 'XXX'" from the email body
function extractCustomerSubject(body: string): string | null {
  const match = body.match(/customer['']?s?\s+subject\s*:\s*['"]?([^\n'"]{3,120})['"]?/i);
  if (match) return match[1].trim();
  return null;
}

function cleanBody(raw: string): string {
  const lines = raw.split("\n");
  const out: string[] = [];
  for (const line of lines) {
    const t = line.trim();
    if (/^--\s*$/.test(t)) break;
    if (/^>/.test(t)) continue;
    if (/^On .+wrote:$/.test(t)) break;
    if (/^(From|Sent|To|Subject):\s/.test(t)) break;
    if (/^(best|kind|warm)?\s*(regards|wishes|thanks|cheers)[,.]?\s*$/i.test(t)) break;
    out.push(line);
  }
  return out.join("\n").trim();
}

async function extractMetadata(subject: string, body: string) {
  try {
    const snippet = body.slice(0, 1200);
    const res = await anthropic.messages.create({
      model: "claude-haiku-4-5",
      max_tokens: 500,
      messages: [{
        role: "user",
        content: `Classify this writing sample for an academic writing marketplace. Reply ONLY with valid JSON.

Subject: "${subject}"
Content: """${snippet}"""

{
  "title": "clean descriptive title under 80 chars, no order numbers",
  "subjectField": "one of: English, Business, Psychology, History, Biology, Chemistry, Physics, Sociology, Political Science, Economics, Law, Education, Nursing, Marketing, Computer Science, Environmental Science, Philosophy, Communications, Mathematics, General",
  "educationLevel": "one of: High School, Undergraduate, Graduate, PhD",
  "orderType": "one of: Essay, Research Paper, Dissertation Chapter, Case Study, Lab Report, Literature Review, Annotated Bibliography, Coursework, Term Paper, Thesis, Book Report, Article Review",
  "citationStyle": "APA, MLA, Chicago, Harvard, Vancouver, or null",
  "tags": ["8-12 SEO keyword phrases students search for — mix topic keywords like 'nursing essay example' with buyer-intent phrases like 'pay someone to write nursing essay', 'nursing essay sample free', 'undergraduate nursing paper example'. Be specific to the topic."]
}`,
      }],
    });
    const text = res.content[0].type === "text" ? res.content[0].text : "{}";
    const json = JSON.parse(text.match(/\{[\s\S]*\}/)?.[0] || "{}");
    return {
      title:          json.title          || subject,
      subjectField:   json.subjectField   || "General",
      educationLevel: json.educationLevel || "Undergraduate",
      orderType:      json.orderType      || "Essay",
      citationStyle:  json.citationStyle  || null,
      tags:           Array.isArray(json.tags) ? json.tags.slice(0, 12) : [],
    };
  } catch {
    return { title: subject, subjectField: "General", educationLevel: "Undergraduate", orderType: "Essay", citationStyle: null };
  }
}

export async function POST(req: NextRequest) {
  try {
    // ── Parse body first ──────────────────────────────────────────────────────
    const payload = await req.json();
    const { subject = "", body: rawBody = "", secret: bodySecret = "" } = payload;

    // ── Auth: check header OR body secret ─────────────────────────────────────
    const expectedSecret = process.env.SAMPLE_UPLOAD_SECRET || "";
    const headerSecret   = req.headers.get("x-webhook-secret") || "";

    if (expectedSecret) {
      const headerMatch = headerSecret.trim() === expectedSecret.trim();
      const bodyMatch   = bodySecret.trim()   === expectedSecret.trim();
      if (!headerMatch && !bodyMatch) {
        return NextResponse.json(
          { error: "Unauthorized", hint: "Check SAMPLE_UPLOAD_SECRET in Vercel matches WEBHOOK_SECRET in the script" },
          { status: 401 }
        );
      }
    }
    // If no secret is configured, allow through (open mode)

    // ── Validate content ──────────────────────────────────────────────────────
    const cleanedBody = cleanBody(rawBody);
    if (cleanedBody.length < 50) {
      return NextResponse.json({ error: "Content too short after cleaning (min 50 chars)" }, { status: 400 });
    }

    // Use "Customer's subject: 'XXX'" from body as title if present,
    // otherwise fall back to the cleaned email subject line
    const customerSubject = extractCustomerSubject(rawBody);
    const cleanedSubject  = customerSubject || cleanSubject(subject);

    // ── AI metadata ───────────────────────────────────────────────────────────
    const meta = await extractMetadata(cleanedSubject, cleanedBody);

    // ── Unique slug ───────────────────────────────────────────────────────────
    const baseSlug = slugify(`${meta.subjectField}-${meta.orderType}-${meta.title}`);
    let slug = baseSlug;
    let n = 1;
    while (await prisma.sampleOrder.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${n++}`;
    }

    const words = cleanedBody.trim().split(/\s+/).filter(Boolean).length;
    const pages = Math.max(1, Math.round(words / 275));

    // ── Create draft ──────────────────────────────────────────────────────────
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
        tags:           meta.tags.length > 0
          ? meta.tags
          : [meta.subjectField, meta.orderType, meta.educationLevel],
        isPublished:    false,
        views:          0,
      },
    });

    return NextResponse.json({
      success: true,
      message: `Draft created: "${meta.title}"`,
      data: { id: sample.id, slug: sample.slug },
    });

  } catch (err) {
    console.error("sample-upload webhook error:", err);
    return NextResponse.json({ error: "Server error", detail: String(err) }, { status: 500 });
  }
}
