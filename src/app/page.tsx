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

export const metadata: Metadata = {
  title: "WriteProf — Emergency Writing Marketplace | Get It Done in 1–24 Hours",
  description:
    "Missed a deadline? Get essays, research papers & copywriting done by vetted writers in 1–24 hours. Emergency writing marketplace. Rush orders from $15/page.",
  alternates: { canonical: "https://writeprof.com" },
  keywords: [
    "emergency writing service",
    "urgent essay writing",
    "rush academic writing",
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
      name: "How fast can I get my writing done?",
      acceptedAnswer: { "@type": "Answer", text: "WriteProf offers 1-hour, 3-hour, 6-hour, 12-hour, and 24-hour turnarounds. Writers start on your order immediately after you place it." },
    },
    {
      "@type": "Question",
      name: "What types of writing does WriteProf handle?",
      acceptedAnswer: { "@type": "Answer", text: "Essays, research papers, dissertations, business proposals, blog posts, SEO articles, case studies, reports, copywriting, email campaigns, and more." },
    },
    {
      "@type": "Question",
      name: "How much does emergency writing cost?",
      acceptedAnswer: { "@type": "Answer", text: "Prices start at $15 per page (275 words) for 24-hour orders. Urgency multipliers apply: 12hr costs $26/page, 6hr $37/page, 3hr $52/page, and 1hr $75/page." },
    },
    {
      "@type": "Question",
      name: "Are the writers qualified?",
      acceptedAnswer: { "@type": "Answer", text: "All writers are manually vetted — PhD holders, Masters graduates, and published authors. They pass a strict application process before accessing any orders." },
    },
    {
      "@type": "Question",
      name: "What if the writer misses my deadline?",
      acceptedAnswer: { "@type": "Answer", text: "You receive a full automatic refund if a writer fails to deliver by your deadline. Payments are held in escrow and only released after you approve the work." },
    },
  ],
};

export default function HomePage() {
  return (
    <main className="relative min-h-screen overflow-hidden">
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
      <CTABanner />
      <FAQ />
      <Footer />
    </main>
  );
}
