import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Apply to Become a Writer",
  description: "Join WriteProf as a professional writer. Earn 80% per order on rush writing jobs with 1–24 hour deadlines. Apply today — review within 48 hours.",
  alternates: { canonical: "https://writeprof.com/writer/apply" },
  keywords: ["become a writer", "freelance writing jobs", "earn money writing", "academic writing jobs", "rush writing gigs"],
  openGraph: {
    title: "Become a Writer on WriteProf — Earn on Rush Orders",
    description: "Apply to join WriteProf's vetted writer network. Earn 80% on every 1–24 hour rush order. Reviewed within 48 hours.",
    url: "https://writeprof.com/writer/apply",
    type: "website",
  },
};

export default function WriterApplyLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
