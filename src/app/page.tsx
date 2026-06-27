import { Metadata } from "next";
import { Navbar } from "@/components/shared/Navbar";
import { HeroSection } from "@/components/homepage/HeroSection";
import { HowItWorks } from "@/components/homepage/HowItWorks";
import { UrgencyCategories } from "@/components/homepage/UrgencyCategories";
import { PricingPreview } from "@/components/homepage/PricingPreview";
import { LiveWriters } from "@/components/homepage/LiveWriters";
import { EmergencyMode } from "@/components/homepage/EmergencyMode";
import { RecentOrders } from "@/components/homepage/RecentOrders";
import { Testimonials } from "@/components/homepage/Testimonials";
import { TrustIndicators } from "@/components/homepage/TrustIndicators";
import { FAQ } from "@/components/homepage/FAQ";
import { Footer } from "@/components/shared/Footer";
import { CTABanner } from "@/components/homepage/CTABanner";
import { SamplesPreview } from "@/components/homepage/SamplesPreview";

export const metadata: Metadata = {
  title: "WriteProf — Emergency Writing Marketplace | Get It Done in 1–24 Hours",
  description:
    "Missed a deadline? Get essays, research papers & copywriting done by vetted writers in 1–24 hours. Emergency writing marketplace. Rush orders from $15/page.",
  alternates: { canonical: "https://writeprof.com" },
  keywords: [
    "emergency writing service",
    "urgent essay writing",
    "rush freelance writing",
    "same day essay writer",
    "1 hour essay writing service",
    "deadline writing help",
    "research paper in 24 hours",
    "professional writing marketplace",
    "WriteProf",
  ],
  openGraph: {
    title: "WriteProf — Emergency Writing Marketplace",
    description: "Get essays, research papers, and copywriting done in 1–24 hours by vetted professionals. Rush orders start at $15/page.",
    url: "https://writeprof.com",
    type: "website",
    images: [{ url: "https://writeprof.com/og-image.png", width: 1200, height: 630, alt: "WriteProf — Emergency Writing Marketplace" }],
  },
};

const serviceSchema = {
  "@context": "https://schema.org",
  "@type": "Service",
  name: "Emergency Writing Service",
  provider: {
    "@type": "Organization",
    name: "WriteProf",
    url: "https://writeprof.com",
  },
  description: "Professional rush writing service. Get essays, research papers, and copywriting completed by vetted writers in 1–24 hours.",
  offers: [
    { "@type": "Offer", name: "1-Hour Rush", price: "75", priceCurrency: "USD", description: "Per page, 275 words" },
    { "@type": "Offer", name: "3-Hour Rush", price: "52", priceCurrency: "USD", description: "Per page, 275 words" },
    { "@type": "Offer", name: "6-Hour Rush", price: "37", priceCurrency: "USD", description: "Per page, 275 words" },
    { "@type": "Offer", name: "12-Hour Rush", price: "26", priceCurrency: "USD", description: "Per page, 275 words" },
    { "@type": "Offer", name: "24-Hour Rush", price: "15", priceCurrency: "USD", description: "Per page, 275 words" },
  ],
  areaServed: "Worldwide",
  serviceType: "Writing",
};

const homeFaqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "How quickly can you deliver my order?",
      acceptedAnswer: { "@type": "Answer", text: "Our fastest delivery is 1 hour for emergency orders. Standard deadlines range from 6 to 24 hours depending on complexity and word count. We match you with writers who can meet your exact deadline." },
    },
    {
      "@type": "Question",
      name: "Is the content 100% original?",
      acceptedAnswer: { "@type": "Answer", text: "Absolutely. Every submission passes through Turnitin and Copyscape before delivery. We guarantee 0% plagiarism on every order, or you receive a full refund." },
    },
    {
      "@type": "Question",
      name: "What if I'm not satisfied with the work?",
      acceptedAnswer: { "@type": "Answer", text: "You can request unlimited revisions until you're happy. Payment is held in escrow and only released when you approve the work. If we fail to meet your expectations, we issue a full refund." },
    },
    {
      "@type": "Question",
      name: "How are writers verified?",
      acceptedAnswer: { "@type": "Answer", text: "Every writer undergoes a 7-step vetting process including identity verification, academic credential check, writing test, English proficiency assessment, background check, and a probationary period. Only 8% of applicants are accepted." },
    },
    {
      "@type": "Question",
      name: "Is my information kept confidential?",
      acceptedAnswer: { "@type": "Answer", text: "Yes. We use bank-grade encryption and never share your personal information, order details, or communication with any third party. Your privacy is protected by our iron-clad NDA policy." },
    },
    {
      "@type": "Question",
      name: "What payment methods do you accept?",
      acceptedAnswer: { "@type": "Answer", text: "We accept all major cards (Visa, Mastercard), bank transfers, and mobile money through Paystack — Nigeria's most trusted payment gateway. All transactions are encrypted and secure." },
    },
    {
      "@type": "Question",
      name: "Can I chat with my writer?",
      acceptedAnswer: { "@type": "Answer", text: "Yes! Once a writer is assigned to your order, a direct chat channel opens instantly. You can share additional instructions, clarify requirements, and track progress in real-time." },
    },
    {
      "@type": "Question",
      name: "What happens if my writer misses the deadline?",
      acceptedAnswer: { "@type": "Answer", text: "In the rare event of a missed deadline, you receive a full refund immediately — no questions asked. We've maintained a 98% on-time delivery rate across 12,847+ orders." },
    },
    {
      "@type": "Question",
      name: "What types of writing projects do you cover?",
      acceptedAnswer: { "@type": "Answer", text: "Yes. Our freelance writers handle essays, research papers, dissertations, case studies, lab reports, blog content, copywriting, business writing, and more. All citation styles supported (APA, MLA, Chicago, Harvard)." },
    },
    {
      "@type": "Question",
      name: "How does the Emergency Mode work?",
      acceptedAnswer: { "@type": "Answer", text: "Emergency Mode prioritizes your order above all others. You're matched with a top-rated writer in under 5 minutes, and they start immediately. This is available for deadlines as short as 1 hour. A $50 emergency activation fee applies." },
    },
  ],
};

export default function HomePage() {
  return (
    <main className="relative min-h-screen overflow-x-hidden">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(homeFaqSchema) }} />
      {/* Background */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-[#020817]" />
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-brand-600/10 rounded-full blur-3xl" />
        <div className="absolute top-1/3 right-1/4 w-80 h-80 bg-brand-500/8 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 left-1/3 w-72 h-72 bg-indigo-600/8 rounded-full blur-3xl" />
        <div
          className="absolute inset-0 opacity-[0.015]"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255,255,255,0.5) 1px, transparent 0)`,
            backgroundSize: "40px 40px",
          }}
        />
      </div>

      <Navbar />
      <HeroSection />
      <HowItWorks />
      <UrgencyCategories />
      <LiveWriters />
      <EmergencyMode />
      <PricingPreview />
      <RecentOrders />
      <Testimonials />
      <TrustIndicators />
      <SamplesPreview />
      <CTABanner />
      <FAQ />
      <Footer />
    </main>
  );
}
