import type { Metadata } from "next";

// Client dashboard routes are private — disallow indexing.
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function ClientGroupLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
