import { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";
import { getAllServiceSlugs } from "./services/[slug]/data";
import { getAllSubjectSlugs } from "./subjects/[slug]/data";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://writeprof.com";

  // ── Static indexable pages only (never include noindex pages) ──────────────
  // Excluded: /login, /forgot-password, /reset-password, /verify-email (all noindex)
  // Excluded: /dashboard, /writer-dashboard, /admin (auth-gated + noindex)
  const staticPages: MetadataRoute.Sitemap = [
    { url: baseUrl,                       lastModified: new Date(), changeFrequency: "daily",   priority: 1.0 },
    { url: `${baseUrl}/services`,         lastModified: new Date(), changeFrequency: "monthly", priority: 0.95 },
    ...getAllServiceSlugs().map((slug) => ({
      url: `${baseUrl}/services/${slug}`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.9,
    })),
    { url: `${baseUrl}/signup`,           lastModified: new Date(), changeFrequency: "monthly", priority: 0.9 },
    { url: `${baseUrl}/blog`,             lastModified: new Date(), changeFrequency: "daily",   priority: 0.9 },
    { url: `${baseUrl}/samples`,          lastModified: new Date(), changeFrequency: "daily",   priority: 0.9 },
    { url: `${baseUrl}/subjects`,         lastModified: new Date(), changeFrequency: "monthly", priority: 0.9 },
    ...getAllSubjectSlugs().map((slug) => ({
      url: `${baseUrl}/subjects/${slug}`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.88,
    })),
    { url: `${baseUrl}/writer/apply`,     lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
    { url: `${baseUrl}/about`,            lastModified: new Date(), changeFrequency: "monthly", priority: 0.6 },
    { url: `${baseUrl}/contact`,          lastModified: new Date(), changeFrequency: "monthly", priority: 0.6 },
    { url: `${baseUrl}/help`,             lastModified: new Date(), changeFrequency: "monthly", priority: 0.6 },
    { url: `${baseUrl}/privacy`,          lastModified: new Date(), changeFrequency: "yearly",  priority: 0.3 },
    { url: `${baseUrl}/terms`,            lastModified: new Date(), changeFrequency: "yearly",  priority: 0.3 },
    { url: `${baseUrl}/refund`,           lastModified: new Date(), changeFrequency: "yearly",  priority: 0.3 },
  ];

  let blogPages: MetadataRoute.Sitemap = [];
  let samplePages: MetadataRoute.Sitemap = [];

  try {
    const posts = await prisma.blogPost.findMany({
      where: { isPublished: true },
      select: { slug: true, updatedAt: true },
      orderBy: { createdAt: "desc" },
    });
    blogPages = posts.map((post) => ({
      url: `${baseUrl}/blog/${post.slug}`,
      lastModified: post.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    }));

    const samples = await prisma.sampleOrder.findMany({
      where: { isPublished: true },
      select: { slug: true, updatedAt: true },
      orderBy: { createdAt: "desc" },
    });
    samplePages = samples.map((s) => ({
      url: `${baseUrl}/samples/${s.slug}`,
      lastModified: s.updatedAt,
      changeFrequency: "monthly" as const,
      priority: 0.75,
    }));
  } catch {
    // DB unavailable during build — skip dynamic pages
  }

  return [...staticPages, ...blogPages, ...samplePages];
}
