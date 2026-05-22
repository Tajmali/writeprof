import type { NextConfig } from "next";

const securityHeaders = [
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
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://embed.tawk.to https://cdn.jsdelivr.net https://www.googletagmanager.com https://static.cloudflareinsights.com",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com",
      "img-src 'self' data: blob: https://res.cloudinary.com https://avatars.githubusercontent.com https://lh3.googleusercontent.com https://images.unsplash.com https://www.gravatar.com",
      "connect-src 'self' https://api.resend.com https://va.vercel-scripts.com https://*.tawk.to wss://*.tawk.to https://cloudflareinsights.com",
      "frame-src https://embed.tawk.to",
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
    ];
  },
};

export default nextConfig;
