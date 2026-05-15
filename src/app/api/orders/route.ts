import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";
import { calculatePrice, getUrgencyDeadline } from "@/lib/pricing";

const createOrderSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters"),
  description: z.string().min(20, "Description must be at least 20 characters"),
  instructions: z.string().optional(),
  category: z.string().min(1, "Category is required"),
  academicLevel: z.enum(["HIGH_SCHOOL", "UNDERGRADUATE", "MASTERS", "PHD", "PROFESSIONAL"]),
  wordCount: z.number().min(100).max(50000),
  urgency: z.enum(["ONE_HOUR", "THREE_HOURS", "SIX_HOURS", "TWELVE_HOURS", "TWENTY_FOUR_HOURS", "CUSTOM"]),
  deadline: z.string().optional(),
  isEmergency: z.boolean().default(false),
});

function generateOrderNumber(): string {
  const date = new Date();
  const ymd = `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, "0")}${String(date.getDate()).padStart(2, "0")}`;
  const random = Math.floor(Math.random() * 9000) + 1000;
  return `WP-${ymd}-${random}`;
}

export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get("wp_token")?.value;
    if (!token) return NextResponse.json({ success: false, error: "Not authenticated" }, { status: 401 });

    const payload = await verifyToken(token);
    if (!payload || payload.role !== "CLIENT") {
      return NextResponse.json({ success: false, error: "Client access required" }, { status: 403 });
    }

    const body = await req.json();
    const data = createOrderSchema.parse(body);

    const pricing = calculatePrice({
      wordCount: data.wordCount,
      urgency: data.urgency,
      academicLevel: data.academicLevel,
      isEmergency: data.isEmergency,
    });

    const deadline = data.deadline
      ? new Date(data.deadline)
      : getUrgencyDeadline(data.urgency);

    const order = await prisma.order.create({
      data: {
        orderNumber: generateOrderNumber(),
        title: data.title,
        description: data.description,
        instructions: data.instructions,
        category: data.category,
        academicLevel: data.academicLevel,
        wordCount: data.wordCount,
        urgency: data.urgency,
        deadline,
        isEmergency: data.isEmergency,
        basePrice: pricing.basePrice,
        urgencyPrice: pricing.urgencyPrice,
        emergencyFee: pricing.emergencyFee,
        totalPrice: pricing.totalPrice,
        currency: "USD",
        clientId: payload.userId,
        status: "PENDING",
      },
      include: { client: { select: { id: true, name: true, email: true, avatar: true } } },
    });

    // Notify available writers (simplified)
    const availableWriters = await prisma.writerProfile.findMany({
      where: { status: "AVAILABLE", isApproved: true },
      include: { user: true },
      take: 10,
    });

    if (availableWriters.length > 0) {
      await prisma.notification.createMany({
        data: availableWriters.map((w) => ({
          userId: w.userId,
          type: "ORDER_ASSIGNED" as const,
          title: "New Order Available!",
          message: `A new ${data.urgency.replace(/_/g, " ").toLowerCase()} order is available: "${data.title}"`,
          orderId: order.id,
        })),
      });
    }

    return NextResponse.json({ success: true, data: { order } }, { status: 201 });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ success: false, error: err.errors[0].message }, { status: 400 });
    }
    console.error("Create order error:", err);
    return NextResponse.json({ success: false, error: "Server error" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get("wp_token")?.value;
    if (!token) return NextResponse.json({ success: false, error: "Not authenticated" }, { status: 401 });

    const payload = await verifyToken(token);
    if (!payload) return NextResponse.json({ success: false, error: "Invalid token" }, { status: 401 });

    const url = new URL(req.url);
    const page = parseInt(url.searchParams.get("page") || "1");
    const limit = parseInt(url.searchParams.get("limit") || "10");
    const status = url.searchParams.get("status");
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};

    if (payload.role === "CLIENT") {
      where.clientId = payload.userId;
    } else if (payload.role === "WRITER") {
      const profile = await prisma.writerProfile.findUnique({ where: { userId: payload.userId } });
      if (!profile) return NextResponse.json({ success: false, error: "Writer profile not found" }, { status: 404 });
      where.writerId = profile.id;
    }
    // Admin sees all

    if (status) where.status = status;

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        include: {
          client: { select: { id: true, name: true, email: true, avatar: true } },
          writer: { include: { user: { select: { id: true, name: true, avatar: true } } } },
          payment: { select: { status: true, paidAt: true, amount: true } },
          attachments: { select: { id: true, name: true, url: true } },
          _count: { select: { messages: true, submissions: true } },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.order.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: { orders },
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (err) {
    console.error("Get orders error:", err);
    return NextResponse.json({ success: false, error: "Server error" }, { status: 500 });
  }
}
