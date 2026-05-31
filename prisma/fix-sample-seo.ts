/**
 * Backfill SEO tags for all samples that only have generic tags
 * e.g. ["General", "Essay", "Undergraduate"] → proper keyword phrases
 */
import { PrismaClient } from "@prisma/client";
import Anthropic from "@anthropic-ai/sdk";

const prisma    = new PrismaClient();
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

function isGenericTags(tags: string[]): boolean {
  if (!tags || tags.length === 0) return true;
  if (tags.length <= 3) return true;
  // If every tag is a single word, it's generic
  return tags.every(t => t.split(" ").length <= 2);
}

async function generateSEOTags(
  title: string,
  subject: string,
  educationLevel: string,
  orderType: string,
  description: string
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
Content snippet: """${snippet}"""

Generate 8-12 keyword phrases that students would search for. Mix:
- Topic-specific: "nursing care plan example", "healthcare policy essay"
- Sample/example intent: "${subject.toLowerCase()} essay sample", "free ${orderType.toLowerCase()} example"
- Buyer intent: "pay someone to write ${subject.toLowerCase()} essay", "${educationLevel.toLowerCase()} ${subject.toLowerCase()} paper"
- Long-tail: specific to the actual topic in the content

Return ONLY a JSON array: ["tag1", "tag2", ...]`,
    }],
  });
  const text = res.content[0].type === "text" ? res.content[0].text : "[]";
  const arr  = JSON.parse(text.match(/\[[\s\S]*\]/)?.[0] || "[]");
  return Array.isArray(arr) ? arr.slice(0, 12) : [];
}

async function main() {
  const samples = await prisma.sampleOrder.findMany({
    select: { id: true, title: true, subject: true, educationLevel: true, orderType: true, description: true, tags: true },
  });

  const needsFix = samples.filter(s => isGenericTags(s.tags));
  console.log(`Found ${needsFix.length} samples needing SEO tags out of ${samples.length} total.\n`);

  if (needsFix.length === 0) {
    console.log("✅ All samples already have proper SEO tags.");
    return;
  }

  let fixed  = 0;
  let failed = 0;

  for (let i = 0; i < needsFix.length; i++) {
    const s = needsFix[i];
    try {
      const tags = await generateSEOTags(
        s.title,
        s.subject,
        s.educationLevel,
        s.orderType,
        s.description || ""
      );

      if (tags.length === 0) {
        console.log(`  ⏭  [${i+1}/${needsFix.length}] Skipped (no tags): ${s.title.slice(0, 50)}`);
        continue;
      }

      await prisma.sampleOrder.update({
        where: { id: s.id },
        data:  { tags },
      });

      console.log(`  ✅ [${i+1}/${needsFix.length}] ${s.title.slice(0, 45).padEnd(45)} → [${tags.slice(0,3).join(", ")}...]`);
      fixed++;

      // 250ms between calls — keeps Haiku well under rate limits
      await new Promise(r => setTimeout(r, 250));

    } catch (e: any) {
      console.error(`  ❌ [${i+1}] ${s.title.slice(0, 40)}: ${e.message}`);
      failed++;
      await new Promise(r => setTimeout(r, 500));
    }
  }

  console.log(`\n─────────────────────────────────────`);
  console.log(`Done: ${fixed} fixed, ${failed} failed`);
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
