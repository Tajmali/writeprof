import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";
import bcrypt from "bcryptjs";
import { prisma } from "./prisma";
import type { User } from "@/types";

// ─── JWT Secret ──────────────────────────────────────────────────────────────
// Throws at call-time in production if the env var is missing.
function getJwtSecret(): Uint8Array {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("JWT_SECRET environment variable is required in production.");
    }
    console.warn("⚠️  JWT_SECRET not set — using dev fallback. Set this in production!");
    return new TextEncoder().encode("writeprof-dev-fallback-not-for-production");
  }
  return new TextEncoder().encode(secret);
}

// ─── Token helpers ───────────────────────────────────────────────────────────
export async function signToken(payload: { userId: string; email: string; role: string }): Promise<string> {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(getJwtSecret());
}

export async function verifyToken(token: string): Promise<{ userId: string; email: string; role: string } | null> {
  try {
    const { payload } = await jwtVerify(token, getJwtSecret());
    return payload as { userId: string; email: string; role: string };
  } catch {
    return null;
  }
}

// ─── Current user ────────────────────────────────────────────────────────────
export async function getCurrentUser(): Promise<User | null> {
  try {
    const cookieStore = await cookies();
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

// ─── Password hashing (bcrypt, cost factor 12) ───────────────────────────────
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

/**
 * Supports both bcrypt hashes (new) and SHA-256 hashes (legacy, migration path).
 * On first successful login with a SHA-256 hash the caller should re-hash with bcrypt.
 */
export async function comparePassword(
  password: string,
  hash: string
): Promise<{ matched: boolean; isLegacy: boolean }> {
  // bcrypt hashes always start with $2a$, $2b$, or $2y$
  if (hash.startsWith("$2")) {
    const matched = await bcrypt.compare(password, hash);
    return { matched, isLegacy: false };
  }

  // Legacy SHA-256 path — compare and flag for re-hash
  const crypto = await import("crypto");
  const sha256 = crypto
    .createHash("sha256")
    .update(password + process.env.JWT_SECRET)
    .digest("hex");
  return { matched: sha256 === hash, isLegacy: true };
}

// ─── Cookie helpers ───────────────────────────────────────────────────────────
export async function setAuthCookie(token: string) {
  const cookieStore = await cookies();
  cookieStore.set("wp_token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: "/",
  });
}

export async function clearAuthCookie() {
  const cookieStore = await cookies();
  cookieStore.delete("wp_token");
}

// ─── Misc ─────────────────────────────────────────────────────────────────────
export function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export function generateReferralCode(name: string): string {
  const clean = name.replace(/\s+/g, "").toUpperCase().slice(0, 4);
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${clean}${random}`;
}
