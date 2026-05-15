import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get("wp_token")?.value;
    if (!token) return NextResponse.json({ success: false, error: "Not authenticated" }, { status: 401 });
    const payload = await verifyToken(token);
    if (!payload || payload.role !== "WRITER") return NextResponse.json({ success: false, error: "Writer access required" }, { status: 403 });

    const profile = await prisma.writerProfile.findUnique({
      where: { userId: payload.userId },
      include: { user: { include: { wallet: true } } },
    });
    if (!profile) return NextResponse.json({ success: false, error: "Profile not found" }, { status: 404 });

    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const [monthlyCompleted, weeklyCompleted, totalReviews, avgRating] = await Promise.all([
      prisma.order.count({ where: { writerId: profile.id, status: "COMPLETED", completedAt: { gte: monthStart } } }),
      prisma.order.count({ where: { writerId: profile.id, status: "COMPLETED", completedAt: { gte: weekStart } } }),
      prisma.review.count({ where: { targetId: payload.userId } }),
      prisma.review.aggregate({ where: { targetId: payload.userId }, _avg: { rating: true } }),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        profile,
        wallet: profile.user.wallet,
        monthlyCompleted,
        weeklyCompleted,
        totalReviews,
        avgRating: avgRating._avg.rating || 0,
      },
    });
  } catch (err) {
    return NextResponse.json({ success: false, error: "Server error" }, { status: 500 });
  }
}
