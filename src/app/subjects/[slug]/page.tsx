import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Navbar } from "@/components/shared/Navbar";
import { Footer } from "@/components/shared/Footer";
import { Zap, CheckCircle, Clock, Shield, Star, ArrowRight, ChevronRight, BookOpen, FileText } from "lucide-react";
import { getSubject, getAllSubjectSlugs, SUBJECTS } from "./data";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return getAllSubjectSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const sub = getSubject(slug);
  if (!sub) return {};

  return {
    title: `${sub.heroHeading} | WriteProf`,
    description: sub.heroSub,
    alternates: { canonical: `https://writeprof.com/subjects/${sub.slug}` },
    keywords: sub.keywords,
    openGraph: {
      title: `${sub.name} Writing Service — WriteProf`,
      description: sub.heroSub,
      url: `https://writeprof.com/subjects/${sub.slug}`,
      type: "website",
    },
  };
}

const TURNAROUNDS = [
  { time: "1 Hour",   price: "$75/page", dot: "bg-red-400",    label: "text-red-400" },
  { time: "3 Hours",  price: "$52/page", dot: "bg-orange-400", label: "text-orange-400" },
  { time: "6 Hours",  price: "$37/page", dot: "bg-yellow-400", label: "text-yellow-400" },
  { time: "12 Hours", price: "$26/page", dot: "bg-green-400",  label: "text-green-400" },
  { time: "24 Hours", price: "$15/page", dot: "bg-brand-400",  label: "text-brand-400" },
];

export default async function SubjectPage({ params }: Props) {
  const { slug } = await params;
  const sub = getSubject(slug);
  if (!sub) notFound();

  const related = SUBJECTS.filter((s) => sub.relatedSubjects.includes(s.slug));

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: sub.faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };

  const serviceSchema = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: `${sub.name} Writing Service`,
    provider: { "@type": "Organization", name: "WriteProf", url: "https://writeprof.com" },
    description: sub.description,
    url: `https://writeprof.com/subjects/${sub.slug}`,
    offers: {
      "@type": "Offer",
      price: "15",
      priceCurrency: "USD",
      description: "per page (275 words) for 24-hour delivery",
    },
    areaServed: "Worldwide",
  };

  return (
    <div className="min-h-screen bg-[#020817]">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }} />

      {/* Background */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-[#020817]" />
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-brand-600/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-violet-600/8 rounded-full blur-3xl" />
      </div>

      <Navbar />

      {/* Breadcrumb */}
      <div className="pt-24 pb-0 px-4 max-w-5xl mx-auto">
        <nav className="flex items-center gap-2 text-xs text-slate-500">
          <Link href="/" className="hover:text-slate-300 transition-colors">Home</Link>
          <ChevronRight className="w-3 h-3" />
          <Link href="/subjects" className="hover:text-slate-300 transition-colors">Subjects</Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-slate-400">{sub.name}</span>
        </nav>
      </div>

      {/* Hero */}
      <div className="pt-10 pb-16 px-4 max-w-5xl mx-auto">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-400 text-sm font-semibold mb-5">
          <BookOpen className="w-4 h-4" />
          {sub.name} Writing Service
        </div>

        <h1 className="text-4xl sm:text-5xl font-extrabold text-white mb-5 leading-tight">
          {sub.heroHeading}
        </h1>
        <p className="text-slate-400 text-xl max-w-3xl mb-8 leading-relaxed">
          {sub.heroSub}
        </p>

        <div className="flex flex-wrap gap-3 mb-10">
          <Link
            href={`/signup?subject=${encodeURIComponent(sub.name)}`}
            className="btn-primary px-8 py-3.5 text-base inline-flex items-center gap-2 shadow-lg shadow-brand-500/30"
          >
            <Zap className="w-5 h-5" />
            Get {sub.name} Help Now
          </Link>
          <Link href="/samples" className="btn-secondary px-6 py-3.5 text-base inline-flex items-center gap-2">
            <FileText className="w-4 h-4" />
            View {sub.name} Samples
          </Link>
        </div>

        {/* Trust bar */}
        <div className="flex flex-wrap gap-5 text-sm text-slate-400">
          <span className="flex items-center gap-2"><Shield className="w-4 h-4 text-green-400" /> Escrow payments</span>
          <span className="flex items-center gap-2"><Star className="w-4 h-4 text-yellow-400" /> PhD & Masters writers</span>
          <span className="flex items-center gap-2"><Clock className="w-4 h-4 text-brand-400" /> 24/7 availability</span>
          <span className="flex items-center gap-2"><Zap className="w-4 h-4 text-red-400" /> Full refund if late</span>
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-5xl mx-auto px-4 pb-20">
        <div className="grid lg:grid-cols-3 gap-8">

          {/* Left */}
          <div className="lg:col-span-2 space-y-8">

            {/* About */}
            <div className="glass-card p-7">
              <h2 className="text-white font-bold text-xl mb-3">Expert {sub.name} Writers</h2>
              <p className="text-slate-400 leading-relaxed">{sub.description}</p>
            </div>

            {/* Paper types + topics grid */}
            <div className="grid sm:grid-cols-2 gap-6">
              <div className="glass-card p-7">
                <h2 className="text-white font-bold text-lg mb-4">Assignment Types We Cover</h2>
                <div className="space-y-2.5">
                  {sub.paperTypes.map((item) => (
                    <div key={item} className="flex items-center gap-3">
                      <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
                      <span className="text-slate-300 text-sm">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="glass-card p-7">
                <h2 className="text-white font-bold text-lg mb-4">Topics We Cover</h2>
                <div className="space-y-2.5">
                  {sub.topics.map((item) => (
                    <div key={item} className="flex items-center gap-3">
                      <span className="w-1.5 h-1.5 rounded-full bg-brand-400 flex-shrink-0" />
                      <span className="text-slate-300 text-sm">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* FAQ */}
            <div className="glass-card p-7">
              <h2 className="text-white font-bold text-xl mb-5">Frequently Asked Questions</h2>
              <div className="space-y-5">
                {sub.faqs.map((faq, i) => (
                  <div key={i} className="border-b border-white/5 pb-5 last:border-0 last:pb-0">
                    <h3 className="text-white font-semibold text-sm mb-2">{faq.q}</h3>
                    <p className="text-slate-400 text-sm leading-relaxed">{faq.a}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right */}
          <div className="space-y-6">
            <div className="glass-card p-6 sticky top-24">
              <p className="text-slate-400 text-xs mb-1">Starting at</p>
              <p className="text-4xl font-extrabold text-white mb-1">$15</p>
              <p className="text-slate-500 text-xs mb-1">per page (275 words) · 24hr delivery</p>
              <p className="text-brand-400 text-sm font-semibold mb-5">Emergency: from 1 hour</p>

              <Link
                href={`/signup?subject=${encodeURIComponent(sub.name)}`}
                className="btn-primary w-full flex items-center justify-center gap-2 py-3 mb-4"
              >
                <Zap className="w-4 h-4" />
                Order Now
              </Link>

              <div className="space-y-2">
                {["0% plagiarism guaranteed", "Unlimited free revisions", "Escrow — pay on approval", "Full refund if deadline missed"].map((f) => (
                  <div key={f} className="flex items-center gap-2 text-xs text-slate-500">
                    <CheckCircle className="w-3.5 h-3.5 text-green-400 flex-shrink-0" />
                    {f}
                  </div>
                ))}
              </div>
            </div>

            <div className="glass-card p-6">
              <h3 className="text-white font-semibold text-sm mb-4">Turnaround Pricing</h3>
              <div className="space-y-2">
                {TURNAROUNDS.map((t) => (
                  <div key={t.time} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${t.dot}`} />
                      <span className="text-slate-300 text-sm">{t.time}</span>
                    </div>
                    <span className={`text-sm font-semibold ${t.label}`}>{t.price}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="glass-card p-6">
              <h3 className="text-white font-semibold text-sm mb-3">Related Services</h3>
              <div className="space-y-2">
                {[
                  { label: "Essay Writing", href: "/services/essay-writing" },
                  { label: "Research Papers", href: "/services/research-papers" },
                  { label: "Dissertations", href: "/services/dissertations" },
                  { label: "Proofreading", href: "/services/proofreading-editing" },
                ].map((l) => (
                  <Link key={l.href} href={l.href} className="flex items-center justify-between text-sm text-slate-400 hover:text-brand-400 transition-colors py-1">
                    {l.label}
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Related subjects */}
        {related.length > 0 && (
          <div className="mt-14">
            <h2 className="text-white font-bold text-xl mb-6">Related Subjects</h2>
            <div className="grid sm:grid-cols-3 gap-4">
              {related.map((r) => (
                <Link
                  key={r.slug}
                  href={`/subjects/${r.slug}`}
                  className="glass-card p-5 hover:border-brand-500/30 transition-all duration-200 group"
                >
                  <h3 className="text-white font-semibold text-sm mb-1 group-hover:text-brand-300 transition-colors">
                    {r.name} Writing
                  </h3>
                  <p className="text-slate-500 text-xs mb-3 line-clamp-2">{r.heroSub.slice(0, 80)}…</p>
                  <div className="flex items-center gap-1 text-brand-400 text-xs font-medium group-hover:gap-2 transition-all">
                    View subject <ArrowRight className="w-3 h-3" />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* CTA */}
      <div className="bg-gradient-to-r from-brand-600/20 to-violet-600/10 border-t border-brand-500/20 py-16 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Need {sub.name} help right now?
          </h2>
          <p className="text-slate-400 text-lg mb-8">
            Place your order in 2 minutes. A qualified {sub.name} writer starts immediately.
          </p>
          <Link
            href={`/signup?subject=${encodeURIComponent(sub.name)}`}
            className="btn-primary px-8 py-3.5 text-base inline-flex items-center gap-2"
          >
            <Zap className="w-5 h-5" />
            Get {sub.name} Help Now
          </Link>
        </div>
      </div>

      <Footer />
    </div>
  );
}
