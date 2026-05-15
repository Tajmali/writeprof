import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get("wp_token")?.value;
    if (!token) return NextResponse.json({ success: false, error: "Not authenticated" }, { status: 401 });
    const payload = await verifyToken(token);
    if (!payload || payload.role !== "ADMIN") return NextResponse.json({ success: false, error: "Admin access required" }, { status: 403 });

    const url = new URL(req.url);
    const page = parseInt(url.searchParams.get("page") || "1");
    const limit = parseInt(url.searchParams.get("limit") || "20");
    const status = url.searchParams.get("status");
    const search = url.searchParams.get("search") || "";
    const isEmergency = url.searchParams.get("emergency") === "true";
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};
    if (status) where.status = status;
    if (isEmergency) where.isEmergency = true;
    if (search) where.OR = [
      { title: { contains: search, mode: "insensitive" } },
      { orderNumber: { contains: search, mode: "insensitive" } },
      { client: { name: { contains: search, mode: "insensitive" } } },
    ];

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        include: {
          client: { select: { id: true, name: true, email: true, avatar: true } },
          writer: { include: { user: { select: { id: true, name: true, avatar: true } } } },
          payment: { select: { status: true, amount: true, paidAt: true } },
          _count: { select: { messages: true, submissions: true } },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.order.count({ where }),
    ]);

    return NextResponse.json({ success: true, data: { orders }, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } });
  } catch (err) {
    return NextResponse.json({ success: false, error: "Server error" }, { status: 500 });
  }
}
