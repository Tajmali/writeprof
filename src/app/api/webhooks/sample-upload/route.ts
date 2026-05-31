import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// ─── Security ────────────────────────────────────────────────────────────────
// Set SAMPLE_UPLOAD_SECRET in Vercel env vars.
// Make.com sends this in the X-Webhook-Secret header with every request.
function getSecret(): string {
  return process.env.SAMPLE_UPLOAD_SECRET || "";
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 80);
}

// ─── Detect metadata from subject line ───────────────────────────────────────
// Email subject format (optional):  [SAMPLE] Title | Subject | Level | Type
// Example: [SAMPLE] Climate Change Essay | Environmental Science | Undergraduate | Essay
// If the extra fields are missing, sensible defaults are used.
function parseSubject(subject: string): {
  title: string;
  subjectField: string;
  educationLevel: string;
  orderType: string;
} {
  // Strip the [SAMPLE] tag
  const cleaned = subject.replace(/^\[SAMPLE\]\s*/i, "").trim();
  const parts = cleaned.split("|").map((p) => p.trim());

  return {
    title:          parts[0] || "Untitled Sample",
    subjectField:   parts[1] || "General",
    educationLevel: parts[2] || "Undergraduate",
    orderType:      parts[3] || "Essay",
  };
}

// ─── Estimate word count and pages ───────────────────────────────────────────
function wordCount(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

// ─── POST /api/webhooks/sample-upload ────────────────────────────────────────
// Called by Make.com with:
// {
//   "secret": "your-secret",
//   "subject": "[SAMPLE] Essay on Climate | Environmental Science | Undergraduate | Essay",
//   "body": "Full plain text content of the email / file..."
// }
export async function POST(req: NextRequest) {
  try {
    // ── Auth ──────────────────────────────────────────────────────────────────
    const secret = getSecret();
    if (secret) {
      const headerSecret = req.headers.get("x-webhook-secret") || "";
      const bodySecret   = (await req.clone().json().catch(() => ({}))).secret || "";
      if (headerSecret !== secret && bodySecret !== secret) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
    }

    const body = await req.json();
    const { subject = "", body: content = "" } = body;

    if (!content || content.trim().length < 50) {
      return NextResponse.json({ error: "Content too short — minimum 50 characters" }, { status: 400 });
    }

    // ── Parse metadata from subject line ──────────────────────────────────────
    const { title, subjectField, educationLevel, orderType } = parseSubject(subject);

    // ── Generate unique slug ──────────────────────────────────────────────────
    const baseSlug = slugify(`${subjectField}-${orderType}-${title}`);
    let slug = baseSlug;
    let counter = 1;
    while (await prisma.sampleOrder.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${counter++}`;
    }

    const words = wordCount(content);
    const pages = Math.max(1, Math.round(words / 275));

    // ── Create draft sample (not published — review first) ────────────────────
    const sample = await prisma.sampleOrder.create({
      data: {
        slug,
        title,
        subject:        subjectField,
        orderType,
        educationLevel,
        citationStyle:  null,
        pages,
        wordCount:      words,
        sources:        null,
        language:       "English (US)",
        description:    content.slice(0, 500) + (content.length > 500 ? "…" : ""),
        tags:           [],
        isPublished:    false, // always draft — you publish from admin
        views:          0,
      },
    });

    return NextResponse.json({
      success: true,
      message: `Draft sample created: "${title}"`,
      data: {
        id:   sample.id,
        slug: sample.slug,
        adminUrl: `https://writeprof.com/admin/samples`,
      },
    });
  } catch (err) {
    console.error("Webhook sample-upload error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
