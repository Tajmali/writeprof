import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";
import { paystack } from "@/lib/paystack";

const withdrawSchema = z.object({
  amount: z.number().min(50, "Minimum withdrawal is $50"),
  accountNumber: z.string().length(10, "Account number must be 10 digits"),
  bankCode: z.string().min(2, "Bank code required"),
});

export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get("wp_token")?.value;
    if (!token) return NextResponse.json({ success: false, error: "Not authenticated" }, { status: 401 });

    const payload = await verifyToken(token);
    if (!payload || payload.role !== "WRITER") {
      return NextResponse.json({ success: false, error: "Writer access required" }, { status: 403 });
    }

    const body = await req.json();
    const { amount, accountNumber, bankCode } = withdrawSchema.parse(body);

    const wallet = await prisma.wallet.findUnique({ where: { userId: payload.userId } });
    if (!wallet || wallet.balance < amount) {
      return NextResponse.json({ success: false, error: "Insufficient balance" }, { status: 400 });
    }

    // Verify account number with Paystack
    const accountVerification = await paystack.resolveAccountNumber(accountNumber, bankCode);
    if (!accountVerification.status) {
      return NextResponse.json({ success: false, error: "Invalid account details" }, { status: 400 });
    }

    // Create transfer recipient
    const recipient = await paystack.createTransferRecipient({
      name: accountVerification.data.account_name,
      account_number: accountNumber,
      bank_code: bankCode,
    });

    const reference = paystack.generateReference("PAYOUT");

    // Initiate transfer
    const transfer = await paystack.initiateTransfer({
      amount,
      recipient: recipient.data.recipient_code,
      reason: `WriteProf withdrawal - ${payload.email}`,
      reference,
    });

    // Deduct from wallet and record transaction
    await prisma.$transaction([
      prisma.wallet.update({
        where: { userId: payload.userId },
        data: { balance: { decrement: amount } },
      }),
      prisma.transaction.create({
        data: {
          userId: payload.userId,
          type: "WITHDRAWAL",
          amount,
          currency: "USD",
          description: `Withdrawal to ${accountVerification.data.account_name}`,
          reference,
          status: "PENDING",
          metadata: {
            accountName: accountVerification.data.account_name,
            accountNumber,
            bankCode,
            transferCode: transfer.data?.transfer_code,
          },
        },
      }),
    ]);

    return NextResponse.json({
      success: true,
      data: { message: "Withdrawal initiated successfully. Processing within 24 hours.", reference },
    });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ success: false, error: err.errors[0].message }, { status: 400 });
    }
    console.error("Withdrawal error:", err);
    return NextResponse.json({ success: false, error: "Withdrawal failed. Try again." }, { status: 500 });
  }
}
