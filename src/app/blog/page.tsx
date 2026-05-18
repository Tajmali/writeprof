import { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { Navbar } from "@/components/shared/Navbar";
import { Footer } from "@/components/shared/Footer";
import Link from "next/link";
import { Clock, ArrowRight, BookOpen, TrendingUp } from "lucide-react";

export const metadata: Metadata = {
  title: "Blog — Writing Tips, Deadlines & Productivity",
  description: "Expert tips on academic writing, meeting tight deadlines, productivity hacks, and professional writing strategies from the WriteProf team.",
  alternates: { canonical: "https://writeprof.com/blog" },
  keywords: ["writing tips", "academic writing", "deadline productivity", "essay writing guide", "professional writing blog"],
  openGraph: {
    title: "WriteProf Blog — Writing Tips, Deadlines & Productivity",
    description: "Expert advice on academic writing, beating deadlines, and professional writing from the WriteProf team.",
    url: "https://writeprof.com/blog",
    type: "website",
    images: [{ url: "https://writeprof.com/og-image.png", width: 1200, height: 630, alt: "WriteProf Blog" }],
  },
};

const categoryColors: Record<string, string> = {
  "Writing Tips":      "badge-blue",
  "Academic Help":     "badge-purple",
  "Career Advice":     "badge-green",
  "Platform Updates":  "badge-orange",
  "Success Stories":   "badge-red",
  "Industry News":     "badge-blue",
  "Tutorials":         "badge-green",
  "Urgent Writing Help": "badge-red",
  "Academic Tips":     "badge-blue",
  "Productivity":      "badge-green",
  "Deadline Management": "badge-orange",
  "Copywriting":       "badge-purple",
};

export default async function BlogPage() {
  // Load published posts from database
  const posts = await prisma.blogPost.findMany({
    where: { isPublished: true },
    orderBy: { createdAt: "desc" },
    take: 12,
  });

  const featured = posts[0] || null;
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

          {/* No posts state */}
          {posts.length === 0 && (
            <div className="glass-card p-20 text-center">
              <BookOpen className="w-16 h-16 text-slate-700 mx-auto mb-4" />
              <h2 className="text-white font-bold text-xl mb-2">No articles yet</h2>
              <p className="text-slate-400 text-sm">Check back soon — great content is on the way!</p>
            </div>
          )}

          {/* Featured post */}
          {featured && (
            <Link href={`/blog/${featured.slug}`} className="block mb-12 group">
              <div className="glass-card p-0 overflow-hidden hover:border-brand-500/30 transition-all duration-300">
                <div className="grid md:grid-cols-2 gap-0">
                  {/* Cover image or gradient placeholder */}
                  <div className="h-64 md:h-auto overflow-hidden">
                    {featured.coverImage ? (
                      <img
                        src={featured.coverImage}
                        alt={featured.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-brand-900 to-brand-700 flex items-center justify-center">
                        <BookOpen className="w-20 h-20 text-brand-500/40" />
                      </div>
                    )}
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
                    <p className="text-slate-400 text-sm mb-6 leading-relaxed line-clamp-3">
                      {featured.excerpt}
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-600 to-brand-400 flex items-center justify-center text-white text-xs font-bold">
                          {featured.author.slice(0, 2).toUpperCase()}
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
          )}

          {/* Post grid */}
          {rest.length > 0 && (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {rest.map((post) => (
                <Link key={post.id} href={`/blog/${post.slug}`} className="group">
                  <div className="glass-card p-0 overflow-hidden hover:border-white/20 transition-all duration-300 h-full flex flex-col">
                    <div className="h-40 overflow-hidden">
                      {post.coverImage ? (
                        <img
                          src={post.coverImage}
                          alt={post.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center">
                          <BookOpen className="w-12 h-12 text-slate-700" />
                        </div>
                      )}
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
                            {post.author.slice(0, 2).toUpperCase()}
                          </div>
                          <span className="text-slate-500 text-xs">{post.author}</span>
                        </div>
                        <div className="flex items-center gap-1 text-slate-600 text-xs">
                          <Clock className="w-3 h-3" />
                          {post.readTime}m read
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
