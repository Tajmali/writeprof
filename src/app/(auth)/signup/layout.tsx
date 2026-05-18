import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Create Your Account",
  description: "Join WriteProf free. Get urgent writing done by professionals in 1–24 hours, or apply as a writer to earn 80% on every rush order.",
  alternates: { canonical: "https://writeprof.com/signup" },
  openGraph: {
    title: "Sign Up — WriteProf Emergency Writing Marketplace",
    description: "Join free. Submit rush writing orders in minutes or earn money as a vetted writer.",
    url: "https://writeprof.com/signup",
    type: "website",
  },
};

export default function SignupLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
