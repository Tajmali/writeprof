import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";

const reviseSchema = z.object({ notes: z.string().min(10, "Please provide detailed revision instructions (min 10 chars)") });

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const token = req.cookies.get("wp_token")?.value;
    if (!token) return NextResponse.json({ success: false, error: "Not authenticated" }, { status: 401 });
    const payload = await verifyToken(token);
    if (!payload || payload.role !== "CLIENT") return NextResponse.json({ success: false, error: "Client access required" }, { status: 403 });

    const body = await req.json();
    const { notes } = reviseSchema.parse(body);

    const order = await prisma.order.findUnique({
      where: { id: params.id, clientId: payload.userId },
      include: { writer: { select: { userId: true } } },
    });
    if (!order) return NextResponse.json({ success: false, error: "Order not found" }, { status: 404 });
    if (order.status !== "UNDER_REVIEW") return NextResponse.json({ success: false, error: "Can only request revision when order is under review" }, { status: 400 });
    if (order.revisionCount >= order.maxRevisions) return NextResponse.json({ success: false, error: `Maximum revisions (${order.maxRevisions}) reached` }, { status: 400 });

    await prisma.$transaction([
      prisma.order.update({
        where: { id: params.id },
        data: { status: "REVISION_REQUESTED", revisionCount: { increment: 1 } },
      }),
      ...(order.writer
        ? [prisma.notification.create({
            data: {
              userId: order.writer.userId,
              type: "ORDER_REVISION",
              title: "Revision Requested",
              message: `Client has requested a revision on order "${order.title}": ${notes.slice(0, 100)}`,
              orderId: params.id,
            },
          })]
        : []),
      prisma.message.create({
        data: {
          orderId: params.id,
          senderId: payload.userId,
          content: `📝 **Revision Request** (${order.revisionCount + 1}/${order.maxRevisions})\n\n${notes}`,
        },
      }),
    ]);

    return NextResponse.json({ success: true, data: { message: "Revision request sent to writer." } });
  } catch (err) {
    if (err instanceof z.ZodError) return NextResponse.json({ success: false, error: err.errors[0].message }, { status: 400 });
    return NextResponse.json({ success: false, error: "Server error" }, { status: 500 });
  }
}
