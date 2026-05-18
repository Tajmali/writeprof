import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact Us",
  description: "Get in touch with the WriteProf support team. We respond within 1 hour during business hours. Live chat, email, and ticket support available.",
  alternates: { canonical: "https://writeprof.com/contact" },
  openGraph: {
    title: "Contact WriteProf Support",
    description: "Reach our support team via live chat or email. Average response time under 1 hour.",
    url: "https://writeprof.com/contact",
    type: "website",
  },
};

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
