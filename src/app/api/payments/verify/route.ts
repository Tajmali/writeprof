import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { paystack } from "@/lib/paystack";
import { sendEmail, emailTemplates } from "@/lib/email";
import { formatPrice } from "@/lib/pricing";

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const reference = url.searchParams.get("ref") || url.searchParams.get("reference");

    if (!reference) {
      return NextResponse.redirect(new URL("/dashboard?error=missing_reference", req.url));
    }

    const payment = await prisma.payment.findUnique({
      where: { paystackRef: reference },
      include: { order: { include: { client: true } } },
    });

    if (!payment) {
      return NextResponse.redirect(new URL("/dashboard?error=payment_not_found", req.url));
    }

    if (payment.status === "ESCROW" || payment.status === "PAID") {
      return NextResponse.redirect(new URL(`/dashboard/orders/${payment.orderId}?success=true`, req.url));
    }

    // Verify with Paystack
    const verification = await paystack.verifyTransaction(reference);

    if (verification.data.status === "success") {
      // Update payment to escrow
      await prisma.$transaction([
        prisma.payment.update({
          where: { id: payment.id },
          data: { status: "ESCROW", paidAt: new Date(), paystackTxRef: String(verification.data.id) },
        }),
        prisma.order.update({
          where: { id: payment.orderId },
          data: { status: "PENDING" },
        }),
        prisma.transaction.create({
          data: {
            userId: payment.clientId,
            type: "PAYMENT",
            amount: payment.amount,
            currency: payment.order.currency,
            description: `Payment for order ${payment.order.orderNumber}`,
            reference,
            status: "PAID",
          },
        }),
        prisma.wallet.update({
          where: { userId: payment.clientId },
          data: { totalSpent: { increment: payment.amount } },
        }),
      ]);

      // Send confirmation email
      const tmpl = emailTemplates.orderConfirmation(
        payment.order.client.name,
        payment.order.orderNumber,
        new Date(payment.order.deadline).toLocaleString(),
        formatPrice(payment.amount)
      );
      sendEmail({ to: payment.order.client.email, subject: tmpl.subject, html: tmpl.html }).catch(() => {});

      await prisma.notification.create({
        data: {
          userId: payment.clientId,
          type: "PAYMENT_RECEIVED",
          title: "Payment Confirmed!",
          message: `Your payment of ${formatPrice(payment.amount)} for order ${payment.order.orderNumber} has been confirmed.`,
          orderId: payment.orderId,
        },
      });

      return NextResponse.redirect(
        new URL(`/dashboard/orders/${payment.orderId}?payment=success`, req.url)
      );
    } else {
      await prisma.payment.update({
        where: { id: payment.id },
        data: { status: "FAILED" },
      });
      return NextResponse.redirect(new URL(`/dashboard/new-order?error=payment_failed`, req.url));
    }
  } catch (err) {
    console.error("Payment verify error:", err);
    return NextResponse.redirect(new URL("/dashboard?error=server_error", req.url));
  }
}
