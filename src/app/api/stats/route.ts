import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Base numbers — added to real counts so the site never looks empty
// Increase these over time as you grow
const BASE_ORDERS = 1240;
const BASE_CLIENTS = 3850;
const BASE_WRITERS = 120;

export async function GET() {
  try {
    const [
      completedOrders,
      totalClients,
      approvedWriters,
      ratingResult,
    ] = await Promise.all([
      prisma.order.count({ where: { status: "COMPLETED" } }),
      prisma.user.count({ where: { role: "CLIENT" } }),
      prisma.user.count({ where: { role: "WRITER", writerProfile: { isApproved: true } } }),
      prisma.writerProfile.aggregate({ _avg: { rating: true } }),
    ]);

    const avgRating = ratingResult._avg.rating ?? 4.9;

    return NextResponse.json({
      success: true,
      data: {
        ordersCompleted: BASE_ORDERS + completedOrders,
        totalClients:    BASE_CLIENTS + totalClients,
        activeWriters:   BASE_WRITERS + approvedWriters,
        avgRating:       Math.min(5, Math.round(avgRating * 10) / 10),
      },
    }, {
      headers: { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600" },
    });
  } catch (err) {
    console.error("Stats error:", err);
    // Return safe fallback values if DB fails
    return NextResponse.json({
      success: true,
      data: {
        ordersCompleted: BASE_ORDERS,
        totalClients:    BASE_CLIENTS,
        activeWriters:   BASE_WRITERS,
        avgRating:       4.9,
      },
    });
  }
}
