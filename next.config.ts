import type { NextConfig } from "next";

const securityHeaders = [
  // Force HTTPS for 2 years — prevents downgrade attacks
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  // Prevent MIME type sniffing
  { key: "X-Content-Type-Options", value: "nosniff" },
  // Prevent clickjacking — only allow framing from same origin
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  // Stop leaking referrer info to external sites
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // Disable access to sensitive browser features
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), interest-cohort=()" },
  // Restrict CORS — only writeprof.com can call the API (not arbitrary external sites)
  { key: "Access-Control-Allow-Origin", value: "https://writeprof.com" },
  // Content Security Policy — allows Tawk.to, Google Fonts, Cloudflare, inline scripts
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://*.tawk.to https://cdn.jsdelivr.net https://www.googletagmanager.com https://static.cloudflareinsights.com https://cdn.landa.id",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://*.tawk.to",
      "font-src 'self' https://fonts.gstatic.com https://*.tawk.to",
      "img-src 'self' data: blob: https://res.cloudinary.com https://avatars.githubusercontent.com https://lh3.googleusercontent.com https://images.unsplash.com https://www.gravatar.com https://*.tawk.to",
      "connect-src 'self' https://api.resend.com https://va.vercel-scripts.com https://*.tawk.to wss://*.tawk.to https://cloudflareinsights.com https://cdn.landa.id",
      "frame-src https://*.tawk.to",
      "worker-src 'self' blob:",
    ].join("; "),
  },
];

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "res.cloudinary.com" },
      { protocol: "https", hostname: "avatars.githubusercontent.com" },
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
      { protocol: "https", hostname: "images.unsplash.com" },
    ],
  },
  serverExternalPackages: ["@prisma/client", "prisma"],
  async headers() {
    return [
      {
        // Apply security headers to all routes
        source: "/(.*)",
        headers: securityHeaders,
      },
      {
        // API routes: allow only same-origin + loosen CORS only for public endpoints
        source: "/api/(.*)",
        headers: [
          { key: "Access-Control-Allow-Origin", value: "https://writeprof.com" },
          { key: "Access-Control-Allow-Methods", value: "GET, POST, PATCH, DELETE, OPTIONS" },
          { key: "Access-Control-Allow-Headers", value: "Content-Type, Authorization" },
        ],
      },
      {
        // Blog pages — never cache, always serve fresh from database
        source: "/blog",
        headers: [
          { key: "Cache-Control", value: "no-store, no-cache, must-revalidate, max-age=0, s-maxage=0" },
          { key: "CDN-Cache-Control", value: "no-store" },
          { key: "Vercel-CDN-Cache-Control", value: "no-store" },
          { key: "Surrogate-Control", value: "no-store" },
        ],
      },
      {
        source: "/blog/:slug*",
        headers: [
          { key: "Cache-Control", value: "no-store, no-cache, must-revalidate, max-age=0, s-maxage=0" },
          { key: "CDN-Cache-Control", value: "no-store" },
          { key: "Vercel-CDN-Cache-Control", value: "no-store" },
          { key: "Surrogate-Control", value: "no-store" },
        ],
      },
    ];
  },
};

export default nextConfig;
