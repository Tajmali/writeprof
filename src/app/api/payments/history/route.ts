import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get("wp_token")?.value;
    if (!token) return NextResponse.json({ success: false, error: "Not authenticated" }, { status: 401 });
    const payload = await verifyToken(token);
    if (!payload) return NextResponse.json({ success: false, error: "Invalid token" }, { status: 401 });

    const url = new URL(req.url);
    const page = parseInt(url.searchParams.get("page") || "1");
    const limit = parseInt(url.searchParams.get("limit") || "20");
    const search = url.searchParams.get("search") || "";
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};

    if (payload.role === "CLIENT") {
      where.order = { clientId: payload.userId };
    } else if (payload.role === "WRITER") {
      where.order = { writer: { userId: payload.userId } };
    }

    if (search) {
      where.OR = [
        { reference: { contains: search, mode: "insensitive" } },
        { order: { orderNumber: { contains: search, mode: "insensitive" } } },
      ];
    }

    const [payments, total] = await Promise.all([
      prisma.payment.findMany({
        where,
        include: {
          order: { select: { id: true, orderNumber: true, title: true } },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.payment.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: { payments },
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (err) {
    return NextResponse.json({ success: false, error: "Server error" }, { status: 500 });
  }
}
