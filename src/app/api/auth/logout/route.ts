import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const token = req.cookies.get("wp_token")?.value;

  if (token) {
    await prisma.session.deleteMany({ where: { token } }).catch(() => {});
  }

  const response = NextResponse.json({ success: true });
  response.cookies.delete("wp_token");
  return response;
}
