import type { Metadata } from "next";

// Writer dashboard routes are private — disallow indexing.
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function WriterGroupLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
