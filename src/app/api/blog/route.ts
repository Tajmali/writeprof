import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim()
    + "-" + Date.now().toString(36);
}

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const page = parseInt(url.searchParams.get("page") || "1");
    const limit = parseInt(url.searchParams.get("limit") || "10");
    const search = url.searchParams.get("search") || "";
    const category = url.searchParams.get("category") || "";
    const isAdmin = url.searchParams.get("admin") === "true";
    const skip = (page - 1) * limit;

    // Admin mode: show all posts (requires auth)
    let showAll = false;
    if (isAdmin) {
      const token = req.cookies.get("wp_token")?.value;
      if (token) {
        const payload = await verifyToken(token);
        if (payload?.role === "ADMIN") showAll = true;
      }
    }

    const where: Record<string, unknown> = {};
    if (!showAll) where.isPublished = true;
    if (search) where.OR = [
      { title: { contains: search, mode: "insensitive" } },
      { excerpt: { contains: search, mode: "insensitive" } },
    ];
    if (category) where.category = category;

    const [posts, total] = await Promise.all([
      prisma.blogPost.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.blogPost.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: { posts },
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (err) {
    return NextResponse.json({ success: false, error: "Server error" }, { status: 500 });
  }
}

const createSchema = z.object({
  title: z.string().min(2),
  excerpt: z.string().optional(),
  content: z.string().min(1),
  category: z.string().optional(),
  coverImage: z.string().optional(),
  readTime: z.number().optional(),
  tags: z.array(z.string()).optional(),
  isPublished: z.boolean().default(false),
});

export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get("wp_token")?.value;
    if (!token) return NextResponse.json({ success: false, error: "Not authenticated" }, { status: 401 });
    const payload = await verifyToken(token);
    if (!payload || payload.role !== "ADMIN") return NextResponse.json({ success: false, error: "Admin access required" }, { status: 403 });

    const body = await req.json();
    const data = createSchema.parse(body);

    // Get admin name for author field
    const adminUser = await prisma.user.findUnique({ where: { id: payload.userId }, select: { name: true } });

    const post = await prisma.blogPost.create({
      data: {
        title: data.title,
        slug: generateSlug(data.title),
        excerpt: data.excerpt || "",
        content: data.content,
        category: data.category || "General",
        coverImage: data.coverImage || null,
        readTime: data.readTime || 5,
        tags: data.tags || [],
        isPublished: data.isPublished,
        author: adminUser?.name || "WriteProf Team",
      },
    });

    return NextResponse.json({ success: true, data: { post } });
  } catch (err) {
    if (err instanceof z.ZodError) return NextResponse.json({ success: false, error: err.errors[0].message }, { status: 400 });
    return NextResponse.json({ success: false, error: "Server error" }, { status: 500 });
  }
}

const updateSchema = z.object({
  id: z.string(),
  title: z.string().min(2).optional(),
  excerpt: z.string().optional(),
  content: z.string().optional(),
  category: z.string().optional(),
  coverImage: z.string().optional(),
  readTime: z.number().optional(),
  tags: z.array(z.string()).optional(),
  isPublished: z.boolean().optional(),
});

export async function PATCH(req: NextRequest) {
  try {
    const token = req.cookies.get("wp_token")?.value;
    if (!token) return NextResponse.json({ success: false, error: "Not authenticated" }, { status: 401 });
    const payload = await verifyToken(token);
    if (!payload || payload.role !== "ADMIN") return NextResponse.json({ success: false, error: "Admin access required" }, { status: 403 });

    const body = await req.json();
    const { id, isPublished, ...updates } = updateSchema.parse(body);

    const post = await prisma.blogPost.update({
      where: { id },
      data: {
        ...(updates.title && { title: updates.title, slug: generateSlug(updates.title) }),
        ...(updates.excerpt !== undefined && { excerpt: updates.excerpt || "" }),
        ...(updates.content && { content: updates.content }),
        ...(updates.category && { category: updates.category }),
        ...(updates.coverImage !== undefined && { coverImage: updates.coverImage || null }),
        ...(updates.readTime !== undefined && { readTime: updates.readTime }),
        ...(updates.tags && { tags: updates.tags }),
        ...(isPublished !== undefined && { isPublished }),
      },
    });

    return NextResponse.json({ success: true, data: { post } });
  } catch (err) {
    if (err instanceof z.ZodError) return NextResponse.json({ success: false, error: err.errors[0].message }, { status: 400 });
    return NextResponse.json({ success: false, error: "Server error" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const token = req.cookies.get("wp_token")?.value;
    if (!token) return NextResponse.json({ success: false, error: "Not authenticated" }, { status: 401 });
    const payload = await verifyToken(token);
    if (!payload || payload.role !== "ADMIN") return NextResponse.json({ success: false, error: "Admin access required" }, { status: 403 });

    const url = new URL(req.url);
    const id = url.searchParams.get("id");
    if (!id) return NextResponse.json({ success: false, error: "Post ID required" }, { status: 400 });

    await prisma.blogPost.delete({ where: { id } });
    return NextResponse.json({ success: true, data: { deleted: true } });
  } catch (err) {
    return NextResponse.json({ success: false, error: "Server error" }, { status: 500 });
  }
}
