import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";
import { sendEmail, emailTemplates } from "@/lib/email";

const submitSchema = z.object({
  content: z.string().optional(),
  fileUrl: z.string().optional(),
  fileName: z.string().optional(),
  notes: z.string().optional(),
});

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const token = req.cookies.get("wp_token")?.value;
    if (!token) return NextResponse.json({ success: false, error: "Not authenticated" }, { status: 401 });
    const payload = await verifyToken(token);
    if (!payload || payload.role !== "WRITER") return NextResponse.json({ success: false, error: "Writer access required" }, { status: 403 });

    const body = await req.json();
    const data = submitSchema.parse(body);

    if (!data.content && !data.fileUrl) return NextResponse.json({ success: false, error: "Provide content or file URL" }, { status: 400 });

    const writerProfile = await prisma.writerProfile.findUnique({ where: { userId: payload.userId } });
    if (!writerProfile) return NextResponse.json({ success: false, error: "Profile not found" }, { status: 404 });

    const order = await prisma.order.findUnique({
      where: { id: params.id, writerId: writerProfile.id },
      include: { client: true },
    });
    if (!order) return NextResponse.json({ success: false, error: "Order not found or not assigned to you" }, { status: 404 });
    if (!["ASSIGNED", "IN_PROGRESS", "REVISION_REQUESTED"].includes(order.status)) {
      return NextResponse.json({ success: false, error: "Order cannot be submitted at this stage" }, { status: 400 });
    }

    // Get existing submission count for version number
    const submissionCount = await prisma.submission.count({ where: { orderId: params.id } });
    const isRevision = order.status === "REVISION_REQUESTED";

    const [submission] = await prisma.$transaction([
      prisma.submission.create({
        data: {
          orderId: params.id,
          content: data.content,
          fileUrl: data.fileUrl,
          fileName: data.fileName,
          notes: data.notes,
          isRevision,
          version: submissionCount + 1,
        },
      }),
      prisma.order.update({
        where: { id: params.id },
        data: { status: "UNDER_REVIEW" },
      }),
      prisma.notification.create({
        data: {
          userId: order.clientId,
          type: "ORDER_SUBMITTED",
          title: isRevision ? "Revision Delivered!" : "Work Submitted for Review!",
          message: isRevision
            ? `Your revision for "${order.title}" has been delivered. Please review and approve.`
            : `Your order "${order.title}" has been completed. Please review the work.`,
          orderId: params.id,
        },
      }),
    ]);

    // Send email notification
    const tmpl = emailTemplates.orderCompleted(order.client.name, order.orderNumber);
    sendEmail({ to: order.client.email, subject: tmpl.subject, html: tmpl.html }).catch(() => {});

    return NextResponse.json({ success: true, data: { submission } });
  } catch (err) {
    if (err instanceof z.ZodError) return NextResponse.json({ success: false, error: err.errors[0].message }, { status: 400 });
    console.error("Submit order error:", err);
    return NextResponse.json({ success: false, error: "Server error" }, { status: 500 });
  }
}
