import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { FileText, GraduationCap, ArrowRight, BookMarked } from "lucide-react";

const levelColors: Record<string, string> = {
  "High School":    "bg-blue-500/20 text-blue-300 border border-blue-500/30",
  "College":        "bg-green-500/20 text-green-300 border border-green-500/30",
  "Undergraduate":  "bg-green-500/20 text-green-300 border border-green-500/30",
  "Masters":        "bg-purple-500/20 text-purple-300 border border-purple-500/30",
  "PhD":            "bg-purple-500/20 text-purple-300 border border-purple-500/30",
  "Professional":   "bg-red-500/20 text-red-300 border border-red-500/30",
};

export async function SamplesPreview() {
  const samples = await prisma.sampleOrder.findMany({
    where: { isPublished: true },
    orderBy: { views: "desc" },
    take: 6,
    select: {
      slug: true,
      title: true,
      subject: true,
      orderType: true,
      educationLevel: true,
      pages: true,
      wordCount: true,
      citationStyle: true,
    },
  });

  if (samples.length === 0) return null;

  return (
    <section className="py-20 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-400 text-sm font-semibold mb-4">
            <BookMarked className="w-4 h-4" />
            Real Assignment Instructions
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Browse Sample <span className="gradient-text">Assignments</span>
          </h2>
          <p className="text-slate-400 text-lg max-w-xl mx-auto">
            See real assignments our writers have handled. Find something similar to yours and get it done in 1–24 hours.
          </p>
        </div>

        {/* Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
          {samples.map((s) => (
            <Link
              key={s.slug}
              href={`/samples/${s.slug}`}
              className="glass-card p-5 hover:border-brand-500/30 transition-all group flex flex-col"
            >
              {/* Badges */}
              <div className="flex flex-wrap gap-1.5 mb-3">
                <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${levelColors[s.educationLevel] || "bg-blue-500/20 text-blue-300 border border-blue-500/30"}`}>
                  {s.educationLevel}
                </span>
                <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-white/10 text-slate-300 border border-white/10">
                  {s.orderType}
                </span>
              </div>

              {/* Title */}
              <h3 className="text-white font-semibold text-sm leading-snug mb-2 group-hover:text-brand-300 transition-colors line-clamp-2 flex-1">
                {s.title}
              </h3>

              {/* Subject */}
              <p className="text-slate-500 text-xs mb-4 flex items-center gap-1">
                <GraduationCap className="w-3.5 h-3.5 shrink-0" />
                {s.subject}
              </p>

              {/* Footer */}
              <div className="flex items-center justify-between text-xs text-slate-500 pt-3 border-t border-white/5">
                <span className="flex items-center gap-1">
                  <FileText className="w-3.5 h-3.5" />
                  {s.pages}p · {s.wordCount.toLocaleString()} words
                  {s.citationStyle && s.citationStyle !== "None / Not specified" && ` · ${s.citationStyle}`}
                </span>
                <ArrowRight className="w-4 h-4 text-brand-400 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center">
          <Link
            href="/samples"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm font-semibold hover:bg-white/10 hover:border-white/20 transition-all"
          >
            View All Samples
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
