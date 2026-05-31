import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";
import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

function isBadTitle(title: string): boolean {
  return (
    /^order\s*(id\s*)?[:#]?\s*\d+/i.test(title.trim()) ||
    /^re\s*:/i.test(title.trim()) ||
    /^untitled/i.test(title.trim()) ||
    /^\d{5,}$/.test(title.trim())
  );
}

function extractCustomerSubject(text: string): string | null {
  const match = text.match(
    /customer[''']?s?\s+subject\s*:\s*['""]?([^\n'""]{3,150})['""]?/i
  );
  return match ? match[1].trim().replace(/['"]/g, "").trim() : null;
}

function extractFirstMeaningfulLine(text: string): string | null {
  const skipPatterns = [
    /^order\s*(id)?/i, /^customer/i, /^date/i, /^deadline/i,
    /^pages?:/i, /^words?:/i, /^subject:/i, /^type:/i, /^level:/i,
    /^style:/i, /^writer/i, /^hi\b/i, /^hello\b/i, /^dear\b/i,
    /^please\b/i, /^kindly\b/i, /^attached/i, /^find\s+attached/i,
    /^\s*$/, /^-{3,}/, /^\d+$/, /^[^a-zA-Z]{0,3}$/,
  ];
  for (const line of text.split("\n")) {
    const t = line.trim();
    if (t.length < 10 || t.length > 120) continue;
    if (skipPatterns.some(p => p.test(t))) continue;
    if (/^[a-zA-Z]/.test(t)) {
      const sentence = t.split(/[.!?]/)[0].trim();
      if (sentence.length >= 10) return sentence.slice(0, 80);
    }
  }
  return null;
}

async function generateTitleAI(description: string, subject: string, orderType: string): Promise<string> {
  const snippet = description.slice(0, 800);
  const res = await anthropic.messages.create({
    model: "claude-haiku-4-5",
    max_tokens: 80,
    messages: [{
      role: "user",
      content: `This is a ${orderType} about ${subject}. Read and reply with ONLY a short descriptive title (max 75 chars, no quotes, no order numbers, no generic phrases like "Academic Writing Sample"):\n\n${snippet}`,
    }],
  });
  const text = res.content[0].type === "text" ? res.content[0].text.trim() : "";
  return text.replace(/^["']|["']$/g, "").trim().slice(0, 80) || `${subject} ${orderType}`;
}

function slugify(text: string): string {
  return (
    text.toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .slice(0, 80) || "sample-" + Date.now().toString(36)
  );
}

// GET — audit current state
export async function GET(req: NextRequest) {
  const token = req.cookies.get("wp_token")?.value;
  const payload = token ? await verifyToken(token) : null;
  if (!payload || payload.role !== "ADMIN") {
    return NextResponse.json({ error: "Admin only" }, { status: 401 });
  }

  const all = await prisma.sampleOrder.findMany({
    select: { id: true, title: true, pages: true, wordCount: true, description: true },
  });

  const badTitles = all.filter(s => isBadTitle(s.title));
  const badPages  = all.filter(s => {
    const words   = (s.description || "").trim().split(/\s+/).filter(Boolean).length;
    const correct = Math.max(1, Math.round(words / 275));
    return s.pages !== correct;
  });

  return NextResponse.json({
    total: all.length,
    badTitles: badTitles.length,
    badPages:  badPages.length,
    message: `POST to fix up to 30 titles (AI) + all page counts in one call.`,
  });
}

// POST — fix titles (30 at a time via AI) + all page counts in one shot
export async function POST(req: NextRequest) {
  const token = req.cookies.get("wp_token")?.value;
  const payload = token ? await verifyToken(token) : null;
  if (!payload || payload.role !== "ADMIN") {
    return NextResponse.json({ error: "Admin only" }, { status: 401 });
  }

  const all = await prisma.sampleOrder.findMany({
    select: { id: true, title: true, slug: true, subject: true, orderType: true, pages: true, wordCount: true, description: true },
  });

  let titleFixed = 0;
  let pageFixed  = 0;
  let failed     = 0;

  // ── Fix page counts for ALL samples (pure math, no AI needed) ────────────
  for (const s of all) {
    const words   = (s.description || "").trim().split(/\s+/).filter(Boolean).length;
    const correct = Math.max(1, Math.round(words / 275));
    if (s.pages !== correct || s.wordCount !== words) {
      await prisma.sampleOrder.update({
        where: { id: s.id },
        data:  { pages: correct, wordCount: words },
      }).catch(() => {});
      pageFixed++;
    }
  }

  // ── Fix bad titles (batch of 30, uses AI) ────────────────────────────────
  const badTitleBatch = all.filter(s => isBadTitle(s.title)).slice(0, 30);

  for (const s of badTitleBatch) {
    try {
      const desc = s.description || "";

      // 1. Customer's subject field
      let newTitle = extractCustomerSubject(desc);

      // 2. First meaningful line
      if (!newTitle) newTitle = extractFirstMeaningfulLine(desc);

      // 3. AI fallback
      if (!newTitle && desc.length > 80) {
        newTitle = await generateTitleAI(desc, s.subject, s.orderType);
        await new Promise(r => setTimeout(r, 300));
      }

      if (!newTitle || newTitle.length < 5) { failed++; continue; }

      newTitle = newTitle.replace(/^[-–:,\s]+/, "").replace(/[-–:,\s]+$/, "").trim();

      // Unique slug
      const baseSlug = slugify(newTitle);
      let slug = baseSlug;
      let n = 1;
      while (true) {
        const existing = await prisma.sampleOrder.findUnique({ where: { slug } });
        if (!existing || existing.id === s.id) break;
        slug = `${baseSlug}-${n++}`;
      }

      await prisma.sampleOrder.update({ where: { id: s.id }, data: { title: newTitle, slug } });
      titleFixed++;

    } catch (e) {
      failed++;
    }
  }

  const remaining = all.filter(s => isBadTitle(s.title)).length - titleFixed;

  return NextResponse.json({
    success: true,
    titlesFixed: titleFixed,
    pagesFixed:  pageFixed,
    failed,
    remaining:   Math.max(0, remaining),
    message: remaining > 0
      ? `Fixed ${titleFixed} titles + ${pageFixed} page counts. POST again — ${remaining} bad titles left.`
      : `All done ✅ — ${titleFixed} titles fixed, ${pageFixed} page counts corrected.`,
  });
}
