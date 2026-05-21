import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

// GET /api/available-orders — pending orders a writer can bid on
export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "WRITER") {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const search   = searchParams.get("search") || "";
    const category = searchParams.get("category") || "";
    const level    = searchParams.get("level") || "";
    const limit    = Math.min(parseInt(searchParams.get("limit") || "30"), 100);

    const profile = await prisma.writerProfile.findUnique({ where: { userId: user.id } });

    const orders = await prisma.order.findMany({
      where: {
        status: "PENDING",
        writerId: null, // not yet assigned
        ...(search ? {
          OR: [
            { title: { contains: search, mode: "insensitive" } },
            { category: { contains: search, mode: "insensitive" } },
            { description: { contains: search, mode: "insensitive" } },
          ],
        } : {}),
        ...(category ? { category: { equals: category, mode: "insensitive" } } : {}),
        ...(level ? { academicLevel: level as any } : {}),
      },
      select: {
        id: true,
        orderNumber: true,
        title: true,
        description: true,
        category: true,
        academicLevel: true,
        wordCount: true,
        urgency: true,
        totalPrice: true,
        deadline: true,
        isEmergency: true,
        createdAt: true,
        _count: { select: { proposals: true } },
        // Include writer's own proposal if any
        proposals: profile ? {
          where: { writerId: profile.id },
          select: { id: true, status: true, createdAt: true },
        } : false,
      },
      orderBy: [
        { isEmergency: "desc" },
        { createdAt: "desc" },
      ],
      take: limit,
    });

    return NextResponse.json({ success: true, data: { orders } });
  } catch (err) {
    console.error("GET /api/available-orders error:", err);
    return NextResponse.json({ success: false, error: "Server error" }, { status: 500 });
  }
}
