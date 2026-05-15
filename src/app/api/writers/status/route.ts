import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";

const statusSchema = z.object({
  status: z.enum(["AVAILABLE", "BUSY", "OFFLINE"]),
});

export async function PATCH(req: NextRequest) {
  try {
    const token = req.cookies.get("wp_token")?.value;
    if (!token) return NextResponse.json({ success: false, error: "Not authenticated" }, { status: 401 });

    const payload = await verifyToken(token);
    if (!payload || payload.role !== "WRITER") {
      return NextResponse.json({ success: false, error: "Writer access required" }, { status: 403 });
    }

    const body = await req.json();
    const { status } = statusSchema.parse(body);

    const profile = await prisma.writerProfile.update({
      where: { userId: payload.userId },
      data: { status, lastActiveAt: new Date() },
    });

    return NextResponse.json({ success: true, data: { profile } });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ success: false, error: err.errors[0].message }, { status: 400 });
    }
    return NextResponse.json({ success: false, error: "Server error" }, { status: 500 });
  }
}
