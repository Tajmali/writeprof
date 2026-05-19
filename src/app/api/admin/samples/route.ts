import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 80);
}

// GET — list all samples (admin)
export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const samples = await prisma.sampleOrder.findMany({
      orderBy: { createdAt: "desc" },
      include: { attachments: true },
    });

    return NextResponse.json({ success: true, data: samples });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// POST — create a new sample
export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const {
      title, subject, orderType, educationLevel, citationStyle,
      pages, wordCount, sources, language, description, tags,
      isPublished, attachments,
    } = body;

    if (!title || !subject || !orderType || !educationLevel || !description) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Generate unique slug
    const baseSlug = slugify(`${subject}-${orderType}-${title}`);
    let slug = baseSlug;
    let counter = 1;
    while (await prisma.sampleOrder.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${counter++}`;
    }

    const sample = await prisma.sampleOrder.create({
      data: {
        slug,
        title,
        subject,
        orderType,
        educationLevel,
        citationStyle: citationStyle || null,
        pages: Number(pages) || 1,
        wordCount: Number(wordCount) || 275,
        sources: sources ? Number(sources) : null,
        language: language || "English (US)",
        description,
        tags: tags || [],
        isPublished: isPublished || false,
        attachments: attachments?.length
          ? {
              create: attachments.map((a: { name: string; url: string; mimeType?: string }) => ({
                name: a.name,
                url: a.url,
                mimeType: a.mimeType || "application/pdf",
              })),
            }
          : undefined,
      },
      include: { attachments: true },
    });

    return NextResponse.json({ success: true, data: sample });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
