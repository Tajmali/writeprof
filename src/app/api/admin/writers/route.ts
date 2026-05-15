import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
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
    const pending = url.searchParams.get("pending") === "true";
    const search = url.searchParams.get("search") || "";
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};
    if (pending) where.isApproved = false;
    if (search) where.user = { OR: [{ name: { contains: search, mode: "insensitive" } }, { email: { contains: search, mode: "insensitive" } }] };

    const [writers, total] = await Promise.all([
      prisma.writerProfile.findMany({
        where,
        include: { user: { select: { id: true, name: true, email: true, avatar: true, createdAt: true, isActive: true, isBanned: true } } },
        orderBy: { joinedAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.writerProfile.count({ where }),
    ]);

    return NextResponse.json({ success: true, data: { writers }, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } });
  } catch (err) {
    return NextResponse.json({ success: false, error: "Server error" }, { status: 500 });
  }
}

const updateWriterSchema = z.object({ writerId: z.string(), action: z.enum(["approve", "reject", "verify", "suspend"]) });

export async function PATCH(req: NextRequest) {
  try {
    const token = req.cookies.get("wp_token")?.value;
    if (!token) return NextResponse.json({ success: false, error: "Not authenticated" }, { status: 401 });
    const payload = await verifyToken(token);
    if (!payload || payload.role !== "ADMIN") return NextResponse.json({ success: false, error: "Admin access required" }, { status: 403 });

    const body = await req.json();
    const { writerId, action } = updateWriterSchema.parse(body);

    const updateMap: Record<string, Record<string, boolean | string>> = {
      approve: { isApproved: true, status: "AVAILABLE" },
      reject: { isApproved: false },
      verify: { isVerified: true },
      suspend: { isApproved: false, status: "OFFLINE" },
    };

    const writer = await prisma.writerProfile.update({ where: { id: writerId }, data: updateMap[action] });

    if (action === "approve") {
      await prisma.notification.create({
        data: { userId: writer.userId, type: "SYSTEM", title: "Application Approved! 🎉", message: "Congratulations! Your writer application has been approved. You can now accept orders." },
      });
    }

    return NextResponse.json({ success: true, data: { writer } });
  } catch (err) {
    if (err instanceof z.ZodError) return NextResponse.json({ success: false, error: err.errors[0].message }, { status: 400 });
    return NextResponse.json({ success: false, error: "Server error" }, { status: 500 });
  }
}
