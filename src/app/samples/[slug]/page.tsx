import { notFound } from "next/navigation";
import { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { ArrowLeft, FileText, GraduationCap, BookOpen, Globe, Hash, Paperclip, Download, Eye } from "lucide-react";

interface Props { params: { slug: string } }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const sample = await prisma.sampleOrder.findFirst({
    where: { slug: params.slug, isPublished: true },
  });
  if (!sample) return { title: "Sample Not Found" };

  const url = `https://writeprof.com/samples/${sample.slug}`;
  const desc = `${sample.educationLevel} ${sample.orderType} — ${sample.subject}. ${sample.pages} pages, ${sample.wordCount} words${sample.citationStyle ? `, ${sample.citationStyle}` : ""}. Get similar work done by professionals in 1–24 hours.`;

  return {
    title: `${sample.title} — Sample Assignment`,
    description: desc.slice(0, 160),
    alternates: { canonical: url },
    keywords: sample.tags,
    openGraph: {
      title: sample.title,
      description: desc.slice(0, 160),
      url,
      type: "article",
    },
  };
}

export default async function SampleOrderPage({ params }: Props) {
  const sample = await prisma.sampleOrder.findFirst({
    where: { slug: params.slug, isPublished: true },
    include: { attachments: true },
  });

  if (!sample) notFound();

  // Increment views
  prisma.sampleOrder.update({ where: { id: sample.id }, data: { views: { increment: 1 } } }).catch(() => {});

  const relatedSamples = await prisma.sampleOrder.findMany({
    where: { isPublished: true, subject: sample.subject, slug: { not: sample.slug } },
    take: 3,
    select: { slug: true, title: true, orderType: true, educationLevel: true, pages: true },
  });

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "https://writeprof.com" },
      { "@type": "ListItem", position: 2, name: "Samples", item: "https://writeprof.com/samples" },
      { "@type": "ListItem", position: 3, name: sample.title, item: `https://writeprof.com/samples/${sample.slug}` },
    ],
  };

  return (
    <div className="min-h-screen bg-[#0a0f1e]">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />

      {/* Nav */}
      <nav className="sticky top-0 z-40 border-b border-white/10 backdrop-blur-xl bg-[#0a0f1e]/80">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/samples" className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors">
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm">All Samples</span>
          </Link>
          <Link href="/" className="text-lg font-bold gradient-text">WriteProf</Link>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-4 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Main */}
          <div className="lg:col-span-2 space-y-6">
            {/* Header */}
            <div>
              <div className="flex flex-wrap gap-2 mb-4">
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-brand-500/20 text-brand-300 border border-brand-500/30">
                  {sample.orderType}
                </span>
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-white/10 text-slate-300">
                  {sample.educationLevel}
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white leading-tight mb-3">
                {sample.title}
              </h1>
              <p className="text-slate-400 text-sm flex items-center gap-1.5">
                <GraduationCap className="w-4 h-4" />
                {sample.subject}
              </p>
            </div>

            {/* Instructions */}
            <div className="glass-card p-6">
              <h2 className="text-white font-semibold mb-4 flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-brand-400" />
                Assignment Instructions
              </h2>
              <div className="text-slate-300 text-sm leading-relaxed whitespace-pre-wrap">
                {sample.description}
              </div>
            </div>

            {/* Attachments */}
            {sample.attachments.length > 0 && (
              <div className="glass-card p-6">
                <h2 className="text-white font-semibold mb-4 flex items-center gap-2">
                  <Paperclip className="w-4 h-4 text-brand-400" />
                  Attached Files
                </h2>
                <div className="space-y-2">
                  {sample.attachments.map((a) => (
                    <a
                      key={a.id}
                      href={a.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10 hover:border-brand-500/30 hover:bg-brand-500/5 transition-all group"
                    >
                      <div className="w-8 h-8 rounded-lg bg-brand-500/20 flex items-center justify-center shrink-0">
                        <FileText className="w-4 h-4 text-brand-400" />
                      </div>
                      <span className="text-slate-300 text-sm flex-1 group-hover:text-white transition-colors">{a.name}</span>
                      <Download className="w-4 h-4 text-slate-500 group-hover:text-brand-400 transition-colors" />
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Tags */}
            {sample.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {sample.tags.map((tag) => (
                  <span key={tag} className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs bg-white/5 border border-white/10 text-slate-400">
                    <Hash className="w-3 h-3" />{tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-5">
            {/* CTA */}
            <div className="glass-card p-5 border border-brand-500/20">
              <p className="text-brand-300 text-xs font-semibold uppercase tracking-wide mb-3">Need this done?</p>
              <p className="text-white font-semibold text-sm mb-1">Similar assignment?</p>
              <p className="text-slate-400 text-xs mb-4">Get it done by a vetted professional writer in as little as 1 hour.</p>
              <Link href="/signup" className="btn-primary w-full justify-center text-sm py-3 block text-center">
                Place My Order →
              </Link>
              <Link href="/login" className="block text-center text-slate-500 text-xs mt-2 hover:text-slate-300 transition-colors">
                Already have an account? Sign in
              </Link>
            </div>

            {/* Details */}
            <div className="glass-card p-5 space-y-3">
              <h3 className="text-white font-semibold text-sm mb-3">Assignment Details</h3>
              {[
                { label: "Subject", value: sample.subject, icon: GraduationCap },
                { label: "Type", value: sample.orderType, icon: BookOpen },
                { label: "Level", value: sample.educationLevel, icon: GraduationCap },
                { label: "Pages", value: `${sample.pages} pages (${sample.wordCount.toLocaleString()} words)`, icon: FileText },
                { label: "Sources", value: sample.sources ? `${sample.sources} sources` : "Not specified", icon: BookOpen },
                { label: "Citation", value: sample.citationStyle || "Not specified", icon: Hash },
                { label: "Language", value: sample.language, icon: Globe },
                { label: "Views", value: String(sample.views), icon: Eye },
              ].map((row) => (
                <div key={row.label} className="flex items-start gap-2.5 py-2 border-b border-white/5 last:border-0">
                  <row.icon className="w-4 h-4 text-slate-500 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-slate-500 text-xs">{row.label}</p>
                    <p className="text-slate-300 text-sm">{row.value}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Related */}
            {relatedSamples.length > 0 && (
              <div className="glass-card p-5">
                <h3 className="text-white font-semibold text-sm mb-3">Related Assignments</h3>
                <div className="space-y-2">
                  {relatedSamples.map((r) => (
                    <Link key={r.slug} href={`/samples/${r.slug}`} className="block p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-all">
                      <p className="text-white text-xs font-medium leading-snug mb-1 line-clamp-2">{r.title}</p>
                      <p className="text-slate-500 text-xs">{r.educationLevel} · {r.orderType} · {r.pages}p</p>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom CTA */}
      <div className="bg-gradient-to-r from-brand-600/20 to-brand-400/10 border-t border-brand-500/20 py-12">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold text-white mb-3">Have a similar assignment?</h2>
          <p className="text-slate-400 mb-6">Post your order and get it completed by a vetted professional in 1–24 hours.</p>
          <Link href="/signup" className="btn-primary px-8 py-3 text-base">Place an Order →</Link>
        </div>
      </div>
    </div>
  );
}
