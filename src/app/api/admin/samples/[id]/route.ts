import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

// GET single sample
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const sample = await prisma.sampleOrder.findUnique({
      where: { id: params.id },
      include: { attachments: true },
    });

    if (!sample) return NextResponse.json({ error: "Not found" }, { status: 404 });

    return NextResponse.json({ success: true, data: sample });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// PUT — update sample
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
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

    // Delete old attachments and recreate
    await prisma.sampleOrderFile.deleteMany({ where: { sampleOrderId: params.id } });

    const sample = await prisma.sampleOrder.update({
      where: { id: params.id },
      data: {
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

// DELETE
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await prisma.sampleOrder.delete({ where: { id: params.id } });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
