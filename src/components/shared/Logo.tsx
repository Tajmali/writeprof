"use client";

import Link from "next/link";

interface LogoProps {
  size?: number;       // icon size in px
  showText?: boolean;  // show "WriteProf" wordmark
  href?: string;       // wraps in a link if provided
  className?: string;
}

export function LogoIcon({ size = 36 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        {/* Rich background gradient — deep navy → electric blue */}
        <linearGradient id="logoGradBg" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#0f1b3d" />
          <stop offset="100%" stopColor="#0369a1" />
        </linearGradient>
        {/* Inner shine overlay */}
        <linearGradient id="logoShine" x1="0" y1="0" x2="0" y2="40" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.12" />
          <stop offset="60%" stopColor="#ffffff" stopOpacity="0" />
        </linearGradient>
        {/* Glow filter */}
        <filter id="logoGlow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="1.5" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Background rounded square */}
      <rect width="40" height="40" rx="10" fill="url(#logoGradBg)" />

      {/* Top-shine overlay */}
      <rect width="40" height="40" rx="10" fill="url(#logoShine)" />

      {/* Subtle border highlight */}
      <rect width="40" height="40" rx="10" stroke="white" strokeOpacity="0.12" strokeWidth="1" fill="none" />

      {/* W letterform — bold, rounded, single stroke */}
      <path
        d="M7 12 L13.5 27 L20 17.5 L26.5 27 L33 12"
        stroke="white"
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
        filter="url(#logoGlow)"
      />

      {/* Accent underline — cyan spark */}
      <path
        d="M11 32.5 Q20 30.5 29 32.5"
        stroke="#38bdf8"
        strokeWidth="2.5"
        strokeLinecap="round"
        fill="none"
      />

      {/* Small dot accent top-right — "prof" star */}
      <circle cx="33.5" cy="9" r="2.5" fill="#38bdf8" opacity="0.9" />
    </svg>
  );
}

export function Logo({ size = 36, showText = true, href, className = "" }: LogoProps) {
  const content = (
    <span className={`flex items-center gap-2.5 ${className}`}>
      <LogoIcon size={size} />
      {showText && (
        <span className="text-xl font-bold tracking-tight select-none">
          <span className="text-white">Write</span>
          <span
            style={{
              background: "linear-gradient(90deg, #38bdf8 0%, #7dd3fc 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            Prof
          </span>
        </span>
      )}
    </span>
  );

  if (href) {
    return (
      <Link href={href} className="flex items-center">
        {content}
      </Link>
    );
  }

  return content;
}
