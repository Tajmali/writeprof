import { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/shared/Navbar";
import { Footer } from "@/components/shared/Footer";
import { Zap, BookOpen, ArrowRight } from "lucide-react";
import { SUBJECTS } from "./[slug]/data";

export const metadata: Metadata = {
  title: "Academic Writing by Subject — Essays, Papers & More | WriteProf",
  description: "Find expert writing help for your specific subject — nursing, psychology, law, business, history, and more. Rush delivery from 1 hour. From $15/page.",
  alternates: { canonical: "https://writeprof.com/subjects" },
  keywords: ["academic writing by subject", "subject specific essay help", "nursing essay service", "psychology essay service", "law essay service", "business essay service"],
  openGraph: {
    title: "Academic Writing by Subject — WriteProf",
    description: "Expert writing help for every subject. Rush delivery from 1 hour.",
    url: "https://writeprof.com/subjects",
    type: "website",
  },
};

export default function SubjectsPage() {
  return (
    <div className="min-h-screen bg-[#020817]">
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-[#020817]" />
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-brand-600/10 rounded-full blur-3xl" />
      </div>

      <Navbar />

      <div className="pt-32 pb-16 px-4 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-400 text-sm font-semibold mb-5">
          <BookOpen className="w-4 h-4" />
          Writing Help by Subject
        </div>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-white mb-5">
          Expert Help for{" "}
          <span className="bg-gradient-to-r from-brand-400 to-violet-400 bg-clip-text text-transparent">
            Every Subject
          </span>
        </h1>
        <p className="text-slate-400 text-xl max-w-2xl mx-auto mb-8">
          Our writers specialise in your subject. Pick yours to see exactly what we cover and how fast we can deliver.
        </p>
        <Link href="/signup" className="btn-primary px-8 py-3.5 text-base inline-flex items-center gap-2">
          <Zap className="w-5 h-5" />
          Place an Order Now
        </Link>
      </div>

      <div className="max-w-6xl mx-auto px-4 pb-24">
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {SUBJECTS.map((sub) => (
            <Link
              key={sub.slug}
              href={`/subjects/${sub.slug}`}
              className="glass-card p-6 hover:border-brand-500/30 transition-all duration-200 group flex flex-col"
            >
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${sub.color} flex items-center justify-center mb-4 flex-shrink-0`}>
                <BookOpen className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-white font-bold text-lg mb-2 group-hover:text-brand-300 transition-colors">
                {sub.name}
              </h2>
              <p className="text-slate-400 text-sm mb-4 leading-relaxed flex-1 line-clamp-2">
                {sub.description.slice(0, 100)}…
              </p>
              <div className="flex flex-wrap gap-1.5 mb-4">
                {sub.paperTypes.slice(0, 3).map((t) => (
                  <span key={t} className="text-xs px-2 py-0.5 rounded-full bg-white/5 text-slate-400 border border-white/10">
                    {t}
                  </span>
                ))}
              </div>
              <div className="flex items-center gap-1 text-brand-400 text-xs font-medium group-hover:gap-2 transition-all mt-auto">
                View {sub.name} service <ArrowRight className="w-3 h-3" />
              </div>
            </Link>
          ))}
        </div>
      </div>

      <Footer />
    </div>
  );
}
