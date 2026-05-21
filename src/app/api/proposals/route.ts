import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

// ─── GET /api/proposals — writer's own proposals ────────────────────────────
export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "WRITER") {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status"); // OPEN | UNCONFIRMED | DECLINED | CANCELED

    const profile = await prisma.writerProfile.findUnique({ where: { userId: user.id } });
    if (!profile) {
      return NextResponse.json({ success: false, error: "Writer profile not found" }, { status: 404 });
    }

    const proposals = await prisma.proposal.findMany({
      where: {
        writerId: profile.id,
        ...(status ? { status: status as any } : {}),
      },
      include: {
        order: {
          select: {
            id: true,
            orderNumber: true,
            title: true,
            category: true,
            academicLevel: true,
            wordCount: true,
            totalPrice: true,
            deadline: true,
            status: true,
            isEmergency: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, data: { proposals } });
  } catch (err) {
    console.error("GET /api/proposals error:", err);
    return NextResponse.json({ success: false, error: "Server error" }, { status: 500 });
  }
}

// ─── POST /api/proposals — submit a bid ────────────────────────────────────
const createSchema = z.object({
  orderId: z.string().min(1),
  coverLetter: z.string().min(20, "Cover letter must be at least 20 characters").max(2000),
  bidAmount: z.number().positive().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "WRITER") {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { orderId, coverLetter, bidAmount } = createSchema.parse(body);

    const profile = await prisma.writerProfile.findUnique({ where: { userId: user.id } });
    if (!profile) {
      return NextResponse.json({ success: false, error: "Writer profile not found" }, { status: 404 });
    }

    if (!profile.isApproved) {
      return NextResponse.json({ success: false, error: "Your account must be approved before placing bids" }, { status: 403 });
    }

    // Verify the order is still open for bidding
    const order = await prisma.order.findUnique({ where: { id: orderId } });
    if (!order) {
      return NextResponse.json({ success: false, error: "Order not found" }, { status: 404 });
    }
    if (order.status !== "PENDING") {
      return NextResponse.json({ success: false, error: "This order is no longer accepting bids" }, { status: 400 });
    }

    // Check for duplicate proposal
    const existing = await prisma.proposal.findUnique({
      where: { orderId_writerId: { orderId, writerId: profile.id } },
    });
    if (existing) {
      return NextResponse.json({ success: false, error: "You have already submitted a proposal for this order" }, { status: 400 });
    }

    const proposal = await prisma.proposal.create({
      data: {
        orderId,
        writerId: profile.id,
        coverLetter,
        bidAmount,
        status: "OPEN",
      },
      include: {
        order: {
          select: { id: true, orderNumber: true, title: true, totalPrice: true, deadline: true },
        },
      },
    });

    return NextResponse.json({ success: true, data: { proposal } }, { status: 201 });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ success: false, error: err.errors[0].message }, { status: 400 });
    }
    console.error("POST /api/proposals error:", err);
    return NextResponse.json({ success: false, error: "Server error" }, { status: 500 });
  }
}
