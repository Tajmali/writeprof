import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";
import { prisma } from "./prisma";
import type { User } from "@/types";

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || "writeprof-secret-key-change-in-production");

export async function signToken(payload: { userId: string; email: string; role: string }): Promise<string> {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(JWT_SECRET);
}

export async function verifyToken(token: string): Promise<{ userId: string; email: string; role: string } | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as { userId: string; email: string; role: string };
  } catch {
    return null;
  }
}

export async function getCurrentUser(): Promise<User | null> {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get("wp_token")?.value;
    if (!token) return null;

    const payload = await verifyToken(token);
    if (!payload) return null;

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      include: {
        writerProfile: true,
        wallet: true,
      },
    });

    if (!user || !user.isActive || user.isBanned) return null;

    return user as unknown as User;
  } catch {
    return null;
  }
}

export function hashPassword(password: string): string {
  // In production use bcrypt — simplified for demo
  const crypto = require("crypto");
  return crypto.createHash("sha256").update(password + process.env.JWT_SECRET).digest("hex");
}

export function comparePassword(password: string, hash: string): boolean {
  return hashPassword(password) === hash;
}

export function setAuthCookie(token: string) {
  cookies().set("wp_token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: "/",
  });
}

export function clearAuthCookie() {
  cookies().delete("wp_token");
}

export function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export function generateReferralCode(name: string): string {
  const clean = name.replace(/\s+/g, "").toUpperCase().slice(0, 4);
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${clean}${random}`;
}
