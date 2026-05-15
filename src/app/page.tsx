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
  title: "WriteProf — Emergency Writing Marketplace | Deadline Savers",
  description:
    "Submit urgent writing tasks and get them completed by professional writers within 1–24 hours. Essays, research papers, copywriting, and more.",
};

export default function HomePage() {
  return (
    <main className="relative min-h-screen overflow-hidden">
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
