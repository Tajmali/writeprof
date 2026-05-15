import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";

const sendMessageSchema = z.object({
  orderId: z.string(),
  content: z.string().min(1, "Message cannot be empty"),
  fileUrl: z.string().optional(),
  fileName: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get("wp_token")?.value;
    if (!token) return NextResponse.json({ success: false, error: "Not authenticated" }, { status: 401 });

    const payload = await verifyToken(token);
    if (!payload) return NextResponse.json({ success: false, error: "Invalid token" }, { status: 401 });

    const body = await req.json();
    const { orderId, content, fileUrl, fileName } = sendMessageSchema.parse(body);

    // Verify user has access to this order
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { writer: { select: { userId: true } } },
    });

    if (!order) return NextResponse.json({ success: false, error: "Order not found" }, { status: 404 });

    const hasAccess =
      order.clientId === payload.userId ||
      order.writer?.userId === payload.userId ||
      payload.role === "ADMIN";

    if (!hasAccess) return NextResponse.json({ success: false, error: "Access denied" }, { status: 403 });

    const message = await prisma.message.create({
      data: {
        orderId,
        senderId: payload.userId,
        content,
        fileUrl,
        fileName,
      },
      include: {
        sender: { select: { id: true, name: true, avatar: true } },
      },
    });

    // Create notification for the other party
    const recipientId =
      order.clientId === payload.userId ? order.writer?.userId : order.clientId;

    if (recipientId) {
      await prisma.notification.create({
        data: {
          userId: recipientId,
          type: "NEW_MESSAGE",
          title: "New Message",
          message: `New message on order "${order.title.slice(0, 40)}..."`,
          orderId,
        },
      });
    }

    return NextResponse.json({ success: true, data: { message } });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ success: false, error: err.errors[0].message }, { status: 400 });
    }
    console.error("Send message error:", err);
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
    const orderId = url.searchParams.get("orderId");

    if (!orderId) return NextResponse.json({ success: false, error: "orderId required" }, { status: 400 });

    const messages = await prisma.message.findMany({
      where: { orderId },
      include: { sender: { select: { id: true, name: true, avatar: true, role: true } } },
      orderBy: { createdAt: "asc" },
    });

    // Mark messages as read
    await prisma.message.updateMany({
      where: { orderId, senderId: { not: payload.userId }, isRead: false },
      data: { isRead: true },
    });

    return NextResponse.json({ success: true, data: { messages } });
  } catch (err) {
    return NextResponse.json({ success: false, error: "Server error" }, { status: 500 });
  }
}
