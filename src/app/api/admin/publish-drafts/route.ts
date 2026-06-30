import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";

// GET — count how many drafts are unpublished
export async function GET(req: NextRequest) {
  const token = req.cookies.get("wp_token")?.value;
  const payload = token ? await verifyToken(token) : null;
  if (!payload || payload.role !== "ADMIN") {
    return NextResponse.json({ error: "Admin only" }, { status: 401 });
  }

  const [drafts, published] = await Promise.all([
    prisma.sampleOrder.count({ where: { isPublished: false } }),
    prisma.sampleOrder.count({ where: { isPublished: true } }),
  ]);

  return NextResponse.json({ drafts, published, total: drafts + published });
}

// POST — publish all unpublished samples in one shot
export async function POST(req: NextRequest) {
  const token = req.cookies.get("wp_token")?.value;
  const payload = token ? await verifyToken(token) : null;
  if (!payload || payload.role !== "ADMIN") {
    return NextResponse.json({ error: "Admin only" }, { status: 401 });
  }

  const result = await prisma.sampleOrder.updateMany({
    where: { isPublished: false },
    data: { isPublished: true },
  });

  return NextResponse.json({
    success: true,
    published: result.count,
    message: `${result.count} draft samples are now live.`,
  });
}
