import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Verify Your Email",
  description: "Verify your WriteProf email address to activate your account.",
  robots: { index: false, follow: false },
};

export default function VerifyEmailLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
