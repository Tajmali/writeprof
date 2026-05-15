import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";

const reviewSchema = z.object({
  orderId: z.string(),
  targetId: z.string(),
  rating: z.number().int().min(1).max(5),
  comment: z.string().min(10, "Comment must be at least 10 characters"),
});

export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get("wp_token")?.value;
    if (!token) return NextResponse.json({ success: false, error: "Not authenticated" }, { status: 401 });
    const payload = await verifyToken(token);
    if (!payload) return NextResponse.json({ success: false, error: "Invalid token" }, { status: 401 });

    const body = await req.json();
    const data = reviewSchema.parse(body);

    const order = await prisma.order.findUnique({ where: { id: data.orderId } });
    if (!order || order.status !== "COMPLETED") return NextResponse.json({ success: false, error: "Can only review completed orders" }, { status: 400 });

    const existing = await prisma.review.findFirst({ where: { orderId: data.orderId, authorId: payload.userId } });
    if (existing) return NextResponse.json({ success: false, error: "You have already reviewed this order" }, { status: 400 });

    const review = await prisma.review.create({
      data: { orderId: data.orderId, authorId: payload.userId, targetId: data.targetId, rating: data.rating, comment: data.comment },
    });

    // Update writer rating if reviewing writer
    const writerProfile = await prisma.writerProfile.findUnique({ where: { userId: data.targetId } });
    if (writerProfile) {
      const allReviews = await prisma.review.aggregate({ where: { targetId: data.targetId }, _avg: { rating: true }, _count: { id: true } });
      const avgRating = allReviews._avg.rating || 0;
      await prisma.writerProfile.update({
        where: { userId: data.targetId },
        data: { rating: avgRating, averageRating: avgRating, totalReviews: allReviews._count.id },
      });
    }

    return NextResponse.json({ success: true, data: { review } }, { status: 201 });
  } catch (err) {
    if (err instanceof z.ZodError) return NextResponse.json({ success: false, error: err.errors[0].message }, { status: 400 });
    return NextResponse.json({ success: false, error: "Server error" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const targetId = url.searchParams.get("targetId");
    const orderId = url.searchParams.get("orderId");

    const where: Record<string, string> = {};
    if (targetId) where.targetId = targetId;
    if (orderId) where.orderId = orderId;

    const reviews = await prisma.review.findMany({
      where,
      include: { author: { select: { id: true, name: true, avatar: true } } },
      orderBy: { createdAt: "desc" },
      take: 20,
    });

    return NextResponse.json({ success: true, data: { reviews } });
  } catch (err) {
    return NextResponse.json({ success: false, error: "Server error" }, { status: 500 });
  }
}
