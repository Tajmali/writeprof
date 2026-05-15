import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";

const updateSchema = z.object({
  name: z.string().min(2).optional(),
  avatar: z.string().optional(),
  bio: z.string().max(500).optional(),
  specialization: z.string().optional(),
  education: z.string().optional(),
  experience: z.number().min(0).optional(),
  languages: z.array(z.string()).optional(),
  portfolioUrl: z.string().url().optional().or(z.literal("")),
});

export async function PATCH(req: NextRequest) {
  try {
    const token = req.cookies.get("wp_token")?.value;
    if (!token) return NextResponse.json({ success: false, error: "Not authenticated" }, { status: 401 });
    const payload = await verifyToken(token);
    if (!payload || payload.role !== "WRITER") return NextResponse.json({ success: false, error: "Writer access required" }, { status: 403 });

    const body = await req.json();
    const { name, avatar, ...writerData } = updateSchema.parse(body);

    const [user, writerProfile] = await Promise.all([
      name || avatar ? prisma.user.update({
        where: { id: payload.userId },
        data: { ...(name && { name }), ...(avatar && { avatar }) },
        select: { id: true, name: true, email: true, avatar: true, role: true },
      }) : prisma.user.findUnique({ where: { id: payload.userId }, select: { id: true, name: true, email: true, avatar: true, role: true } }),

      prisma.writerProfile.update({
        where: { userId: payload.userId },
        data: {
          ...(writerData.bio !== undefined && { bio: writerData.bio }),
          ...(writerData.specialization && { specialization: writerData.specialization }),
          ...(writerData.education && { education: writerData.education }),
          ...(writerData.experience !== undefined && { experience: writerData.experience }),
          ...(writerData.languages && { languages: writerData.languages }),
          ...(writerData.portfolioUrl !== undefined && { portfolioUrl: writerData.portfolioUrl || null }),
        },
      }),
    ]);

    return NextResponse.json({ success: true, data: { user, writerProfile } });
  } catch (err) {
    if (err instanceof z.ZodError) return NextResponse.json({ success: false, error: err.errors[0].message }, { status: 400 });
    return NextResponse.json({ success: false, error: "Server error" }, { status: 500 });
  }
}
