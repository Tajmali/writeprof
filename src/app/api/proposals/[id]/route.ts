import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

// ─── PATCH /api/proposals/[id] — cancel (writer) or update status (admin) ──
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

    const proposal = await prisma.proposal.findUnique({
      where: { id: params.id },
      include: { writer: true, order: true },
    });
    if (!proposal) return NextResponse.json({ success: false, error: "Proposal not found" }, { status: 404 });

    const body = await req.json();
    const { action, note } = body as { action: string; note?: string };

    // ── Writer: cancel their own OPEN proposal ──────────────────────────────
    if (user.role === "WRITER") {
      if (proposal.writer.userId !== user.id) {
        return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
      }
      if (proposal.status !== "OPEN") {
        return NextResponse.json({ success: false, error: "Only open proposals can be cancelled" }, { status: 400 });
      }
      const updated = await prisma.proposal.update({
        where: { id: params.id },
        data: { status: "CANCELED" },
      });
      return NextResponse.json({ success: true, data: { proposal: updated } });
    }

    // ── Admin: accept or decline ────────────────────────────────────────────
    if (user.role === "ADMIN") {
      if (action === "accept") {
        // Set this proposal to UNCONFIRMED, assign writer to the order
        const [updated] = await prisma.$transaction([
          prisma.proposal.update({
            where: { id: params.id },
            data: { status: "UNCONFIRMED" },
          }),
          // Decline all other proposals for the same order
          prisma.proposal.updateMany({
            where: { orderId: proposal.orderId, id: { not: params.id }, status: "OPEN" },
            data: { status: "DECLINED", note: "Another writer was selected for this order." },
          }),
          // Assign the writer to the order
          prisma.order.update({
            where: { id: proposal.orderId },
            data: {
              writerId: proposal.writerId,
              status: "ASSIGNED",
              assignedAt: new Date(),
            },
          }),
        ]);
        return NextResponse.json({ success: true, data: { proposal: updated } });
      }

      if (action === "decline") {
        const updated = await prisma.proposal.update({
          where: { id: params.id },
          data: { status: "DECLINED", note: note || "Your proposal was not selected." },
        });
        return NextResponse.json({ success: true, data: { proposal: updated } });
      }

      return NextResponse.json({ success: false, error: "Invalid action" }, { status: 400 });
    }

    return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
  } catch (err) {
    console.error("PATCH /api/proposals/[id] error:", err);
    return NextResponse.json({ success: false, error: "Server error" }, { status: 500 });
  }
}
