import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

function getJwtSecret(): Uint8Array {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("JWT_SECRET environment variable is required in production.");
    }
    return new TextEncoder().encode("writeprof-dev-fallback-not-for-production");
  }
  return new TextEncoder().encode(secret);
}

const PUBLIC_ROUTES = ["/", "/login", "/signup", "/forgot-password", "/blog", "/about", "/contact", "/terms", "/privacy", "/refund"];
const API_PUBLIC_ROUTES = ["/api/auth/login", "/api/auth/signup", "/api/auth/logout", "/api/auth/google"];
const CLIENT_ROUTES = ["/dashboard"];
const WRITER_ROUTES = ["/writer-dashboard"];
const ADMIN_ROUTES = ["/admin"];

function isPublic(pathname: string): boolean {
  return PUBLIC_ROUTES.some((r) => pathname === r || pathname.startsWith(r + "/") || pathname.startsWith("/blog")) ||
         API_PUBLIC_ROUTES.some((r) => pathname.startsWith(r));
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Allow public routes and static files
  if (
    isPublic(pathname) ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api/payments/webhook") ||
    pathname.includes(".") // static files
  ) {
    return NextResponse.next();
  }

  // Verify JWT
  const token = req.cookies.get("wp_token")?.value;

  if (!token) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  try {
    const { payload } = await jwtVerify(token, getJwtSecret());
    const role = payload.role as string;

    // Role-based access control
    if (ADMIN_ROUTES.some((r) => pathname.startsWith(r)) && role !== "ADMIN") {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    if (WRITER_ROUTES.some((r) => pathname.startsWith(r)) && role !== "WRITER") {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    if (CLIENT_ROUTES.some((r) => pathname.startsWith(r)) && role !== "CLIENT" && role !== "ADMIN") {
      if (role === "WRITER") return NextResponse.redirect(new URL("/writer-dashboard", req.url));
      return NextResponse.redirect(new URL("/login", req.url));
    }

    // Add user info to headers
    const requestHeaders = new Headers(req.headers);
    requestHeaders.set("x-user-id", payload.userId as string);
    requestHeaders.set("x-user-role", role);
    requestHeaders.set("x-user-email", payload.email as string);

    return NextResponse.next({ request: { headers: requestHeaders } });
  } catch {
    const loginUrl = new URL("/login", req.url);
    const response = NextResponse.redirect(loginUrl);
    response.cookies.delete("wp_token");
    return response;
  }
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|manifest.json).*)"],
};
