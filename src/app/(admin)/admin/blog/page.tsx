"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import {
  BookOpen, Plus, Search, Edit2, Trash2, Eye, EyeOff,
  Loader2, Calendar, Clock, Tag, X, Save
} from "lucide-react";
import toast from "react-hot-toast";

interface BlogPost {
  id: string; title: string; slug: string; excerpt: string;
  category: string; isPublished: boolean; readTime: number;
  coverImage: string | null; createdAt: string;
  author: string;
}

const BLOG_CATEGORIES = [
  "Writing Tips", "Academic Help", "Career Advice", "Platform Updates",
  "Success Stories", "Industry News", "Tutorials",
];

export default function AdminBlogPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const [form, setForm] = useState({
    title: "", excerpt: "", content: "", category: "", coverImage: "", readTime: 5,
  });

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

  const openEdit = (post: BlogPost) => {
    setEditingPost(post);
    setForm({
      title: post.title,
      excerpt: post.excerpt || "",
      content: "",
      category: post.category || "",
      coverImage: post.coverImage || "",
      readTime: post.readTime || 5,
    });
    setShowForm(true);
  };

  const openCreate = () => {
    setEditingPost(null);
    setForm({ title: "", excerpt: "", content: "", category: "", coverImage: "", readTime: 5 });
    setShowForm(true);
  };

  return (
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
              <input
                value={form.title}
                onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
                placeholder="Post title..."
                className="input-field w-full text-lg font-semibold"
              />
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
              <input
                value={form.coverImage}
                onChange={e => setForm(p => ({ ...p, coverImage: e.target.value }))}
                placeholder="Cover image URL..."
                className="input-field w-full"
              />
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
  );
}
