import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";
import { paystack } from "@/lib/paystack";

const initSchema = z.object({
  orderId: z.string(),
  promoCode: z.string().optional(),
});

const COMMISSION_RATE = Number(process.env.PLATFORM_COMMISSION_PERCENT || 20) / 100;

export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get("wp_token")?.value;
    if (!token) return NextResponse.json({ success: false, error: "Not authenticated" }, { status: 401 });

    const payload = await verifyToken(token);
    if (!payload) return NextResponse.json({ success: false, error: "Invalid token" }, { status: 401 });

    const body = await req.json();
    const { orderId, promoCode } = initSchema.parse(body);

    const order = await prisma.order.findUnique({
      where: { id: orderId, clientId: payload.userId },
      include: { client: true, payment: true },
    });

    if (!order) return NextResponse.json({ success: false, error: "Order not found" }, { status: 404 });
    if (order.payment?.status === "PAID" || order.payment?.status === "ESCROW") {
      return NextResponse.json({ success: false, error: "Order already paid" }, { status: 400 });
    }

    let totalPrice = order.totalPrice;
    let discountAmount = 0;

    // Apply promo code
    if (promoCode) {
      const promo = await prisma.promoCode.findFirst({
        where: { code: promoCode.toUpperCase(), isActive: true, usedCount: { lt: prisma.promoCode.fields.maxUses as unknown as number } },
      });
      if (promo && (!promo.expiresAt || promo.expiresAt > new Date())) {
        discountAmount = promo.isPercent
          ? totalPrice * (promo.discount / 100)
          : promo.discount;
        totalPrice = Math.max(0, totalPrice - discountAmount);
        await prisma.promoCode.update({ where: { id: promo.id }, data: { usedCount: { increment: 1 } } });
      }
    }

    const commissionAmount = totalPrice * COMMISSION_RATE;
    const writerAmount = totalPrice - commissionAmount;
    const reference = paystack.generateReference("ORDER");

    // Create or update payment record
    const payment = await prisma.payment.upsert({
      where: { orderId },
      create: {
        orderId,
        clientId: payload.userId,
        amount: totalPrice,
        escrowAmount: totalPrice,
        commissionAmount,
        writerAmount,
        paystackRef: reference,
        status: "PENDING",
      },
      update: {
        amount: totalPrice,
        escrowAmount: totalPrice,
        commissionAmount,
        writerAmount,
        paystackRef: reference,
        status: "PENDING",
      },
    });

    // Initialize Paystack transaction
    const paystackResult = await paystack.initializePayment({
      email: order.client.email,
      amount: totalPrice,
      reference,
      callbackUrl: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/payments/verify?ref=${reference}`,
      metadata: {
        orderId,
        orderNumber: order.orderNumber,
        clientId: payload.userId,
        discount: discountAmount,
      },
      channels: ["card", "bank", "ussd", "mobile_money", "bank_transfer"],
    });

    return NextResponse.json({
      success: true,
      data: {
        authorizationUrl: paystackResult.data.authorization_url,
        reference: paystackResult.data.reference,
        amount: totalPrice,
        discount: discountAmount,
      },
    });
  } catch (err) {
    console.error("Payment init error:", err);
    return NextResponse.json({ success: false, error: "Payment initialization failed" }, { status: 500 });
  }
}
