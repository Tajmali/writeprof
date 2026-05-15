import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";

const resolveSchema = z.object({
  resolution: z.enum(["client", "writer"]),
  notes: z.string().optional(),
});

export async function POST(req: NextRequest, { params }: { params: { orderId: string } }) {
  try {
    const token = req.cookies.get("wp_token")?.value;
    if (!token) return NextResponse.json({ success: false, error: "Not authenticated" }, { status: 401 });
    const payload = await verifyToken(token);
    if (!payload || payload.role !== "ADMIN") return NextResponse.json({ success: false, error: "Admin access required" }, { status: 403 });

    const body = await req.json();
    const { resolution, notes } = resolveSchema.parse(body);

    const order = await prisma.order.findUnique({
      where: { id: params.orderId },
      include: {
        payment: true,
        writer: { include: { user: true } },
        client: true,
      },
    });

    if (!order) return NextResponse.json({ success: false, error: "Order not found" }, { status: 404 });
    if (order.status !== "DISPUTED") return NextResponse.json({ success: false, error: "Order is not in dispute" }, { status: 400 });

    await prisma.$transaction(async (tx) => {
      if (resolution === "writer" && order.writerId && order.payment) {
        // Release funds to writer
        const writerAmount = Math.floor(order.totalPrice * 0.8);

        await tx.order.update({
          where: { id: order.id },
          data: { status: "COMPLETED" },
        });

        await tx.payment.update({
          where: { id: order.payment.id },
          data: { status: "RELEASED", releasedAt: new Date() },
        });

        const writerWallet = await tx.wallet.findFirst({ where: { userId: order.writer!.userId } });
        if (writerWallet) {
          await tx.wallet.update({
            where: { id: writerWallet.id },
            data: { balance: { increment: writerAmount }, totalEarned: { increment: writerAmount } },
          });

          await tx.transaction.create({
            data: {
              userId: order.writer!.userId,
              type: "PAYMENT",
              amount: writerAmount,
              status: "PAID",
              description: `Dispute resolved in your favor - Order #${order.orderNumber}`,
              reference: `dispute-${order.id}-${Date.now()}`,
            },
          });
        }

        await tx.writerProfile.update({
          where: { id: order.writerId! },
          data: { completedOrders: { increment: 1 }, currentOrdersCount: { decrement: 1 } },
        });
      } else if (resolution === "client" && order.payment) {
        // Refund client
        await tx.order.update({
          where: { id: order.id },
          data: { status: "CANCELLED" },
        });

        await tx.payment.update({
          where: { id: order.payment.id },
          data: { status: "REFUNDED" },
        });

        const clientWallet = await tx.wallet.findFirst({ where: { userId: order.clientId } });
        if (clientWallet) {
          await tx.wallet.update({
            where: { id: clientWallet.id },
            data: { balance: { increment: order.totalPrice }, totalSpent: { decrement: order.totalPrice } },
          });

          await tx.transaction.create({
            data: {
              userId: order.clientId,
              type: "REFUND",
              amount: order.totalPrice,
              status: "PAID",
              description: `Dispute refund - Order #${order.orderNumber}`,
              reference: `refund-${order.id}-${Date.now()}`,
            },
          });
        }
      }

      // Notify both parties
      const message = notes || `Your dispute for order #${order.orderNumber} has been resolved in favor of the ${resolution}.`;

      await tx.notification.createMany({
        data: [
          {
            userId: order.clientId,
            type: "SYSTEM",
            title: "Dispute Resolved",
            message,
            orderId: order.id,
          },
          ...(order.writer ? [{
            userId: order.writer.userId,
            type: "SYSTEM" as const,
            title: "Dispute Resolved",
            message,
            orderId: order.id,
          }] : []),
        ],
      });
    });

    return NextResponse.json({ success: true, data: { resolved: true, resolution } });
  } catch (err) {
    if (err instanceof z.ZodError) return NextResponse.json({ success: false, error: err.errors[0].message }, { status: 400 });
    return NextResponse.json({ success: false, error: "Server error" }, { status: 500 });
  }
}
