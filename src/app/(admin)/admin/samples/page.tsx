"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Plus, Eye, Edit, Trash2, Search, BookOpen, Globe, EyeOff } from "lucide-react";
import toast from "react-hot-toast";

interface Sample {
  id: string;
  slug: string;
  title: string;
  subject: string;
  orderType: string;
  educationLevel: string;
  pages: number;
  isPublished: boolean;
  views: number;
  createdAt: string;
  attachments: { id: string; name: string }[];
}

export default function AdminSamplesPage() {
  const [samples, setSamples] = useState<Sample[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const fetchSamples = async () => {
    try {
      const res = await fetch("/api/admin/samples");
      const data = await res.json();
      if (data.success) setSamples(data.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchSamples(); }, []);

  const togglePublish = async (id: string, current: boolean) => {
    const sample = samples.find((s) => s.id === id);
    if (!sample) return;
    const res = await fetch(`/api/admin/samples/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...sample, isPublished: !current }),
    });
    if (res.ok) {
      setSamples((prev) => prev.map((s) => s.id === id ? { ...s, isPublished: !current } : s));
      toast.success(!current ? "Published!" : "Unpublished");
    }
  };

  const deleteSample = async (id: string) => {
    if (!confirm("Delete this sample assignment? This cannot be undone.")) return;
    const res = await fetch(`/api/admin/samples/${id}`, { method: "DELETE" });
    if (res.ok) {
      setSamples((prev) => prev.filter((s) => s.id !== id));
      toast.success("Deleted");
    }
  };

  const filtered = samples.filter((s) =>
    s.title.toLowerCase().includes(search.toLowerCase()) ||
    s.subject.toLowerCase().includes(search.toLowerCase()) ||
    s.orderType.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Sample Assignments</h1>
          <p className="text-slate-400 text-sm mt-1">
            Post real assignment instructions as public SEO pages. Each one is a Google landing page.
          </p>
        </div>
        <Link href="/admin/samples/new" className="btn-primary flex items-center gap-2 px-5 py-2.5 text-sm">
          <Plus className="w-4 h-4" />
          New Sample
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Total", value: samples.length, icon: BookOpen, color: "text-brand-400" },
          { label: "Published", value: samples.filter((s) => s.isPublished).length, icon: Globe, color: "text-green-400" },
          { label: "Total Views", value: samples.reduce((a, s) => a + s.views, 0), icon: Eye, color: "text-purple-400" },
        ].map((stat) => (
          <div key={stat.label} className="glass-card p-4 flex items-center gap-3">
            <stat.icon className={`w-8 h-8 ${stat.color}`} />
            <div>
              <p className="text-2xl font-bold text-white">{stat.value.toLocaleString()}</p>
              <p className="text-slate-400 text-xs">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by title, subject, or type…"
          className="input-field pl-10 w-full max-w-md"
        />
      </div>

      {/* Table */}
      {loading ? (
        <div className="text-slate-400 text-center py-12">Loading…</div>
      ) : filtered.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <BookOpen className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <p className="text-slate-400">No sample assignments yet.</p>
          <Link href="/admin/samples/new" className="btn-primary inline-flex items-center gap-2 mt-4 px-5 py-2.5 text-sm">
            <Plus className="w-4 h-4" /> Add Your First Sample
          </Link>
        </div>
      ) : (
        <div className="glass-card overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wide p-4">Assignment</th>
                <th className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wide p-4">Type / Level</th>
                <th className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wide p-4">Pages</th>
                <th className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wide p-4">Files</th>
                <th className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wide p-4">Views</th>
                <th className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wide p-4">Status</th>
                <th className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wide p-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((sample) => (
                <tr key={sample.id} className="border-b border-white/5 hover:bg-white/3 transition-colors">
                  <td className="p-4">
                    <p className="text-white font-medium text-sm leading-snug max-w-xs">{sample.title}</p>
                    <p className="text-slate-500 text-xs mt-0.5">{sample.subject}</p>
                  </td>
                  <td className="p-4">
                    <p className="text-slate-300 text-sm">{sample.orderType}</p>
                    <p className="text-slate-500 text-xs">{sample.educationLevel}</p>
                  </td>
                  <td className="p-4 text-slate-300 text-sm">{sample.pages}p</td>
                  <td className="p-4 text-slate-400 text-sm">{sample.attachments.length}</td>
                  <td className="p-4 text-slate-400 text-sm">{sample.views}</td>
                  <td className="p-4">
                    <button
                      onClick={() => togglePublish(sample.id, sample.isPublished)}
                      className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                        sample.isPublished
                          ? "bg-green-500/20 text-green-400 border border-green-500/30"
                          : "bg-slate-700 text-slate-400 border border-white/10"
                      }`}
                    >
                      {sample.isPublished ? "Published" : "Draft"}
                    </button>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-1">
                      {sample.isPublished && (
                        <a
                          href={`/samples/${sample.slug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 text-slate-400 hover:text-brand-400 transition-colors"
                          title="View public page"
                        >
                          <Eye className="w-4 h-4" />
                        </a>
                      )}
                      <Link
                        href={`/admin/samples/${sample.id}`}
                        className="p-1.5 text-slate-400 hover:text-white transition-colors"
                        title="Edit"
                      >
                        <Edit className="w-4 h-4" />
                      </Link>
                      <button
                        onClick={() => deleteSample(sample.id)}
                        className="p-1.5 text-slate-400 hover:text-red-400 transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
