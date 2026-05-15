import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import * as crypto from "crypto";

export async function POST(req: NextRequest) {
  try {
    const body = await req.text();
    const signature = req.headers.get("x-paystack-signature");
    const secret = process.env.PAYSTACK_SECRET_KEY!;

    // Verify webhook signature
    const hash = crypto.createHmac("sha512", secret).update(body).digest("hex");
    if (hash !== signature) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    const event = JSON.parse(body);

    switch (event.event) {
      case "charge.success":
        // Handle successful charge
        const reference = event.data.reference;
        const payment = await prisma.payment.findFirst({ where: { paystackRef: reference } });
        if (payment && payment.status === "PENDING") {
          await prisma.payment.update({
            where: { id: payment.id },
            data: { status: "ESCROW", paidAt: new Date() },
          });
        }
        break;

      case "transfer.success":
        // Handle successful payout
        const txRef = event.data.reference;
        await prisma.transaction.updateMany({
          where: { reference: txRef, status: "PENDING" },
          data: { status: "PAID" },
        });
        break;

      case "transfer.failed":
        // Handle failed payout — refund to wallet
        const failedRef = event.data.reference;
        const tx = await prisma.transaction.findFirst({ where: { reference: failedRef } });
        if (tx) {
          await prisma.$transaction([
            prisma.transaction.update({ where: { id: tx.id }, data: { status: "FAILED" } }),
            prisma.wallet.update({
              where: { userId: tx.userId },
              data: { balance: { increment: tx.amount } },
            }),
          ]);
        }
        break;
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error("Webhook error:", err);
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 });
  }
}
