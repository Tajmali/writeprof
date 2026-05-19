import { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { Navbar } from "@/components/shared/Navbar";
import { Footer } from "@/components/shared/Footer";
import Link from "next/link";
import { BookOpen, FileText, GraduationCap, Clock, ArrowRight, Search } from "lucide-react";

export const metadata: Metadata = {
  title: "Sample Assignments — Essays, Research Papers & More",
  description: "Browse real assignment instructions across nursing, business, psychology, and more. Find work similar to yours and get it done by professional writers in 1–24 hours.",
  alternates: { canonical: "https://writeprof.com/samples" },
  openGraph: {
    title: "Sample Assignments — WriteProf",
    description: "Real assignment instructions. Find similar work and get it done fast.",
    url: "https://writeprof.com/samples",
    type: "website",
  },
};

const levelColors: Record<string, string> = {
  "High School": "badge-blue",
  "College": "badge-green",
  "Undergraduate": "badge-green",
  "Masters": "badge-purple",
  "PhD": "badge-purple",
  "Professional": "badge-red",
};

export default async function SamplesPage({
  searchParams,
}: {
  searchParams: { subject?: string; type?: string };
}) {
  const where: Record<string, unknown> = { isPublished: true };
  if (searchParams.subject) where.subject = { contains: searchParams.subject, mode: "insensitive" };
  if (searchParams.type) where.orderType = searchParams.type;

  const [samples, subjects, types] = await Promise.all([
    prisma.sampleOrder.findMany({
      where,
      orderBy: { createdAt: "desc" },
      select: {
        id: true, slug: true, title: true, subject: true, orderType: true,
        educationLevel: true, pages: true, wordCount: true, citationStyle: true,
        sources: true, language: true, tags: true, views: true, createdAt: true,
        _count: { select: { attachments: true } },
      },
    }),
    prisma.sampleOrder.findMany({
      where: { isPublished: true },
      select: { subject: true },
      distinct: ["subject"],
      orderBy: { subject: "asc" },
    }),
    prisma.sampleOrder.findMany({
      where: { isPublished: true },
      select: { orderType: true },
      distinct: ["orderType"],
      orderBy: { orderType: "asc" },
    }),
  ]);

  return (
    <div className="min-h-screen bg-[#0a0f1e]">
      <Navbar />

      {/* Hero */}
      <div className="pt-28 pb-12 px-4 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-400 text-xs font-semibold mb-5">
          <BookOpen className="w-3.5 h-3.5" />
          Real Assignment Instructions
        </div>
        <h1 className="text-3xl sm:text-5xl font-bold text-white mb-4 leading-tight">
          Sample <span className="gradient-text">Assignments</span>
        </h1>
        <p className="text-slate-400 text-lg max-w-2xl mx-auto mb-8">
          Browse real assignment instructions. Find something similar to your task and let our professional writers handle it in 1–24 hours.
        </p>
        <Link href="/signup" className="btn-primary px-7 py-3 text-base">
          Get My Assignment Done →
        </Link>
      </div>

      {/* Filters */}
      <div className="max-w-6xl mx-auto px-4 mb-8">
        <div className="flex flex-wrap gap-3 items-center">
          <Link
            href="/samples"
            className={`px-3 py-1.5 rounded-full text-sm border transition-all ${
              !searchParams.subject && !searchParams.type
                ? "bg-brand-500/20 border-brand-500/40 text-brand-300"
                : "border-white/10 text-slate-400 hover:border-white/20 hover:text-white"
            }`}
          >
            All
          </Link>
          {types.map((t) => (
            <Link
              key={t.orderType}
              href={`/samples?type=${encodeURIComponent(t.orderType)}`}
              className={`px-3 py-1.5 rounded-full text-sm border transition-all ${
                searchParams.type === t.orderType
                  ? "bg-brand-500/20 border-brand-500/40 text-brand-300"
                  : "border-white/10 text-slate-400 hover:border-white/20 hover:text-white"
              }`}
            >
              {t.orderType}
            </Link>
          ))}
        </div>
      </div>

      {/* Grid */}
      <div className="max-w-6xl mx-auto px-4 pb-20">
        {samples.length === 0 ? (
          <div className="text-center py-20 text-slate-500">No samples found.</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {samples.map((s) => (
              <Link
                key={s.id}
                href={`/samples/${s.slug}`}
                className="glass-card p-5 hover:border-brand-500/30 transition-all group flex flex-col"
              >
                {/* Badges */}
                <div className="flex flex-wrap gap-1.5 mb-3">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${levelColors[s.educationLevel] || "badge-blue"}`}>
                    {s.educationLevel}
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-white/10 text-slate-300">
                    {s.orderType}
                  </span>
                </div>

                {/* Title */}
                <h2 className="text-white font-semibold text-sm leading-snug mb-2 group-hover:text-brand-300 transition-colors line-clamp-2 flex-1">
                  {s.title}
                </h2>

                {/* Subject */}
                <p className="text-slate-500 text-xs mb-4 flex items-center gap-1">
                  <GraduationCap className="w-3.5 h-3.5" />
                  {s.subject}
                </p>

                {/* Meta row */}
                <div className="flex items-center justify-between text-xs text-slate-500 pt-3 border-t border-white/5">
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1">
                      <FileText className="w-3.5 h-3.5" />
                      {s.pages}p / {s.wordCount.toLocaleString()}w
                    </span>
                    {s.citationStyle && s.citationStyle !== "None / Not specified" && (
                      <span>{s.citationStyle}</span>
                    )}
                  </div>
                  <ArrowRight className="w-4 h-4 text-brand-400 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* CTA */}
      <div className="bg-gradient-to-r from-brand-600/20 to-brand-400/10 border-t border-brand-500/20 py-12">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold text-white mb-3">Have a similar assignment?</h2>
          <p className="text-slate-400 mb-6">Post your order and get it done by a vetted professional in as little as 1 hour.</p>
          <Link href="/signup" className="btn-primary px-8 py-3 text-base">Place an Order →</Link>
        </div>
      </div>

      <Footer />
    </div>
  );
}
