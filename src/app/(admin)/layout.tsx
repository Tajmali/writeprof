import type { Metadata } from "next";

// Admin routes are disallowed in robots.txt AND get noindex in <head> as a double safeguard.
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function AdminGroupLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
