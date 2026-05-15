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
    const search = url.searchParams.get("search") || "";
    const role = url.searchParams.get("role");
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};
    if (role) where.role = role;
    if (search) where.OR = [{ name: { contains: search, mode: "insensitive" } }, { email: { contains: search, mode: "insensitive" } }];

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: { id: true, name: true, email: true, avatar: true, role: true, emailVerified: true, isActive: true, isBanned: true, createdAt: true, referralCode: true, _count: { select: { clientOrders: true } } },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.user.count({ where }),
    ]);

    return NextResponse.json({ success: true, data: { users }, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } });
  } catch (err) {
    return NextResponse.json({ success: false, error: "Server error" }, { status: 500 });
  }
}

const updateUserSchema = z.object({ userId: z.string(), action: z.enum(["ban", "unban", "activate", "deactivate", "verify"]) });

export async function PATCH(req: NextRequest) {
  try {
    const token = req.cookies.get("wp_token")?.value;
    if (!token) return NextResponse.json({ success: false, error: "Not authenticated" }, { status: 401 });
    const payload = await verifyToken(token);
    if (!payload || payload.role !== "ADMIN") return NextResponse.json({ success: false, error: "Admin access required" }, { status: 403 });

    const body = await req.json();
    const { userId, action } = updateUserSchema.parse(body);

    const updateData: Record<string, boolean> = {
      ban: { isBanned: true, isActive: false },
      unban: { isBanned: false, isActive: true },
      activate: { isActive: true },
      deactivate: { isActive: false },
      verify: { emailVerified: true },
    }[action] as Record<string, boolean>;

    const user = await prisma.user.update({ where: { id: userId }, data: updateData, select: { id: true, name: true, email: true, role: true, isActive: true, isBanned: true } });
    return NextResponse.json({ success: true, data: { user } });
  } catch (err) {
    if (err instanceof z.ZodError) return NextResponse.json({ success: false, error: err.errors[0].message }, { status: 400 });
    return NextResponse.json({ success: false, error: "Server error" }, { status: 500 });
  }
}
