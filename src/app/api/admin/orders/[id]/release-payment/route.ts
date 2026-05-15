import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const token = req.cookies.get("wp_token")?.value;
    if (!token) return NextResponse.json({ success: false, error: "Not authenticated" }, { status: 401 });
    const payload = await verifyToken(token);
    if (!payload || payload.role !== "ADMIN") return NextResponse.json({ success: false, error: "Admin access required" }, { status: 403 });

    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        payment: true,
        writer: { include: { user: true } },
        client: true,
      },
    });

    if (!order) return NextResponse.json({ success: false, error: "Order not found" }, { status: 404 });
    if (!order.payment) return NextResponse.json({ success: false, error: "No payment record" }, { status: 400 });
    if (order.payment.status !== "ESCROW") return NextResponse.json({ success: false, error: "Payment is not in escrow" }, { status: 400 });
    if (!order.writer) return NextResponse.json({ success: false, error: "No writer assigned" }, { status: 400 });

    await prisma.$transaction(async (tx) => {
      // Update payment status
      await tx.payment.update({
        where: { id: order.payment!.id },
        data: { status: "RELEASED", releasedAt: new Date() },
      });

      // Credit writer wallet
      await tx.wallet.upsert({
        where: { userId: order.writer!.userId },
        update: {
          balance: { increment: order.payment!.writerAmount },
          totalEarned: { increment: order.payment!.writerAmount },
        },
        create: {
          userId: order.writer!.userId,
          balance: order.payment!.writerAmount,
          totalEarned: order.payment!.writerAmount,
          totalSpent: 0,
        },
      });

      // Record transaction for writer
      await tx.transaction.create({
        data: {
          userId: order.writer!.userId,
          type: "PAYOUT",
          amount: order.payment!.writerAmount,
          description: `Payment for order ${order.orderNumber}`,
          reference: `PAYOUT-${order.orderNumber}-${Date.now()}`,
          status: "PAID",
        },
      });

      // Record commission transaction for platform (admin user placeholder — use admin's userId)
      await tx.transaction.create({
        data: {
          userId: payload.userId,
          type: "COMMISSION",
          amount: order.payment!.commissionAmount,
          description: `Commission from order ${order.orderNumber}`,
          reference: `COMMISSION-${order.orderNumber}-${Date.now()}`,
          status: "PAID",
        },
      });

      // Notify writer
      await tx.notification.create({
        data: {
          userId: order.writer!.userId,
          type: "PAYMENT_RELEASED",
          title: "Payment Released!",
          message: `$${order.payment!.writerAmount.toLocaleString()} has been added to your wallet for order ${order.orderNumber}.`,
          orderId: order.id,
        },
      });

      // Notify client
      await tx.notification.create({
        data: {
          userId: order.clientId,
          type: "PAYMENT_RELEASED",
          title: "Payment Released to Writer",
          message: `Payment for your order "${order.title}" has been released to the writer.`,
          orderId: order.id,
        },
      });

      // Update writer stats
      await tx.writerProfile.update({
        where: { id: order.writer!.id },
        data: {
          currentOrdersCount: { decrement: 1 },
          completedOrders: { increment: 1 },
          totalOrders: { increment: 1 },
        },
      });
    });

    return NextResponse.json({ success: true, message: "Payment released successfully" });
  } catch (err) {
    console.error("Release payment error:", err);
    return NextResponse.json({ success: false, error: "Server error" }, { status: 500 });
  }
}
