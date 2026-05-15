import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";

const updateSchema = z.object({
  name: z.string().min(2).optional(),
  avatar: z.string().optional(),
  phone: z.string().optional(),
});

export async function PATCH(req: NextRequest) {
  try {
    const token = req.cookies.get("wp_token")?.value;
    if (!token) return NextResponse.json({ success: false, error: "Not authenticated" }, { status: 401 });
    const payload = await verifyToken(token);
    if (!payload) return NextResponse.json({ success: false, error: "Invalid token" }, { status: 401 });

    const body = await req.json();
    const data = updateSchema.parse(body);

    const user = await prisma.user.update({
      where: { id: payload.userId },
      data: {
        ...(data.name && { name: data.name }),
        ...(data.avatar && { avatar: data.avatar }),
        ...(data.phone !== undefined && { phone: data.phone }),
      },
      select: { id: true, name: true, email: true, avatar: true, role: true, isActive: true },
    });

    return NextResponse.json({ success: true, data: { user } });
  } catch (err) {
    if (err instanceof z.ZodError) return NextResponse.json({ success: false, error: err.errors[0].message }, { status: 400 });
    return NextResponse.json({ success: false, error: "Server error" }, { status: 500 });
  }
}
