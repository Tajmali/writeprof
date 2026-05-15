import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { verifyToken, hashPassword, comparePassword } from "@/lib/auth";

const schema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8),
});

export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get("wp_token")?.value;
    if (!token) return NextResponse.json({ success: false, error: "Not authenticated" }, { status: 401 });
    const payload = await verifyToken(token);
    if (!payload) return NextResponse.json({ success: false, error: "Invalid token" }, { status: 401 });

    const body = await req.json();
    const { currentPassword, newPassword } = schema.parse(body);

    const user = await prisma.user.findUnique({ where: { id: payload.userId } });
    if (!user) return NextResponse.json({ success: false, error: "User not found" }, { status: 404 });

    const isValid = await comparePassword(currentPassword, user.password);
    if (!isValid) return NextResponse.json({ success: false, error: "Current password is incorrect" }, { status: 400 });

    const hashedNew = await hashPassword(newPassword);
    await prisma.user.update({ where: { id: payload.userId }, data: { password: hashedNew } });

    // Invalidate all sessions
    await prisma.session.deleteMany({ where: { userId: payload.userId } });

    return NextResponse.json({ success: true, data: { message: "Password changed successfully" } });
  } catch (err) {
    if (err instanceof z.ZodError) return NextResponse.json({ success: false, error: err.errors[0].message }, { status: 400 });
    return NextResponse.json({ success: false, error: "Server error" }, { status: 500 });
  }
}
