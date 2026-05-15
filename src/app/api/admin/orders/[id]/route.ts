import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const token = req.cookies.get("wp_token")?.value;
    if (!token) return NextResponse.json({ success: false, error: "Not authenticated" }, { status: 401 });
    const payload = await verifyToken(token);
    if (!payload || payload.role !== "ADMIN") return NextResponse.json({ success: false, error: "Admin access required" }, { status: 403 });

    const body = await req.json();
    const { status, writerId, adminNote, action } = body;

    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        client: true,
        writer: { include: { user: true } },
        payment: true,
      },
    });
    if (!order) return NextResponse.json({ success: false, error: "Order not found" }, { status: 404 });

    // Handle refund action
    if (action === "refund" && order.payment) {
      await prisma.$transaction(async (tx) => {
        await tx.payment.update({
          where: { id: order.payment!.id },
          data: { status: "REFUNDED", refundedAt: new Date() },
        });

        // Credit client wallet
        await tx.wallet.upsert({
          where: { userId: order.clientId },
          update: { balance: { increment: order.payment!.escrowAmount } },
          create: {
            userId: order.clientId,
            balance: order.payment!.escrowAmount,
            totalEarned: 0,
            totalSpent: 0,
          },
        });

        await tx.transaction.create({
          data: {
            userId: order.clientId,
            type: "REFUND",
            amount: order.payment!.escrowAmount,
            description: `Refund for order ${order.orderNumber}`,
            reference: `REFUND-${order.orderNumber}-${Date.now()}`,
            status: "PAID",
          },
        });

        await tx.notification.create({
          data: {
            userId: order.clientId,
            type: "PAYMENT_RECEIVED",
            title: "Refund Processed",
            message: `A refund of $${order.payment!.escrowAmount.toLocaleString()} has been added to your wallet for order ${order.orderNumber}.`,
            orderId: order.id,
          },
        });
      });

      return NextResponse.json({ success: true, message: "Refund processed" });
    }

    const updateData: Record<string, unknown> = {};

    if (status) {
      updateData.status = status;
      if (status === "COMPLETED") updateData.completedAt = new Date();
    }

    // Assign writer
    if (writerId) {
      const writerProfile = await prisma.writerProfile.findUnique({
        where: { id: writerId },
        include: { user: true },
      });
      if (!writerProfile) return NextResponse.json({ success: false, error: "Writer not found" }, { status: 404 });

      updateData.writerId = writerId;
      updateData.status = "ASSIGNED";
      updateData.assignedAt = new Date();

      // Notify client
      await prisma.notification.create({
        data: {
          userId: order.clientId,
          type: "ORDER_ASSIGNED",
          title: "Writer Assigned!",
          message: `${writerProfile.user.name} has been assigned to your order "${order.title}".`,
          orderId: order.id,
        },
      });

      // Notify writer
      await prisma.notification.create({
        data: {
          userId: writerProfile.userId,
          type: "ORDER_ASSIGNED",
          title: "New Order Assigned",
          message: `You have been assigned to order "${order.title}" (${order.orderNumber}).`,
          orderId: order.id,
        },
      });

      // Update writer order count
      await prisma.writerProfile.update({
        where: { id: writerId },
        data: { currentOrdersCount: { increment: 1 } },
      });
    }

    // Notify on specific status changes
    if (status === "CANCELLED") {
      await prisma.notification.create({
        data: {
          userId: order.clientId,
          type: "SYSTEM",
          title: "Order Cancelled",
          message: `Your order "${order.title}" (${order.orderNumber}) has been cancelled by admin.${adminNote ? ` Note: ${adminNote}` : ""}`,
          orderId: order.id,
        },
      });
      if (order.writer) {
        await prisma.notification.create({
          data: {
            userId: order.writer.userId,
            type: "SYSTEM",
            title: "Order Cancelled",
            message: `Order "${order.title}" (${order.orderNumber}) has been cancelled.`,
            orderId: order.id,
          },
        });
      }
    }

    if (status === "DISPUTED") {
      const notifyUsers = [order.clientId];
      if (order.writer) notifyUsers.push(order.writer.userId);
      await prisma.notification.createMany({
        data: notifyUsers.map(userId => ({
          userId,
          type: "ORDER_DISPUTE" as const,
          title: "Order Under Dispute",
          message: `Order "${order.title}" (${order.orderNumber}) has been flagged for dispute review.`,
          orderId: order.id,
        })),
      });
    }

    if (status === "COMPLETED") {
      await prisma.notification.create({
        data: {
          userId: order.clientId,
          type: "ORDER_COMPLETED",
          title: "Order Marked Complete",
          message: `Your order "${order.title}" has been marked as completed by admin.`,
          orderId: order.id,
        },
      });
    }

    const updated = await prisma.order.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({ success: true, data: { order: updated } });
  } catch (err) {
    console.error("Admin order update error:", err);
    return NextResponse.json({ success: false, error: "Server error" }, { status: 500 });
  }
}
