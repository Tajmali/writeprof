import { notFound } from "next/navigation";
import { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { ArrowLeft, Clock, User, Calendar, Tag, Share2, BookOpen } from "lucide-react";

interface Props {
  params: { slug: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const post = await prisma.blogPost.findFirst({
    where: { slug: params.slug, isPublished: true },
  });

  if (!post) return { title: "Post Not Found | WriteProf" };

  const url = `https://writeprof.com/blog/${post.slug}`;
  const ogImage = post.coverImage || "https://writeprof.com/og-image.png";

  return {
    title: post.title,
    description: post.excerpt || post.title,
    alternates: { canonical: url },
    keywords: post.tags?.length ? post.tags : undefined,
    authors: [{ name: post.author || "WriteProf Team" }],
    openGraph: {
      title: post.title,
      description: post.excerpt || "",
      url,
      type: "article",
      publishedTime: post.createdAt.toISOString(),
      modifiedTime: post.updatedAt.toISOString(),
      authors: [post.author || "WriteProf Team"],
      section: post.category || "Writing",
      tags: post.tags || [],
      images: [{ url: ogImage, width: 1200, height: 630, alt: post.title }],
    },
  };
}

export default async function BlogPostPage({ params }: Props) {
  const post = await prisma.blogPost.findFirst({
    where: { slug: params.slug, isPublished: true },
  });

  if (!post) notFound();

  const relatedPosts = await prisma.blogPost.findMany({
    where: {
      isPublished: true,
      slug: { not: params.slug },
      category: post.category,
    },
    take: 3,
    select: { id: true, title: true, slug: true, coverImage: true, createdAt: true, readTime: true },
  });

  const shareUrl = `https://writeprof.com/blog/${post.slug}`;

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.excerpt || post.title,
    image: post.coverImage || "https://writeprof.com/og-image.png",
    author: { "@type": "Person", name: post.author || "WriteProf Team" },
    publisher: {
      "@type": "Organization",
      name: "WriteProf",
      logo: { "@type": "ImageObject", url: "https://writeprof.com/logo.png" },
    },
    datePublished: post.createdAt.toISOString(),
    dateModified: post.updatedAt.toISOString(),
    mainEntityOfPage: { "@type": "WebPage", "@id": shareUrl },
    keywords: post.tags?.join(", ") || "",
    articleSection: post.category || "Writing",
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "https://writeprof.com" },
      { "@type": "ListItem", position: 2, name: "Blog", item: "https://writeprof.com/blog" },
      { "@type": "ListItem", position: 3, name: post.title, item: shareUrl },
    ],
  };

  return (
    <div className="min-h-screen bg-[#0a0f1e]">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      {/* Nav */}
      <nav className="sticky top-0 z-40 border-b border-white/10 backdrop-blur-xl bg-[#0a0f1e]/80">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <Link href="/blog" className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm">Back to Blog</span>
          </Link>
          <Link href="/" className="text-lg font-bold gradient-text">WriteProf</Link>
        </div>
      </nav>

      <article className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
        {/* Category + Meta */}
        <div className="mb-6">
          {post.category && (
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-brand-500/20 text-brand-400 border border-brand-500/30">
              {post.category}
            </span>
          )}
        </div>

        {/* Title */}
        <h1 className="text-3xl sm:text-4xl font-bold text-white leading-tight mb-6">{post.title}</h1>

        {/* Meta */}
        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400 mb-8 pb-8 border-b border-white/10">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-brand-500/20 flex items-center justify-center text-xs font-bold text-brand-400">
              {(post.author || "W")[0]}
            </div>
            <span>{post.author || "WriteProf Team"}</span>
          </div>
          <div className="flex items-center gap-1">
            <Calendar className="w-4 h-4" />
            <span>{new Date(post.createdAt).toLocaleDateString("en-US", {
              year: "numeric", month: "long", day: "numeric"
            })}</span>
          </div>
          {post.readTime && (
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              <span>{post.readTime} min read</span>
            </div>
          )}
        </div>

        {/* Cover Image */}
        {post.coverImage && (
          <div className="mb-8 rounded-2xl overflow-hidden">
            <img
              src={post.coverImage}
              alt={post.title}
              className="w-full h-64 sm:h-80 object-cover"
            />
          </div>
        )}

        {/* Excerpt */}
        {post.excerpt && (
          <p className="text-lg text-gray-300 leading-relaxed mb-8 font-medium italic border-l-2 border-brand-500 pl-4">
            {post.excerpt}
          </p>
        )}

        {/* Content */}
        <div
          className="prose prose-invert prose-lg max-w-none
            prose-headings:text-white prose-headings:font-bold
            prose-p:text-gray-300 prose-p:leading-relaxed
            prose-a:text-brand-400 prose-a:no-underline hover:prose-a:text-brand-300
            prose-strong:text-white
            prose-code:text-brand-300 prose-code:bg-white/10 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded
            prose-pre:bg-white/5 prose-pre:border prose-pre:border-white/10
            prose-blockquote:border-l-brand-500 prose-blockquote:text-gray-300
            prose-ul:text-gray-300 prose-ol:text-gray-300
            prose-li:text-gray-300"
          dangerouslySetInnerHTML={{ __html: formatContent(post.content) }}
        />

        {/* Tags */}
        {post.tags && post.tags.length > 0 && (
          <div className="mt-10 pt-6 border-t border-white/10">
            <div className="flex items-center gap-2 flex-wrap">
              <Tag className="w-4 h-4 text-gray-500" />
              {post.tags.map((tag: string) => (
                <span key={tag} className="px-2.5 py-1 rounded-lg text-xs bg-white/5 border border-white/10 text-gray-400">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Author Card */}
        <div className="mt-10 glass-card p-5">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-full bg-brand-500/20 flex items-center justify-center text-xl font-bold text-brand-400 shrink-0">
              {(post.author || "W")[0]}
            </div>
            <div>
              <p className="font-semibold text-white">{post.author || "WriteProf Team"}</p>
              <p className="text-sm text-gray-400 mt-1">
                WriteProf expert contributor sharing insights on academic writing, career growth, and platform updates.
              </p>
            </div>
          </div>
        </div>
      </article>

      {/* Related Posts */}
      {relatedPosts.length > 0 && (
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12 border-t border-white/10">
          <h2 className="text-2xl font-bold text-white mb-6">Related Articles</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {relatedPosts.map(rp => (
              <Link key={rp.id} href={`/blog/${rp.slug}`}
                className="glass-card overflow-hidden hover:border-brand-500/30 transition-all group">
                {rp.coverImage && (
                  <div className="h-40 overflow-hidden">
                    <img src={rp.coverImage} alt={rp.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  </div>
                )}
                <div className="p-4">
                  <h3 className="font-semibold text-white text-sm leading-snug group-hover:text-brand-400 transition-colors">{rp.title}</h3>
                  <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                    <Clock className="w-3 h-3" />
                    {rp.readTime || 5} min read
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* CTA */}
      <div className="bg-gradient-to-r from-brand-600/20 to-brand-400/10 border-t border-brand-500/20 py-12">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-2xl font-bold text-white mb-3">Need Expert Writing Help?</h2>
          <p className="text-gray-400 mb-6">Get your assignment done in as little as 1 hour by professional writers.</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/signup" className="btn-primary px-6 py-3">Place an Order →</Link>
            <Link href="/writer/apply" className="btn-secondary px-6 py-3">Become a Writer</Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function formatContent(content: string): string {
  // Simple markdown-like conversion for stored content
  return content
    .replace(/^# (.+)$/gm, "<h1>$1</h1>")
    .replace(/^## (.+)$/gm, "<h2>$1</h2>")
    .replace(/^### (.+)$/gm, "<h3>$1</h3>")
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    .replace(/`(.+?)`/g, "<code>$1</code>")
    .replace(/\n\n/g, "</p><p>")
    .replace(/^/gm, "")
    .replace(/^<p>/, "<p>")
    || `<p>${content}</p>`;
}
