"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import {
  BookOpen, Plus, Search, Edit2, Trash2, Eye, EyeOff,
  Loader2, Calendar, Clock, Tag, X, Save, ImagePlus, XCircle, Maximize2
} from "lucide-react";
import toast from "react-hot-toast";

interface BlogPost {
  id: string; title: string; slug: string; excerpt: string;
  category: string; isPublished: boolean; readTime: number;
  coverImage: string | null; createdAt: string;
  author: string;
}

const BLOG_CATEGORIES = [
  "Writing Tips", "Academic Help", "Academic Tips", "Career Advice",
  "Platform Updates", "Success Stories", "Industry News", "Tutorials",
  "Urgent Writing Help", "Deadline Management", "Copywriting", "Productivity",
];

export default function AdminBlogPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const [form, setForm] = useState({
    title: "", excerpt: "", content: "", category: "", coverImage: "", readTime: 5,
  });
  const [imageUploading, setImageUploading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const { data: posts, isLoading } = useQuery({
    queryKey: ["admin-blog", search],
    queryFn: async () => {
      const params = new URLSearchParams({ limit: "50", ...(search && { search }) });
      const res = await fetch(`/api/blog?${params}&admin=true`);
      const json = await res.json();
      if (!json.success) return [];
      return json.data.posts as BlogPost[];
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (data: typeof form & { id?: string; isPublished?: boolean }) => {
      const method = data.id ? "PATCH" : "POST";
      const res = await fetch("/api/blog", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      return json.data;
    },
    onSuccess: () => {
      toast.success(editingPost ? "Post updated!" : "Post created!");
      queryClient.invalidateQueries({ queryKey: ["admin-blog"] });
      setShowForm(false);
      setEditingPost(null);
      setForm({ title: "", excerpt: "", content: "", category: "", coverImage: "", readTime: 5 });
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const togglePublishMutation = useMutation({
    mutationFn: async ({ id, isPublished }: { id: string; isPublished: boolean }) => {
      const res = await fetch("/api/blog", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, isPublished }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      return json.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-blog"] });
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/blog?id=${id}`, { method: "DELETE" });
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      return json.data;
    },
    onSuccess: () => {
      toast.success("Post deleted");
      queryClient.invalidateQueries({ queryKey: ["admin-blog"] });
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const openEdit = async (post: BlogPost) => {
    setEditingPost(post);
    setShowForm(true);
    // Fetch full post content from API (list view omits content field)
    try {
      const res = await fetch(`/api/blog/${post.id}`);
      const json = await res.json();
      const fullPost = json.success ? json.data.post : post;
      setForm({
        title: fullPost.title ?? post.title,
        excerpt: fullPost.excerpt ?? post.excerpt ?? "",
        content: fullPost.content ?? "",
        category: fullPost.category ?? post.category ?? "",
        coverImage: fullPost.coverImage ?? post.coverImage ?? "",
        readTime: fullPost.readTime ?? post.readTime ?? 5,
      });
    } catch {
      setForm({
        title: post.title,
        excerpt: post.excerpt || "",
        content: "",
        category: post.category || "",
        coverImage: post.coverImage || "",
        readTime: post.readTime || 5,
      });
    }
  };

  const openCreate = () => {
    setEditingPost(null);
    setForm({ title: "", excerpt: "", content: "", category: "", coverImage: "", readTime: 5 });
    setShowForm(true);
  };

  return (
    <>
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-brand-400" /> Blog Management
          </h1>
          <p className="text-gray-400 mt-1">{posts?.length || 0} posts</p>
        </div>
        <button onClick={openCreate} className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" /> New Post
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search posts..."
          className="input-field pl-10 w-full"
        />
      </div>

      {/* Blog Form */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="glass-card p-5 border border-brand-500/30"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-white">{editingPost ? "Edit Post" : "New Blog Post"}</h3>
              <button onClick={() => setShowForm(false)} className="p-1.5 rounded-lg hover:bg-white/10 text-gray-400">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-4">
              {/* Title */}
              <input
                value={form.title}
                onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
                placeholder="Post title..."
                className="input-field w-full text-lg font-semibold"
              />

              {/* Cover image uploader — sits between title and content */}
              <div>
                <p className="text-xs text-gray-400 mb-2">Cover Image</p>
                {form.coverImage ? (
                  <div className="relative group">
                    <img
                      src={form.coverImage}
                      alt="Cover"
                      className="w-full h-52 object-cover rounded-xl border border-white/10"
                    />
                    <button
                      type="button"
                      onClick={() => setForm(p => ({ ...p, coverImage: "" }))}
                      className="absolute top-2 right-2 p-1 rounded-full bg-black/60 text-red-400 hover:text-red-300 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <XCircle className="w-5 h-5" />
                    </button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center w-full h-36 border-2 border-dashed border-white/20 rounded-xl cursor-pointer hover:border-brand-500/50 hover:bg-white/3 transition-all">
                    {imageUploading ? (
                      <Loader2 className="w-8 h-8 text-brand-400 animate-spin" />
                    ) : (
                      <>
                        <ImagePlus className="w-8 h-8 text-gray-500 mb-2" />
                        <span className="text-sm text-gray-400">Click to upload cover image</span>
                        <span className="text-xs text-gray-600 mt-1">JPG, PNG, WebP — max 5MB</span>
                      </>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      disabled={imageUploading}
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        if (file.size > 5 * 1024 * 1024) { toast.error("Image must be under 5MB"); return; }
                        setImageUploading(true);
                        try {
                          const fd = new FormData();
                          fd.append("file", file);
                          const res = await fetch("/api/upload", { method: "POST", body: fd });
                          const json = await res.json();
                          if (!json.success) throw new Error(json.error);
                          setForm(p => ({ ...p, coverImage: json.data.url }));
                          toast.success("Image uploaded!");
                        } catch (err: any) {
                          toast.error(err.message || "Upload failed");
                        } finally {
                          setImageUploading(false);
                          e.target.value = "";
                        }
                      }}
                    />
                  </label>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <select
                  value={form.category}
                  onChange={e => setForm(p => ({ ...p, category: e.target.value }))}
                  className="input-field w-full"
                >
                  <option value="">Select category</option>
                  {BLOG_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="number"
                    value={form.readTime}
                    onChange={e => setForm(p => ({ ...p, readTime: Number(e.target.value) }))}
                    placeholder="Read time (min)"
                    className="input-field pl-9 w-full"
                    min="1"
                  />
                </div>
              </div>
              <textarea
                value={form.excerpt}
                onChange={e => setForm(p => ({ ...p, excerpt: e.target.value }))}
                placeholder="Brief excerpt..."
                rows={2}
                className="input-field w-full resize-none"
              />
              <textarea
                value={form.content}
                onChange={e => setForm(p => ({ ...p, content: e.target.value }))}
                placeholder="Write your blog post content here... (Markdown supported)"
                rows={12}
                className="input-field w-full resize-none font-mono text-sm"
              />
              <div className="flex gap-2">
                <button
                  onClick={() => saveMutation.mutate({ ...form, id: editingPost?.id, isPublished: false })}
                  disabled={saveMutation.isPending || !form.title}
                  className="btn-secondary flex-1 flex items-center justify-center gap-2"
                >
                  <Save className="w-4 h-4" /> Save Draft
                </button>
                <button
                  onClick={() => setShowPreview(true)}
                  disabled={!form.title}
                  className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl border border-white/20 text-gray-300 hover:bg-white/5 transition-all disabled:opacity-40"
                >
                  <Maximize2 className="w-4 h-4" /> Preview
                </button>
                <button
                  onClick={() => saveMutation.mutate({ ...form, id: editingPost?.id, isPublished: true })}
                  disabled={saveMutation.isPending || !form.title}
                  className="btn-primary flex-1 flex items-center justify-center gap-2"
                >
                  {saveMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Eye className="w-4 h-4" />}
                  Publish
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Posts List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 text-brand-400 animate-spin" />
        </div>
      ) : posts?.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <BookOpen className="w-12 h-12 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400">No blog posts yet</p>
          <button onClick={openCreate} className="btn-primary mt-4 inline-flex items-center gap-2">
            <Plus className="w-4 h-4" /> Create First Post
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {posts?.map((post, i) => (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className="glass-card p-4"
            >
              <div className="flex items-start gap-4">
                {post.coverImage && (
                  <img src={post.coverImage} alt={post.title}
                    className="w-16 h-16 rounded-xl object-cover shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <h3 className="font-semibold text-white truncate">{post.title}</h3>
                    <span className={`px-1.5 py-0.5 rounded text-xs font-medium ${
                      post.isPublished ? "bg-green-500/20 text-green-400" : "bg-yellow-500/20 text-yellow-400"
                    }`}>
                      {post.isPublished ? "Published" : "Draft"}
                    </span>
                  </div>
                  {post.excerpt && <p className="text-xs text-gray-400 line-clamp-1">{post.excerpt}</p>}
                  <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                    {post.category && (
                      <span className="flex items-center gap-1"><Tag className="w-3 h-3" />{post.category}</span>
                    )}
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(post.createdAt).toLocaleDateString()}
                    </span>
                    {post.readTime && (
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{post.readTime} min</span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => togglePublishMutation.mutate({ id: post.id, isPublished: !post.isPublished })}
                    className={`p-1.5 rounded-lg hover:bg-white/10 transition-colors ${post.isPublished ? "text-yellow-400" : "text-green-400"}`}
                    title={post.isPublished ? "Unpublish" : "Publish"}
                  >
                    {post.isPublished ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                  <button onClick={() => openEdit(post)}
                    className="p-1.5 rounded-lg hover:bg-white/10 text-brand-400">
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      if (confirm("Delete this post?")) deleteMutation.mutate(post.id);
                    }}
                    className="p-1.5 rounded-lg hover:bg-white/10 text-red-400"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>

    {/* Preview Modal */}
    <AnimatePresence>
      {showPreview && (
        <BlogPreviewModal form={form} onClose={() => setShowPreview(false)} />
      )}
    </AnimatePresence>
    </>
  );
}

// ─── Blog Preview Modal ───────────────────────────────────────────────────────
function BlogPreviewModal({
  form, onClose,
}: {
  form: { title: string; excerpt: string; content: string; category: string; coverImage: string; readTime: number };
  onClose: () => void;
}) {
  const today = new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-[#0a0f1e] overflow-y-auto"
    >
      {/* Preview toolbar */}
      <div className="sticky top-0 z-10 border-b border-white/10 backdrop-blur-xl bg-[#0a0f1e]/90 px-4 py-3 flex items-center justify-between">
        <span className="text-sm font-semibold text-brand-400 flex items-center gap-2">
          <Maximize2 className="w-4 h-4" /> Preview — how readers will see this post
        </span>
        <button onClick={onClose} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/20 text-gray-300 hover:bg-white/5 text-sm transition-all">
          <X className="w-4 h-4" /> Close Preview
        </button>
      </div>

      <article className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
        {form.category && (
          <div className="mb-6">
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-brand-500/20 text-brand-400 border border-brand-500/30">
              {form.category}
            </span>
          </div>
        )}

        <h1 className="text-3xl sm:text-4xl font-bold text-white leading-tight mb-6">
          {form.title || <span className="text-gray-600 italic">Untitled post</span>}
        </h1>

        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400 mb-8 pb-8 border-b border-white/10">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-brand-500/20 flex items-center justify-center text-xs font-bold text-brand-400">W</div>
            <span>WriteProf Team</span>
          </div>
          <div className="flex items-center gap-1"><Calendar className="w-4 h-4" /><span>{today}</span></div>
          {form.readTime > 0 && (
            <div className="flex items-center gap-1"><Clock className="w-4 h-4" /><span>{form.readTime} min read</span></div>
          )}
        </div>

        {form.coverImage && (
          <div className="mb-8 rounded-2xl overflow-hidden">
            <img src={form.coverImage} alt={form.title} className="w-full h-64 sm:h-80 object-cover" />
          </div>
        )}

        {form.excerpt && (
          <p className="text-lg text-gray-300 leading-relaxed mb-8 font-medium italic border-l-2 border-brand-500 pl-4">
            {form.excerpt}
          </p>
        )}

        {form.content ? (
          <div
            className="prose prose-invert prose-lg max-w-none
              prose-headings:text-white prose-headings:font-bold
              prose-p:text-gray-300 prose-p:leading-relaxed
              prose-a:text-brand-400 prose-strong:text-white
              prose-code:text-brand-300 prose-code:bg-white/10 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded
              prose-pre:bg-white/5 prose-pre:border prose-pre:border-white/10
              prose-blockquote:border-l-brand-500 prose-blockquote:text-gray-300
              prose-ul:text-gray-300 prose-ol:text-gray-300 prose-li:text-gray-300"
            dangerouslySetInnerHTML={{ __html: formatPreviewContent(form.content) }}
          />
        ) : (
          <p className="text-gray-600 italic">No content written yet...</p>
        )}
      </article>

      <div className="bg-gradient-to-r from-brand-600/20 to-brand-400/10 border-t border-brand-500/20 py-12">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-2xl font-bold text-white mb-3">Need Expert Writing Help?</h2>
          <p className="text-gray-400">Get your assignment done in as little as 1 hour by professional writers.</p>
        </div>
      </div>
    </motion.div>
  );
}

function formatPreviewContent(content: string): string {
  // First convert markdown-like syntax to HTML
  const raw = content
    .replace(/^#### (.+)$/gm, "<h4>$1</h4>")
    .replace(/^### (.+)$/gm, "<h3>$1</h3>")
    .replace(/^## (.+)$/gm, "<h2>$1</h2>")
    .replace(/^# (.+)$/gm, "<h1>$1</h1>")
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    .replace(/`(.+?)`/g, "<code>$1</code>")
    .replace(/^> (.+)$/gm, "<blockquote>$1</blockquote>")
    .replace(/^- (.+)$/gm, "<li>$1</li>")
    .replace(/\n\n/g, "</p><p>")
    .replace(/^(?!<[a-z])(.+)$/gm, "<p>$1</p>")
    .replace(/<p><\/p>/g, "");

  // Sanitize to prevent XSS in the admin preview (same rules as the public blog)
  // We import dynamically to avoid bundling sanitize-html in client JS unnecessarily
  // Since this runs client-side, use a simple tag-stripper for truly dangerous content
  return raw
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/\bon\w+\s*=/gi, "data-removed=")
    .replace(/<iframe[\s\S]*?<\/iframe>/gi, "")
    .replace(/<object[\s\S]*?<\/object>/gi, "")
    .replace(/<embed[^>]*>/gi, "")
    .replace(/javascript:/gi, "");
}
