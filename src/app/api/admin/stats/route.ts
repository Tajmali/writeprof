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

    // Time windows for real % changes
    const thisWeekStart = new Date(); thisWeekStart.setDate(thisWeekStart.getDate() - 7); thisWeekStart.setHours(0,0,0,0);
    const lastWeekStart = new Date(); lastWeekStart.setDate(lastWeekStart.getDate() - 14); lastWeekStart.setHours(0,0,0,0);

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
      // Real change data
      usersThisWeek,
      usersLastWeek,
      ordersThisWeek,
      ordersLastWeek,
      revenueThisWeek,
      revenueLastWeek,
      // Content visibility
      blogViewsTotal,
      topBlogPosts,
      sampleViewsTotal,
      topSamples,
      totalBlogPosts,
      totalSamples,
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
      prisma.order.groupBy({ by: ["status"], _count: true }),
      prisma.order.groupBy({ by: ["category"], _count: true, orderBy: { _count: { category: "desc" } }, take: 8 }),
      prisma.writerProfile.count({ where: { isApproved: true } }),
      prisma.writerProfile.count({ where: { isApproved: false } }),
      prisma.writerProfile.count({ where: { isVerified: true } }),
      prisma.payment.aggregate({ where: { status: { in: ["RELEASED", "PAID"] } }, _sum: { commissionAmount: true } }),
      prisma.transaction.count({ where: { status: "PAID" } }),
      // Week-over-week for real % changes
      prisma.user.count({ where: { role: "CLIENT", createdAt: { gte: thisWeekStart } } }),
      prisma.user.count({ where: { role: "CLIENT", createdAt: { gte: lastWeekStart, lt: thisWeekStart } } }),
      prisma.order.count({ where: { createdAt: { gte: thisWeekStart } } }),
      prisma.order.count({ where: { createdAt: { gte: lastWeekStart, lt: thisWeekStart } } }),
      prisma.payment.aggregate({ where: { status: { in: ["ESCROW","RELEASED","PAID"] }, paidAt: { gte: thisWeekStart } }, _sum: { amount: true } }),
      prisma.payment.aggregate({ where: { status: { in: ["ESCROW","RELEASED","PAID"] }, paidAt: { gte: lastWeekStart, lt: thisWeekStart } }, _sum: { amount: true } }),
      // Blog content visibility
      prisma.blogPost.aggregate({ where: { isPublished: true }, _sum: { views: true } }),
      prisma.blogPost.findMany({ where: { isPublished: true }, orderBy: { views: "desc" }, take: 10, select: { title: true, slug: true, views: true, category: true, createdAt: true } }),
      prisma.sampleOrder.aggregate({ where: { isPublished: true }, _sum: { views: true } }),
      prisma.sampleOrder.findMany({ where: { isPublished: true }, orderBy: { views: "desc" }, take: 10, select: { title: true, slug: true, views: true, subject: true } }),
      prisma.blogPost.count({ where: { isPublished: true } }),
      prisma.sampleOrder.count({ where: { isPublished: true } }),
    ]);

    // Real week-over-week % changes
    const pct = (curr: number, prev: number) => {
      if (prev === 0) return curr > 0 ? "+100" : "0";
      const change = ((curr - prev) / prev) * 100;
      return (change >= 0 ? "+" : "") + change.toFixed(1);
    };
    const up = (curr: number, prev: number) => curr >= prev;

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

    const revThis = revenueThisWeek._sum.amount || 0;
    const revLast = revenueLastWeek._sum.amount || 0;

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
        // Real week-over-week changes
        changes: {
          revenue: { pct: pct(revThis, revLast), up: up(revThis, revLast) },
          users:   { pct: pct(usersThisWeek, usersLastWeek), up: up(usersThisWeek, usersLastWeek) },
          orders:  { pct: pct(ordersThisWeek, ordersLastWeek), up: up(ordersThisWeek, ordersLastWeek) },
        },
        // Content visibility — real data only
        content: {
          totalBlogPosts,
          totalBlogViews: blogViewsTotal._sum.views || 0,
          topBlogPosts,
          totalSamples,
          totalSampleViews: sampleViewsTotal._sum.views || 0,
          topSamples,
        },
      },
    });
  } catch (err) {
    console.error("Admin stats error:", err);
    return NextResponse.json({ success: false, error: "Server error" }, { status: 500 });
  }
}
