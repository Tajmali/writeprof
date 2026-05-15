import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";
import { sendEmail, emailTemplates } from "@/lib/email";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const token = req.cookies.get("wp_token")?.value;
    if (!token) return NextResponse.json({ success: false, error: "Not authenticated" }, { status: 401 });

    const payload = await verifyToken(token);
    if (!payload) return NextResponse.json({ success: false, error: "Invalid token" }, { status: 401 });

    const order = await prisma.order.findUnique({
      where: { id: params.id },
      include: {
        client: { select: { id: true, name: true, email: true, avatar: true } },
        writer: { include: { user: { select: { id: true, name: true, avatar: true, email: true } } } },
        attachments: true,
        submissions: { orderBy: { submittedAt: "desc" } },
        messages: {
          include: { sender: { select: { id: true, name: true, avatar: true } } },
          orderBy: { createdAt: "asc" },
        },
        payment: true,
        reviews: { include: { author: { select: { id: true, name: true, avatar: true } } } },
      },
    });

    if (!order) return NextResponse.json({ success: false, error: "Order not found" }, { status: 404 });

    // Authorization check
    if (payload.role === "CLIENT" && order.clientId !== payload.userId) {
      return NextResponse.json({ success: false, error: "Access denied" }, { status: 403 });
    }

    return NextResponse.json({ success: true, data: { order } });
  } catch (err) {
    return NextResponse.json({ success: false, error: "Server error" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const token = req.cookies.get("wp_token")?.value;
    if (!token) return NextResponse.json({ success: false, error: "Not authenticated" }, { status: 401 });

    const payload = await verifyToken(token);
    if (!payload) return NextResponse.json({ success: false, error: "Invalid token" }, { status: 401 });

    const body = await req.json();
    const { status, writerId, revisionNotes } = body;

    const order = await prisma.order.findUnique({
      where: { id: params.id },
      include: { client: true },
    });
    if (!order) return NextResponse.json({ success: false, error: "Order not found" }, { status: 404 });

    const updateData: Record<string, unknown> = {};

    if (status) updateData.status = status;
    if (status === "COMPLETED") updateData.completedAt = new Date();
    if (status === "ASSIGNED" && writerId) {
      updateData.writerId = writerId;
      updateData.assignedAt = new Date();
    }
    if (status === "REVISION_REQUESTED") {
      updateData.revisionCount = { increment: 1 };
    }

    const updated = await prisma.order.update({
      where: { id: params.id },
      data: updateData,
    });

    // Send notifications based on status change
    if (status === "ASSIGNED") {
      const writer = await prisma.writerProfile.findUnique({
        where: { id: writerId },
        include: { user: true },
      });
      if (writer) {
        const tmpl = emailTemplates.writerAssigned(order.client.name, order.orderNumber, writer.user.name);
        sendEmail({ to: order.client.email, subject: tmpl.subject, html: tmpl.html }).catch(() => {});

        await prisma.notification.create({
          data: {
            userId: order.clientId,
            type: "ORDER_ASSIGNED",
            title: "Writer Assigned!",
            message: `${writer.user.name} has been assigned to your order "${order.title}"`,
            orderId: order.id,
          },
        });
      }
    }

    if (status === "COMPLETED") {
      const tmpl = emailTemplates.orderCompleted(order.client.name, order.orderNumber);
      sendEmail({ to: order.client.email, subject: tmpl.subject, html: tmpl.html }).catch(() => {});

      await prisma.notification.create({
        data: {
          userId: order.clientId,
          type: "ORDER_COMPLETED",
          title: "Order Completed!",
          message: `Your order "${order.title}" has been completed and is ready for download.`,
          orderId: order.id,
        },
      });
    }

    return NextResponse.json({ success: true, data: { order: updated } });
  } catch (err) {
    console.error("Update order error:", err);
    return NextResponse.json({ success: false, error: "Server error" }, { status: 500 });
  }
}
