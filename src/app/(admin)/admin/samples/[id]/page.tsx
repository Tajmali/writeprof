"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Plus, Trash2, Save, Eye, Paperclip, Loader2 } from "lucide-react";
import toast from "react-hot-toast";

const ORDER_TYPES = ["Essay", "Research Paper", "Dissertation", "Case Study", "Term Paper", "Coursework", "Report", "Business Plan", "Annotated Bibliography", "Literature Review", "Thesis", "Other"];
const EDUCATION_LEVELS = ["High School", "College", "Undergraduate", "Masters", "PhD", "Professional"];
const CITATION_STYLES = ["APA 7th edition", "APA 6th edition", "MLA 9th edition", "MLA 8th edition", "Chicago", "Harvard", "Vancouver", "IEEE", "Turabian", "None / Not specified"];
const LANGUAGES = ["English (US)", "English (UK)", "English (AU)", "Spanish", "French", "German"];

interface Attachment { name: string; url: string; mimeType: string; }

export default function EditSamplePage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [newAttachment, setNewAttachment] = useState({ name: "", url: "" });
  const [form, setForm] = useState({
    title: "", subject: "", orderType: "Essay", educationLevel: "College",
    citationStyle: "APA 7th edition", pages: "1", wordCount: "275",
    sources: "", language: "English (US)", description: "", tags: "", isPublished: false,
  });

  useEffect(() => {
    fetch(`/api/admin/samples/${id}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.success) {
          const s = data.data;
          setForm({
            title: s.title, subject: s.subject, orderType: s.orderType,
            educationLevel: s.educationLevel, citationStyle: s.citationStyle || "APA 7th edition",
            pages: String(s.pages), wordCount: String(s.wordCount),
            sources: s.sources ? String(s.sources) : "", language: s.language,
            description: s.description, tags: s.tags.join(", "), isPublished: s.isPublished,
          });
          setAttachments(s.attachments.map((a: Attachment) => ({ name: a.name, url: a.url, mimeType: a.mimeType })));
        }
      })
      .finally(() => setLoading(false));
  }, [id]);

  const update = (field: string, value: string | boolean) => setForm((prev) => ({ ...prev, [field]: value }));

  const handlePagesChange = (val: string) => {
    update("pages", val);
    const p = parseInt(val);
    if (!isNaN(p)) update("wordCount", String(p * 275));
  };

  const addAttachment = () => {
    if (!newAttachment.name || !newAttachment.url) return;
    const ext = newAttachment.url.split(".").pop()?.toLowerCase();
    const mimeType = ext === "pdf" ? "application/pdf" : ext === "docx" ? "application/vnd.openxmlformats-officedocument.wordprocessingml.document" : "application/octet-stream";
    setAttachments((prev) => [...prev, { ...newAttachment, mimeType }]);
    setNewAttachment({ name: "", url: "" });
  };

  const handleSave = async (publish = false) => {
    if (!form.title || !form.subject || !form.description) {
      toast.error("Title, subject and description are required");
      return;
    }
    setSaving(true);
    try {
      const tags = form.tags.split(",").map((t) => t.trim()).filter(Boolean);
      const res = await fetch(`/api/admin/samples/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form, pages: Number(form.pages), wordCount: Number(form.wordCount),
          sources: form.sources ? Number(form.sources) : null,
          tags, attachments, isPublished: publish || form.isPublished,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast.success("Saved!");
      router.push("/admin/samples");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-6 text-center text-slate-400 py-20"><Loader2 className="w-8 h-8 animate-spin mx-auto" /></div>;

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/admin/samples" className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-all">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-white">Edit Sample Assignment</h1>
            <p className="text-slate-400 text-xs mt-0.5">Changes are reflected on the public page immediately after saving</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={() => handleSave(false)} disabled={saving} className="btn-secondary flex items-center gap-2 px-4 py-2 text-sm">
            <Save className="w-4 h-4" /> Save
          </button>
          {!form.isPublished && (
            <button onClick={() => handleSave(true)} disabled={saving} className="btn-primary flex items-center gap-2 px-4 py-2 text-sm">
              <Eye className="w-4 h-4" /> Publish
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 space-y-5">
          <div className="glass-card p-5 space-y-4">
            <h2 className="text-white font-semibold text-sm">Assignment Title</h2>
            <input value={form.title} onChange={(e) => update("title", e.target.value)} placeholder="e.g. Nursing Executive CPE Record" className="input-field w-full" />
          </div>

          <div className="glass-card p-5 space-y-3">
            <div>
              <h2 className="text-white font-semibold text-sm">Assignment Instructions</h2>
              <p className="text-slate-500 text-xs mt-0.5">Full instructions, rubric, and requirements.</p>
            </div>
            <textarea value={form.description} onChange={(e) => update("description", e.target.value)} rows={18} className="input-field w-full resize-y font-mono text-sm leading-relaxed" />
          </div>

          <div className="glass-card p-5 space-y-4">
            <div className="flex items-center gap-2">
              <Paperclip className="w-4 h-4 text-brand-400" />
              <h2 className="text-white font-semibold text-sm">Attachments</h2>
            </div>
            {attachments.map((a, i) => (
              <div key={i} className="flex items-center gap-2 p-3 bg-white/5 rounded-lg border border-white/10">
                <Paperclip className="w-4 h-4 text-slate-400 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-medium truncate">{a.name}</p>
                  <p className="text-slate-500 text-xs truncate">{a.url}</p>
                </div>
                <button onClick={() => setAttachments((prev) => prev.filter((_, idx) => idx !== i))} className="text-slate-500 hover:text-red-400 transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
            <div className="grid grid-cols-2 gap-2">
              <input value={newAttachment.name} onChange={(e) => setNewAttachment((p) => ({ ...p, name: e.target.value }))} placeholder="File name" className="input-field text-sm" />
              <input value={newAttachment.url} onChange={(e) => setNewAttachment((p) => ({ ...p, url: e.target.value }))} placeholder="File URL" className="input-field text-sm" />
            </div>
            <button onClick={addAttachment} disabled={!newAttachment.name || !newAttachment.url} className="btn-secondary flex items-center gap-2 text-sm px-4 py-2 disabled:opacity-40">
              <Plus className="w-4 h-4" /> Add Attachment
            </button>
          </div>
        </div>

        <div className="space-y-5">
          <div className="glass-card p-5 space-y-4">
            <h2 className="text-white font-semibold text-sm">Assignment Details</h2>
            <div>
              <label className="label">Subject / Course</label>
              <input value={form.subject} onChange={(e) => update("subject", e.target.value)} className="input-field w-full text-sm" />
            </div>
            <div>
              <label className="label">Type</label>
              <select value={form.orderType} onChange={(e) => update("orderType", e.target.value)} className="input-field w-full text-sm">
                {ORDER_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Education Level</label>
              <select value={form.educationLevel} onChange={(e) => update("educationLevel", e.target.value)} className="input-field w-full text-sm">
                {EDUCATION_LEVELS.map((l) => <option key={l} value={l}>{l}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Citation Style</label>
              <select value={form.citationStyle} onChange={(e) => update("citationStyle", e.target.value)} className="input-field w-full text-sm">
                {CITATION_STYLES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">Pages</label>
                <input type="number" min="1" value={form.pages} onChange={(e) => handlePagesChange(e.target.value)} className="input-field w-full text-sm" />
              </div>
              <div>
                <label className="label">Words</label>
                <input type="number" value={form.wordCount} onChange={(e) => update("wordCount", e.target.value)} className="input-field w-full text-sm" />
              </div>
            </div>
            <div>
              <label className="label">Sources Required</label>
              <input type="number" min="0" value={form.sources} onChange={(e) => update("sources", e.target.value)} placeholder="0" className="input-field w-full text-sm" />
            </div>
            <div>
              <label className="label">Language</label>
              <select value={form.language} onChange={(e) => update("language", e.target.value)} className="input-field w-full text-sm">
                {LANGUAGES.map((l) => <option key={l} value={l}>{l}</option>)}
              </select>
            </div>
          </div>

          <div className="glass-card p-5 space-y-3">
            <h2 className="text-white font-semibold text-sm">SEO Tags</h2>
            <textarea value={form.tags} onChange={(e) => update("tags", e.target.value)} rows={3} placeholder="nursing, leadership, APA, healthcare" className="input-field w-full text-sm resize-none" />
          </div>

          <div className="glass-card p-5 space-y-3">
            <h2 className="text-white font-semibold text-sm">Visibility</h2>
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" checked={form.isPublished} onChange={(e) => update("isPublished", e.target.checked)} className="w-4 h-4 accent-brand-500" />
              <span className="text-slate-300 text-sm">Published</span>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}
