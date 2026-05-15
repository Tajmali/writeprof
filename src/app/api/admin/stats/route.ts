import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get("wp_token")?.value;
    if (!token) return NextResponse.json({ success: false, error: "Not authenticated" }, { status: 401 });

    const payload = await verifyToken(token);
    if (!payload || payload.role !== "ADMIN") {
      return NextResponse.json({ success: false, error: "Admin access required" }, { status: 403 });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Last 7 days for charts
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - i);
      d.setHours(0, 0, 0, 0);
      return d;
    }).reverse();

    const [
      totalUsers,
      totalWriters,
      totalOrders,
      pendingOrders,
      activeOrders,
      completedOrders,
      completedToday,
      totalRevenueAgg,
      revenueToday,
      pendingPayoutsCount,
      disputes,
      ordersByStatus,
      topCategories,
      writerApproved,
      writerPending,
      writerVerified,
      platformEarningsAgg,
      successfulTransactions,
    ] = await Promise.all([
      prisma.user.count({ where: { role: "CLIENT" } }),
      prisma.writerProfile.count({ where: { isApproved: true } }),
      prisma.order.count(),
      prisma.order.count({ where: { status: "PENDING" } }),
      prisma.order.count({ where: { status: { in: ["ASSIGNED", "IN_PROGRESS"] } } }),
      prisma.order.count({ where: { status: "COMPLETED" } }),
      prisma.order.count({ where: { status: "COMPLETED", completedAt: { gte: today } } }),
      prisma.payment.aggregate({ where: { status: { in: ["ESCROW", "RELEASED", "PAID"] } }, _sum: { amount: true } }),
      prisma.payment.aggregate({ where: { status: { in: ["ESCROW", "PAID"] }, paidAt: { gte: today } }, _sum: { amount: true } }),
      prisma.transaction.count({ where: { type: "PAYOUT", status: "PENDING" } }),
      prisma.order.count({ where: { status: "DISPUTED" } }),
      // Orders by status
      prisma.order.groupBy({ by: ["status"], _count: true }),
      // Top categories
      prisma.order.groupBy({ by: ["category"], _count: true, orderBy: { _count: { category: "desc" } }, take: 8 }),
      prisma.writerProfile.count({ where: { isApproved: true } }),
      prisma.writerProfile.count({ where: { isApproved: false } }),
      prisma.writerProfile.count({ where: { isVerified: true } }),
      // Platform earnings (20% of all revenue)
      prisma.payment.aggregate({ where: { status: { in: ["RELEASED", "PAID"] } }, _sum: { commissionAmount: true } }),
      prisma.transaction.count({ where: { status: "PAID" } }),
    ]);

    // Revenue by day (last 7 days)
    const revenueByDay = await Promise.all(
      last7Days.map(async (day) => {
        const nextDay = new Date(day);
        nextDay.setDate(nextDay.getDate() + 1);

        const [revenue, orders] = await Promise.all([
          prisma.payment.aggregate({
            where: { status: { in: ["PAID", "ESCROW", "RELEASED"] }, paidAt: { gte: day, lt: nextDay } },
            _sum: { amount: true },
          }),
          prisma.order.count({ where: { createdAt: { gte: day, lt: nextDay } } }),
        ]);

        return {
          date: day.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" }),
          revenue: revenue._sum.amount || 0,
          orders,
        };
      })
    );

    return NextResponse.json({
      success: true,
      data: {
        totalUsers,
        totalWriters,
        totalOrders,
        totalRevenue: totalRevenueAgg._sum.amount || 0,
        totalPlatformEarnings: platformEarningsAgg._sum.commissionAmount || Math.floor((totalRevenueAgg._sum.amount || 0) * 0.2),
        pendingOrders,
        activeOrders,
        completedOrders,
        completedToday,
        revenueToday: revenueToday._sum.amount || 0,
        pendingPayouts: pendingPayoutsCount,
        disputedOrders: disputes,
        successfulTransactions,
        revenueByDay,
        ordersByStatus: ordersByStatus.map(s => ({ status: s.status, count: s._count })),
        topCategories: topCategories.map(c => ({ category: c.category || "Other", count: c._count })),
        writerStats: { approved: writerApproved, pending: writerPending, verified: writerVerified },
      },
    });
  } catch (err) {
    console.error("Admin stats error:", err);
    return NextResponse.json({ success: false, error: "Server error" }, { status: 500 });
  }
}
