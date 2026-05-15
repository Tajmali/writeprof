import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get("wp_token")?.value;
    if (!token) return NextResponse.json({ success: false, error: "Not authenticated" }, { status: 401 });
    const payload = await verifyToken(token);
    if (!payload) return NextResponse.json({ success: false, error: "Invalid token" }, { status: 401 });

    if (payload.role === "CLIENT") {
      const [totalOrders, activeOrders, completedOrders, totalSpent, pendingOrders] =
        await Promise.all([
          prisma.order.count({ where: { clientId: payload.userId } }),
          prisma.order.count({ where: { clientId: payload.userId, status: { in: ["ASSIGNED", "IN_PROGRESS", "UNDER_REVIEW"] } } }),
          prisma.order.count({ where: { clientId: payload.userId, status: "COMPLETED" } }),
          prisma.payment.aggregate({ where: { clientId: payload.userId, status: { in: ["PAID", "ESCROW", "RELEASED"] } }, _sum: { amount: true } }),
          prisma.order.count({ where: { clientId: payload.userId, status: "PENDING" } }),
        ]);
      return NextResponse.json({ success: true, data: { totalOrders, activeOrders, completedOrders, pendingOrders, totalSpent: totalSpent._sum.amount || 0 } });
    }

    if (payload.role === "WRITER") {
      const profile = await prisma.writerProfile.findUnique({ where: { userId: payload.userId } });
      if (!profile) return NextResponse.json({ success: false, error: "Profile not found" }, { status: 404 });
      const [totalOrders, activeOrders, completedOrders, pendingOrders] = await Promise.all([
        prisma.order.count({ where: { writerId: profile.id } }),
        prisma.order.count({ where: { writerId: profile.id, status: { in: ["ASSIGNED", "IN_PROGRESS"] } } }),
        prisma.order.count({ where: { writerId: profile.id, status: "COMPLETED" } }),
        prisma.order.count({ where: { writerId: profile.id, status: "UNDER_REVIEW" } }),
      ]);
      return NextResponse.json({ success: true, data: { totalOrders, activeOrders, completedOrders, pendingOrders, rating: profile.rating, onTimeDelivery: profile.onTimeDelivery, performanceScore: profile.performanceScore } });
    }

    return NextResponse.json({ success: false, error: "Unknown role" }, { status: 400 });
  } catch (err) {
    console.error("Dashboard stats error:", err);
    return NextResponse.json({ success: false, error: "Server error" }, { status: 500 });
  }
}
