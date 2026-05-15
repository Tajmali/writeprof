import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const token = req.cookies.get("wp_token")?.value;
    if (!token) return NextResponse.json({ success: false, error: "Not authenticated" }, { status: 401 });

    const payload = await verifyToken(token);
    if (!payload || payload.role !== "WRITER") {
      return NextResponse.json({ success: false, error: "Writer access required" }, { status: 403 });
    }

    const writerProfile = await prisma.writerProfile.findUnique({
      where: { userId: payload.userId },
    });

    if (!writerProfile || !writerProfile.isApproved) {
      return NextResponse.json({ success: false, error: "Writer not approved" }, { status: 403 });
    }

    if (writerProfile.status !== "AVAILABLE") {
      return NextResponse.json({ success: false, error: "You must be available to accept orders" }, { status: 400 });
    }

    // Check active orders count
    const activeCount = await prisma.order.count({
      where: { writerId: writerProfile.id, status: { in: ["ASSIGNED", "IN_PROGRESS"] } },
    });

    if (activeCount >= 5) {
      return NextResponse.json({ success: false, error: "You have reached the maximum active orders limit (5)" }, { status: 400 });
    }

    const order = await prisma.order.findUnique({ where: { id: params.id } });
    if (!order) return NextResponse.json({ success: false, error: "Order not found" }, { status: 404 });
    if (order.status !== "PENDING") {
      return NextResponse.json({ success: false, error: "Order is no longer available" }, { status: 400 });
    }

    const updated = await prisma.$transaction([
      prisma.order.update({
        where: { id: params.id },
        data: { writerId: writerProfile.id, status: "ASSIGNED", assignedAt: new Date() },
      }),
      prisma.writerProfile.update({
        where: { id: writerProfile.id },
        data: { status: "BUSY" },
      }),
      prisma.notification.create({
        data: {
          userId: order.clientId,
          type: "ORDER_ASSIGNED",
          title: "Writer Assigned!",
          message: `A professional writer has been assigned to your order "${order.title}"`,
          orderId: order.id,
        },
      }),
    ]);

    return NextResponse.json({ success: true, data: { order: updated[0] } });
  } catch (err) {
    console.error("Accept order error:", err);
    return NextResponse.json({ success: false, error: "Server error" }, { status: 500 });
  }
}
