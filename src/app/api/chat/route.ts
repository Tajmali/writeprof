import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

// GET /api/chat?orderId=xxx — fetch messages for an order
export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

    const orderId = req.nextUrl.searchParams.get("orderId");
    if (!orderId) return NextResponse.json({ success: false, error: "orderId required" }, { status: 400 });

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { writerProfile: true },
    });

    if (!order) return NextResponse.json({ success: false, error: "Order not found" }, { status: 404 });

    const isClient = order.clientId === user.id;
    const isWriter = order.writerProfile?.userId === user.id;
    const isAdmin = user.role === "ADMIN";

    if (!isClient && !isWriter && !isAdmin) {
      return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
    }

    const messages = await prisma.message.findMany({
      where: { orderId },
      include: {
        sender: { select: { id: true, name: true, avatar: true } },
      },
      orderBy: { createdAt: "asc" },
    });

    // Mark unread messages as read
    await prisma.message.updateMany({
      where: { orderId, senderId: { not: user.id }, isRead: false },
      data: { isRead: true },
    });

    return NextResponse.json({ success: true, data: { messages } });
  } catch (err) {
    console.error("Chat GET error:", err);
    return NextResponse.json({ success: false, error: "Server error" }, { status: 500 });
  }
}

// POST /api/chat — send a message
export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

    const { orderId, content, fileUrl, fileName } = await req.json();

    if (!orderId || !content?.trim()) {
      return NextResponse.json({ success: false, error: "orderId and content required" }, { status: 400 });
    }

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { writerProfile: true },
    });

    if (!order) return NextResponse.json({ success: false, error: "Order not found" }, { status: 404 });

    const isClient = order.clientId === user.id;
    const isWriter = order.writerProfile?.userId === user.id;
    const isAdmin = user.role === "ADMIN";

    if (!isClient && !isWriter && !isAdmin) {
      return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
    }

    const message = await prisma.message.create({
      data: {
        orderId,
        senderId: user.id,
        content: content.trim(),
        fileUrl: fileUrl || null,
        fileName: fileName || null,
      },
      include: {
        sender: { select: { id: true, name: true, avatar: true } },
      },
    });

    return NextResponse.json({ success: true, data: { message } });
  } catch (err) {
    console.error("Chat POST error:", err);
    return NextResponse.json({ success: false, error: "Server error" }, { status: 500 });
  }
}
