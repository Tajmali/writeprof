import type { Metadata } from "next";

// Note: noindex is applied per-page (login, forgot-password), NOT here.
// Signup lives in this group and must be indexed by Google.
export const metadata: Metadata = {
  title: "Sign In",
  description: "Sign in to your WriteProf account to place rush writing orders or access your writer dashboard.",
};

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#0a0f1e]">
      {children}
    </div>
  );
}
