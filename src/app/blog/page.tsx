import { Metadata } from "next";
import { Navbar } from "@/components/shared/Navbar";
import { Footer } from "@/components/shared/Footer";
import Link from "next/link";
import { Clock, ArrowRight, BookOpen, TrendingUp } from "lucide-react";

export const metadata: Metadata = {
  title: "Blog — Writing Tips, Deadlines & Productivity",
  description: "Expert tips on academic writing, meeting deadlines, productivity, and professional writing from the WriteProf team.",
};

const categories = [
  "All Posts",
  "Urgent Writing Help",
  "Academic Tips",
  "Productivity",
  "Deadline Management",
  "Copywriting",
];

const posts = [
  {
    id: "1",
    slug: "how-to-write-essay-in-2-hours",
    title: "How to Write a Compelling Essay in Under 2 Hours",
    excerpt: "When time is running out, you need a system. Here's the exact framework our top writers use to produce high-quality essays in hours, not days.",
    category: "Urgent Writing Help",
    author: "Dr. Sarah K.",
    authorImage: null,
    readTime: 7,
    coverImage: null,
    tags: ["Essay Writing", "Speed Writing", "Academic"],
    publishedAt: "2026-05-01",
    views: 12400,
  },
  {
    id: "2",
    slug: "beating-writing-procrastination",
    title: "The Psychology of Writing Procrastination (And How to Beat It)",
    excerpt: "Why does everyone put writing off until the last minute? Understanding the psychology behind deadline panic helps you work faster and better.",
    category: "Productivity",
    author: "James O.",
    authorImage: null,
    readTime: 8,
    coverImage: null,
    tags: ["Procrastination", "Psychology", "Writing Tips"],
    publishedAt: "2026-04-28",
    views: 9800,
  },
  {
    id: "3",
    slug: "apa-mla-citation-guide-2026",
    title: "APA vs MLA vs Chicago: The Complete Citation Guide for 2026",
    excerpt: "Getting citations wrong can cost you marks or credibility. This complete guide covers every citation style with examples you can copy directly.",
    category: "Academic Tips",
    author: "Prof. Amara",
    authorImage: null,
    readTime: 12,
    coverImage: null,
    tags: ["APA", "MLA", "Citations", "Academic Writing"],
    publishedAt: "2026-04-20",
    views: 24500,
  },
  {
    id: "4",
    slug: "copywriting-that-converts",
    title: "7 Copywriting Formulas That Convert Like Crazy in 2026",
    excerpt: "Great copy doesn't happen by accident. These battle-tested copywriting frameworks have generated millions in revenue for our clients.",
    category: "Copywriting",
    author: "Marcus T.",
    authorImage: null,
    readTime: 10,
    coverImage: null,
    tags: ["Copywriting", "Marketing", "Conversion"],
    publishedAt: "2026-04-15",
    views: 15200,
  },
  {
    id: "5",
    slug: "dissertation-writing-strategy",
    title: "The Complete Dissertation Writing Strategy: From Zero to Defense",
    excerpt: "Writing a dissertation is one of the most challenging academic tasks. This comprehensive strategy breaks it into manageable steps.",
    category: "Academic Tips",
    author: "Dr. Olivia R.",
    authorImage: null,
    readTime: 15,
    coverImage: null,
    tags: ["Dissertation", "PhD", "Academic Writing"],
    publishedAt: "2026-04-10",
    views: 18900,
  },
  {
    id: "6",
    slug: "deadline-management-system",
    title: "The WriteProf Deadline Management System for Students",
    excerpt: "Never panic about a deadline again. This system helps you track, prioritize, and deliver every piece of writing on time.",
    category: "Deadline Management",
    author: "Tunde A.",
    authorImage: null,
    readTime: 6,
    coverImage: null,
    tags: ["Deadlines", "Student Tips", "Time Management"],
    publishedAt: "2026-04-05",
    views: 11300,
  },
];

const categoryColors: Record<string, string> = {
  "Urgent Writing Help": "badge-red",
  "Academic Tips": "badge-blue",
  "Productivity": "badge-green",
  "Deadline Management": "badge-orange",
  "Copywriting": "badge-purple",
};

export default function BlogPage() {
  const featured = posts[0];
  const rest = posts.slice(1);

  return (
    <div className="min-h-screen bg-[#020817]">
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-[#020817]" />
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-brand-600/8 rounded-full blur-3xl" />
      </div>

      <Navbar />

      <main className="pt-24 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-16 pt-8">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-400 text-sm font-semibold mb-4">
              <BookOpen className="w-3.5 h-3.5" />
              The WriteProf Blog
            </div>
            <h1 className="text-4xl lg:text-5xl font-extrabold text-white mb-4">
              Writing Insights &{" "}
              <span className="gradient-text">Expert Tips</span>
            </h1>
            <p className="text-slate-400 text-lg max-w-xl mx-auto">
              Actionable advice from professional writers, editors, and academic experts.
            </p>
          </div>

          {/* Category filter */}
          <div className="flex flex-wrap gap-2 mb-10 justify-center">
            {categories.map((cat) => (
              <button
                key={cat}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${
                  cat === "All Posts"
                    ? "bg-brand-500 text-white"
                    : "bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 border border-white/10"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Featured post */}
          <Link href={`/blog/${featured.slug}`} className="block mb-12 group">
            <div className="glass-card p-0 overflow-hidden hover:border-brand-500/30 transition-all duration-300">
              <div className="grid md:grid-cols-2 gap-0">
                {/* Image placeholder */}
                <div className="h-64 md:h-auto bg-gradient-to-br from-brand-900 to-brand-700 flex items-center justify-center">
                  <BookOpen className="w-20 h-20 text-brand-500/40" />
                </div>
                <div className="p-8">
                  <div className="flex items-center gap-2 mb-3">
                    <span className={`badge ${categoryColors[featured.category] || "badge-blue"}`}>
                      {featured.category}
                    </span>
                    <span className="text-slate-600 text-xs">Featured</span>
                  </div>
                  <h2 className="text-2xl font-bold text-white mb-3 group-hover:text-brand-300 transition-colors leading-tight">
                    {featured.title}
                  </h2>
                  <p className="text-slate-400 text-sm mb-6 leading-relaxed">{featured.excerpt}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-600 to-brand-400 flex items-center justify-center text-white text-xs font-bold">
                        {featured.author.slice(0, 2)}
                      </div>
                      <div>
                        <p className="text-white text-xs font-medium">{featured.author}</p>
                        <div className="flex items-center gap-1 text-slate-600 text-xs">
                          <Clock className="w-3 h-3" />
                          {featured.readTime} min read
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-brand-400 text-sm font-medium group-hover:gap-2 transition-all">
                      Read article <ArrowRight className="w-4 h-4" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Link>

          {/* Post grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {rest.map((post) => (
              <Link key={post.id} href={`/blog/${post.slug}`} className="group">
                <div className="glass-card p-0 overflow-hidden hover:border-white/20 transition-all duration-300 h-full flex flex-col">
                  {/* Image placeholder */}
                  <div className="h-40 bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center">
                    <BookOpen className="w-12 h-12 text-slate-700" />
                  </div>
                  <div className="p-5 flex flex-col flex-1">
                    <span className={`badge ${categoryColors[post.category] || "badge-blue"} self-start mb-3`}>
                      {post.category}
                    </span>
                    <h2 className="text-white font-semibold mb-2 group-hover:text-brand-300 transition-colors leading-snug line-clamp-2">
                      {post.title}
                    </h2>
                    <p className="text-slate-400 text-sm mb-4 leading-relaxed line-clamp-2 flex-1">
                      {post.excerpt}
                    </p>
                    <div className="flex items-center justify-between mt-auto">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-brand-600 to-brand-400 flex items-center justify-center text-white text-xs font-bold">
                          {post.author.slice(0, 2)}
                        </div>
                        <span className="text-slate-500 text-xs">{post.author}</span>
                      </div>
                      <div className="flex items-center gap-1 text-slate-600 text-xs">
                        <Clock className="w-3 h-3" />
                        {post.readTime}m
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
