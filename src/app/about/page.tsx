import { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/shared/Navbar";
import { Footer } from "@/components/shared/Footer";
import { Zap, Shield, Clock, Users, Star, ArrowRight } from "lucide-react";

export const metadata: Metadata = {
  title: "About Us",
  description: "WriteProf is the world's most trusted emergency writing marketplace — connecting clients with vetted professional writers for rush orders delivered in 1–24 hours.",
  alternates: { canonical: "https://writeprof.com/about" },
};

const stats = [
  { value: "10,000+", label: "Orders Completed" },
  { value: "500+", label: "Vetted Writers" },
  { value: "98%", label: "On-Time Delivery" },
  { value: "4.9/5", label: "Average Rating" },
];

const values = [
  {
    icon: Clock,
    title: "Speed Without Compromise",
    description: "We exist for deadlines. Whether you have 1 hour or 24 hours, our writers deliver professional work on time, every time.",
  },
  {
    icon: Shield,
    title: "Quality You Can Trust",
    description: "Every writer on WriteProf is manually vetted. We accept fewer than 5% of applicants — so only the best work on your orders.",
  },
  {
    icon: Users,
    title: "Fair for Everyone",
    description: "Writers earn 80% of every order. We believe the people doing the work should be paid fairly — and that makes them work harder for you.",
  },
  {
    icon: Star,
    title: "Your Success is Our Mission",
    description: "We don't just deliver words — we deliver results. Every order comes with revisions until you're satisfied.",
  },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[#020817]">
      <Navbar />

      {/* Hero */}
      <section className="relative pt-24 pb-16 px-4 sm:px-6 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-brand-900/30 via-transparent to-transparent" />
        <div className="max-w-4xl mx-auto text-center relative">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-400 text-sm font-medium mb-6">
            <Zap className="w-4 h-4" />
            Our Story
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-6 leading-tight">
            Built for the moments when<br />
            <span className="gradient-text">time runs out</span>
          </h1>
          <p className="text-lg text-gray-400 leading-relaxed max-w-2xl mx-auto">
            WriteProf was born from a simple truth: deadlines don't wait, and neither should you.
            We built the fastest, most reliable writing marketplace in the world — so you never have to face a deadline alone.
          </p>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 px-4 sm:px-6 border-y border-white/5">
        <div className="max-w-5xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-8">
          {stats.map((stat) => (
            <div key={stat.label} className="text-center">
              <p className="text-3xl font-bold gradient-text mb-1">{stat.value}</p>
              <p className="text-sm text-gray-500">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Mission */}
      <section className="py-16 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto">
          <div className="glass-card p-8 sm:p-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-6">Our Mission</h2>
            <p className="text-gray-300 text-lg leading-relaxed mb-4">
              We believe everyone deserves access to professional writing help — regardless of how tight their deadline is.
              Students, entrepreneurs, business owners, and professionals all face moments where they need expert writing fast.
            </p>
            <p className="text-gray-400 leading-relaxed">
              WriteProf connects you with pre-vetted professional writers who specialize in urgent delivery.
              Every writer on our platform has been thoroughly reviewed, tested, and approved — so when you place an order,
              you get someone who knows exactly what they're doing.
            </p>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-16 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold text-white text-center mb-12">What We Stand For</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {values.map((value) => (
              <div key={value.title} className="glass-card p-6">
                <div className="w-10 h-10 rounded-xl bg-brand-500/20 flex items-center justify-center mb-4">
                  <value.icon className="w-5 h-5 text-brand-400" />
                </div>
                <h3 className="text-white font-semibold text-lg mb-2">{value.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-4 sm:px-6">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">Ready to get started?</h2>
          <p className="text-gray-400 mb-8">Join thousands of clients who trust WriteProf for their most urgent writing needs.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/signup" className="btn-primary px-8 py-3 flex items-center justify-center gap-2">
              Place an Order <ArrowRight className="w-4 h-4" />
            </Link>
            <Link href="/writer/apply" className="btn-secondary px-8 py-3">
              Become a Writer
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
