import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";
import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

function isGenericTags(tags: string[]): boolean {
  if (!tags || tags.length === 0) return true;
  if (tags.length <= 3) return true;
  return tags.every(t => t.split(" ").length <= 2);
}

async function generateSEOTags(
  title: string, subject: string, educationLevel: string,
  orderType: string, description: string
): Promise<string[]> {
  const snippet = description.slice(0, 600);
  const res = await anthropic.messages.create({
    model: "claude-haiku-4-5",
    max_tokens: 300,
    messages: [{
      role: "user",
      content: `Generate SEO keyword tags for this academic writing sample. Reply with ONLY a JSON array of strings.

Title: "${title}"
Subject: ${subject} | Level: ${educationLevel} | Type: ${orderType}
Content: """${snippet}"""

Generate 8-12 keyword phrases mixing:
- Topic: "${subject.toLowerCase()} essay example", "${subject.toLowerCase()} paper sample"
- Sample intent: "free ${orderType.toLowerCase()} on ${subject.toLowerCase()}", "${educationLevel.toLowerCase()} ${subject.toLowerCase()} sample"
- Buyer intent: "write my ${subject.toLowerCase()} essay", "pay someone to write ${subject.toLowerCase()} paper"
- Long-tail specific to the actual content topic

Return ONLY: ["tag1", "tag2", ...]`,
    }],
  });
  const text = res.content[0].type === "text" ? res.content[0].text : "[]";
  const arr  = JSON.parse(text.match(/\[[\s\S]*\]/)?.[0] || "[]");
  return Array.isArray(arr) ? arr.slice(0, 12) : [];
}

// GET — check how many need fixing
export async function GET(req: NextRequest) {
  const token = req.cookies.get("wp_token")?.value;
  const payload = token ? await verifyToken(token) : null;
  if (!payload || payload.role !== "ADMIN") {
    return NextResponse.json({ error: "Admin only" }, { status: 401 });
  }

  const all = await prisma.sampleOrder.findMany({ select: { id: true, tags: true } });
  const needsFix = all.filter(s => isGenericTags(s.tags));
  return NextResponse.json({
    total: all.length,
    needsFix: needsFix.length,
    message: `${needsFix.length} samples need SEO tags. POST to this endpoint to fix them (processes 50 at a time).`,
  });
}

// POST — fix a batch of 50
export async function POST(req: NextRequest) {
  const token = req.cookies.get("wp_token")?.value;
  const payload = token ? await verifyToken(token) : null;
  if (!payload || payload.role !== "ADMIN") {
    return NextResponse.json({ error: "Admin only" }, { status: 401 });
  }

  const all = await prisma.sampleOrder.findMany({
    select: { id: true, title: true, subject: true, educationLevel: true, orderType: true, description: true, tags: true },
  });

  const batch = all.filter(s => isGenericTags(s.tags)).slice(0, 50);

  if (batch.length === 0) {
    return NextResponse.json({ success: true, message: "All samples already have proper SEO tags ✅", fixed: 0, remaining: 0 });
  }

  let fixed  = 0;
  let failed = 0;

  for (const s of batch) {
    try {
      const tags = await generateSEOTags(s.title, s.subject, s.educationLevel, s.orderType, s.description || "");
      if (tags.length > 0) {
        await prisma.sampleOrder.update({ where: { id: s.id }, data: { tags } });
        fixed++;
      }
      await new Promise(r => setTimeout(r, 200));
    } catch {
      failed++;
    }
  }

  const remaining = all.filter(s => isGenericTags(s.tags)).length - fixed;

  return NextResponse.json({
    success: true,
    fixed,
    failed,
    remaining: Math.max(0, remaining),
    message: remaining > 0
      ? `Fixed ${fixed}. POST again to continue — ${remaining} samples left.`
      : `All done — all samples now have proper SEO tags ✅`,
  });
}
