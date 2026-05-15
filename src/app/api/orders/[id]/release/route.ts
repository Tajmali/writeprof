import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const token = req.cookies.get("wp_token")?.value;
    if (!token) return NextResponse.json({ success: false, error: "Not authenticated" }, { status: 401 });
    const payload = await verifyToken(token);
    if (!payload || payload.role !== "CLIENT") return NextResponse.json({ success: false, error: "Client access required" }, { status: 403 });

    const order = await prisma.order.findUnique({
      where: { id: params.id, clientId: payload.userId },
      include: { writer: { include: { user: true } }, payment: true },
    });
    if (!order) return NextResponse.json({ success: false, error: "Order not found" }, { status: 404 });
    if (order.status !== "UNDER_REVIEW") return NextResponse.json({ success: false, error: "Order is not under review" }, { status: 400 });
    if (!order.payment) return NextResponse.json({ success: false, error: "No payment found for this order" }, { status: 400 });
    if (order.payment.status !== "ESCROW") return NextResponse.json({ success: false, error: "Payment not in escrow" }, { status: 400 });

    await prisma.$transaction([
      prisma.order.update({
        where: { id: params.id },
        data: { status: "COMPLETED", completedAt: new Date() },
      }),
      prisma.payment.update({
        where: { orderId: params.id },
        data: { status: "RELEASED", releasedAt: new Date() },
      }),
      // Credit writer wallet
      ...(order.writer
        ? [
            prisma.wallet.update({
              where: { userId: order.writer.userId },
              data: {
                balance: { increment: order.payment.writerAmount },
                totalEarned: { increment: order.payment.writerAmount },
              },
            }),
            prisma.writerProfile.update({
              where: { id: order.writer.id },
              data: {
                completedOrders: { increment: 1 },
                totalOrders: { increment: 1 },
                status: "AVAILABLE",
              },
            }),
            prisma.transaction.create({
              data: {
                userId: order.writer.userId,
                type: "PAYMENT",
                amount: order.payment.writerAmount,
                currency: "USD",
                description: `Payment for order ${order.orderNumber}`,
                status: "PAID",
              },
            }),
            prisma.notification.create({
              data: {
                userId: order.writer.userId,
                type: "PAYMENT_RELEASED",
                title: "Payment Released!",
                message: `$${order.payment.writerAmount.toLocaleString()} has been added to your wallet for order "${order.title}".`,
                orderId: params.id,
              },
            }),
          ]
        : []),
    ]);

    return NextResponse.json({ success: true, data: { message: "Order approved and payment released to writer." } });
  } catch (err) {
    console.error("Release payment error:", err);
    return NextResponse.json({ success: false, error: "Server error" }, { status: 500 });
  }
}
