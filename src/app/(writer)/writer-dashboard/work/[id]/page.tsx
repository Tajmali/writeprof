"use client";

import { useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  ArrowLeft, Clock, FileText, Upload, Send, Star, AlertTriangle,
  CheckCircle, MessageSquare, Download, Zap, Brain, BookOpen,
  ChevronDown, ChevronUp, Eye, EyeOff, Loader2, X, Plus, Sparkles
} from "lucide-react";
import { CountdownTimer } from "@/components/dashboard/CountdownTimer";
import { formatPrice } from "@/lib/pricing";
import toast from "react-hot-toast";

interface OrderFile { id: string; name: string; url: string; size: number; mimeType: string; }
interface Submission { id: string; content: string; fileUrl: string | null; fileName: string | null; version: number; isRevision: boolean; createdAt: string; submittedAt: string; }
interface Message { id: string; content: string; senderId: string; sender: { name: string; avatar: string | null }; createdAt: string; }
interface Order {
  id: string; orderNumber: string; title: string; description: string; category: string;
  wordCount: number; urgency: string; academicLevel: AcademicLevel; status: string;
  isEmergency: boolean; deadline: string; totalPrice: number; revisionCount: number;
  maxRevisions: number; instructions: string | null;
  client: { id: string; name: string; avatar: string | null };
  attachments: OrderFile[];
  submissions: Submission[];
  messages: Message[];
  payment: { status: string; amount: number } | null;
}
type AcademicLevel = string;

const STATUS_STEPS = ["PENDING", "ASSIGNED", "IN_PROGRESS", "UNDER_REVIEW", "COMPLETED"];
const STATUS_LABELS: Record<string, string> = {
  PENDING: "Pending", ASSIGNED: "Assigned", IN_PROGRESS: "In Progress",
  UNDER_REVIEW: "Under Review", COMPLETED: "Completed", REVISION: "Revision"
};

const AI_TOOLS = [
  { id: "outline", label: "Generate Outline", icon: BookOpen, desc: "Create a structured outline for this assignment" },
  { id: "research", label: "Research Points", icon: Brain, desc: "Get key research points and sources" },
  { id: "grammar", label: "Grammar Check", icon: CheckCircle, desc: "Check and improve your writing" },
  { id: "paraphrase", label: "Paraphrase", icon: Sparkles, desc: "Rephrase selected content" },
  { id: "citation", label: "Format Citations", icon: FileText, desc: "Generate proper citations" },
  { id: "seo", label: "SEO Optimize", icon: Zap, desc: "Optimize for search engines" },
];

export default function WriterOrderWorkPage() {
  const { id } = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [activeTab, setActiveTab] = useState<"work" | "chat" | "files">("work");
  const [submissionContent, setSubmissionContent] = useState("");
  const [submissionFile, setSubmissionFile] = useState<File | null>(null);
  const [submissionFileUrl, setSubmissionFileUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const [showAI, setShowAI] = useState(false);
  const [aiTool, setAiTool] = useState("");
  const [aiInput, setAiInput] = useState("");
  const [aiResult, setAiResult] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [showFullDesc, setShowFullDesc] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["writer-order", id],
    queryFn: async () => {
      const res = await fetch(`/api/orders/${id}`);
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      return json.data.order as Order;
    },
    refetchInterval: 10000,
  });

  const submitMutation = useMutation({
    mutationFn: async (payload: { content: string; fileUrl?: string; fileName?: string }) => {
      const res = await fetch(`/api/orders/${id}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      return json.data;
    },
    onSuccess: () => {
      toast.success("Submission sent successfully! Waiting for client review.");
      queryClient.invalidateQueries({ queryKey: ["writer-order", id] });
      setSubmissionContent("");
      setSubmissionFile(null);
      setSubmissionFileUrl("");
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const sendMessageMutation = useMutation({
    mutationFn: async (content: string) => {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId: id, content }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      return json.data;
    },
    onSuccess: () => {
      setMessage("");
      queryClient.invalidateQueries({ queryKey: ["writer-order", id] });
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const handleFileUpload = async (file: File) => {
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      setSubmissionFile(file);
      setSubmissionFileUrl(json.data.secure_url);
      toast.success("File uploaded successfully");
    } catch (err) {
      toast.error("File upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = () => {
    if (!submissionContent.trim() && !submissionFileUrl) {
      toast.error("Please provide content or upload a file");
      return;
    }
    submitMutation.mutate({
      content: submissionContent,
      fileUrl: submissionFileUrl || undefined,
      fileName: submissionFile?.name || undefined,
    });
  };

  const runAITool = async () => {
    if (!aiTool) return;
    setAiLoading(true);
    setAiResult("");
    try {
      const res = await fetch("/api/ai/assist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: aiTool,
          content: aiInput || data?.description || data?.title,
          context: { title: data?.title, category: data?.category, wordCount: data?.wordCount, academicLevel: data?.academicLevel },
        }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      setAiResult(json.data.result);
    } catch (err) {
      toast.error("AI tool failed. Please try again.");
    } finally {
      setAiLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-brand-400 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Loading order...</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-white mb-2">Order not found</h2>
          <Link href="/writer-dashboard/work" className="text-brand-400 hover:text-brand-300">← Back to Orders</Link>
        </div>
      </div>
    );
  }

  const order = data;
  const stepIndex = STATUS_STEPS.indexOf(order.status === "REVISION" ? "IN_PROGRESS" : order.status);
  const latestSubmission = order.submissions?.[0];
  const canSubmit = ["ASSIGNED", "IN_PROGRESS", "REVISION"].includes(order.status);
  const isCompleted = order.status === "COMPLETED";

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Header */}
      <div className="flex items-start gap-4">
        <Link href="/writer-dashboard/work" className="p-2 rounded-xl glass border border-white/10 text-gray-400 hover:text-white transition-colors mt-1">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span className="text-sm text-gray-400 font-mono">{order.orderNumber}</span>
            {order.isEmergency && (
              <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-orange-500/20 text-orange-400 border border-orange-500/30 animate-pulse">
                ⚡ EMERGENCY
              </span>
            )}
            <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
              order.status === "COMPLETED" ? "bg-green-500/20 text-green-400" :
              order.status === "REVISION" ? "bg-orange-500/20 text-orange-400" :
              order.status === "UNDER_REVIEW" ? "bg-blue-500/20 text-blue-400" :
              "bg-brand-500/20 text-brand-400"
            }`}>
              {STATUS_LABELS[order.status] || order.status}
            </span>
          </div>
          <h1 className="text-xl font-bold text-white truncate">{order.title}</h1>
          <p className="text-sm text-gray-400 mt-0.5">{order.category} • {order.wordCount.toLocaleString()} words • {order.academicLevel}</p>
        </div>
        <div className="flex flex-col items-end gap-2 shrink-0">
          <CountdownTimer deadline={order.deadline} compact />
          <span className="text-lg font-bold text-brand-400">
            {formatPrice(order.totalPrice * 0.8)}
            <span className="text-xs text-gray-500 font-normal ml-1">your earnings</span>
          </span>
        </div>
      </div>

      {/* Progress Stepper */}
      <div className="glass-card p-4">
        <div className="flex items-center justify-between">
          {STATUS_STEPS.map((step, i) => (
            <div key={step} className="flex items-center flex-1">
              <div className="flex flex-col items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all ${
                  i <= stepIndex ? "bg-brand-500 border-brand-500 text-white" : "border-white/20 text-gray-600"
                }`}>
                  {i < stepIndex ? <CheckCircle className="w-4 h-4" /> : <span className="text-xs font-bold">{i + 1}</span>}
                </div>
                <span className={`text-xs mt-1 font-medium ${i <= stepIndex ? "text-brand-400" : "text-gray-600"}`}>
                  {STATUS_LABELS[step]}
                </span>
              </div>
              {i < STATUS_STEPS.length - 1 && (
                <div className={`flex-1 h-0.5 mx-2 mb-4 ${i < stepIndex ? "bg-brand-500" : "bg-white/10"}`} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Revision Alert */}
      {order.status === "REVISION" && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
          className="glass-card p-4 border border-orange-500/30 bg-orange-500/5">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-orange-400 mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-semibold text-orange-400 mb-1">Client requested a revision</p>
              {order.messages?.filter(m => m.content.startsWith("[REVISION REQUEST]")).slice(-1).map(m => (
                <p key={m.id} className="text-sm text-gray-300">{m.content.replace("[REVISION REQUEST] ", "")}</p>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Tabs */}
          <div className="flex gap-1 glass-card p-1">
            {[
              { id: "work", label: "Submit Work", icon: Upload },
              { id: "chat", label: "Chat", icon: MessageSquare },
              { id: "files", label: "Files", icon: FileText },
            ].map(tab => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-sm font-medium transition-all ${
                  activeTab === tab.id ? "bg-brand-500 text-white shadow-lg" : "text-gray-400 hover:text-white"
                }`}>
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <AnimatePresence mode="wait">
            {/* Work/Submit Tab */}
            {activeTab === "work" && (
              <motion.div key="work" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                className="space-y-4">
                {/* Order Brief */}
                <div className="glass-card p-5">
                  <h3 className="font-semibold text-white mb-3 flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-brand-400" /> Order Brief
                  </h3>
                  <div className={`text-sm text-gray-300 leading-relaxed ${!showFullDesc ? "line-clamp-4" : ""}`}>
                    {order.description}
                  </div>
                  {order.description.length > 200 && (
                    <button onClick={() => setShowFullDesc(!showFullDesc)}
                      className="text-brand-400 hover:text-brand-300 text-sm mt-2 flex items-center gap-1">
                      {showFullDesc ? <><ChevronUp className="w-4 h-4" /> Show less</> : <><ChevronDown className="w-4 h-4" /> Read more</>}
                    </button>
                  )}
                  {order.instructions && (
                    <div className="mt-4 p-3 rounded-lg bg-white/5 border border-white/10">
                      <p className="text-xs text-brand-400 font-medium mb-1">Additional Instructions</p>
                      <p className="text-sm text-gray-300">{order.instructions}</p>
                    </div>
                  )}
                </div>

                {/* Previous Submission */}
                {latestSubmission && (
                  <div className="glass-card p-5 border border-white/10">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold text-white flex items-center gap-2">
                        <FileText className="w-4 h-4 text-brand-400" />
                        {latestSubmission.isRevision ? "Revision" : "Submission"} v{latestSubmission.version}
                      </h3>
                      <span className="text-xs text-gray-500">
                        {new Date(latestSubmission.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    {latestSubmission.content && (
                      <div className="bg-white/5 rounded-lg p-3 max-h-32 overflow-y-auto">
                        <p className="text-sm text-gray-300">{latestSubmission.content.slice(0, 300)}...</p>
                      </div>
                    )}
                    {latestSubmission.fileUrl && (
                      <a href={latestSubmission.fileUrl} target="_blank" rel="noreferrer"
                        className="mt-3 flex items-center gap-2 text-brand-400 hover:text-brand-300 text-sm">
                        <Download className="w-4 h-4" /> Download {latestSubmission.fileName || "submitted file"}
                      </a>
                    )}
                  </div>
                )}

                {/* AI Writing Assistant */}
                <div className="glass-card p-5">
                  <button onClick={() => setShowAI(!showAI)}
                    className="w-full flex items-center justify-between text-left">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-brand-500 flex items-center justify-center">
                        <Sparkles className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-white text-sm">AI Writing Assistant</h3>
                        <p className="text-xs text-gray-400">Claude-powered tools for better writing</p>
                      </div>
                    </div>
                    {showAI ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
                  </button>

                  <AnimatePresence>
                    {showAI && (
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                        <div className="mt-4 grid grid-cols-2 gap-2">
                          {AI_TOOLS.map(tool => (
                            <button key={tool.id} onClick={() => setAiTool(tool.id)}
                              className={`p-3 rounded-lg border text-left transition-all ${
                                aiTool === tool.id
                                  ? "border-brand-500/50 bg-brand-500/10 text-white"
                                  : "border-white/10 text-gray-400 hover:border-white/20 hover:text-white"
                              }`}>
                              <tool.icon className={`w-4 h-4 mb-1 ${aiTool === tool.id ? "text-brand-400" : ""}`} />
                              <p className="text-xs font-medium">{tool.label}</p>
                              <p className="text-xs text-gray-500 mt-0.5">{tool.desc}</p>
                            </button>
                          ))}
                        </div>

                        {aiTool && (
                          <div className="mt-4 space-y-3">
                            <textarea
                              value={aiInput}
                              onChange={e => setAiInput(e.target.value)}
                              placeholder={`Enter text or leave blank to use order description...`}
                              rows={3}
                              className="input-field w-full resize-none text-sm"
                            />
                            <button onClick={runAITool} disabled={aiLoading}
                              className="btn-primary w-full flex items-center justify-center gap-2">
                              {aiLoading ? <><Loader2 className="w-4 h-4 animate-spin" /> Processing...</> :
                                <><Sparkles className="w-4 h-4" /> Run {AI_TOOLS.find(t => t.id === aiTool)?.label}</>}
                            </button>
                          </div>
                        )}

                        {aiResult && (
                          <div className="mt-4 p-4 bg-white/5 rounded-xl border border-brand-500/20">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-xs text-brand-400 font-medium">AI Result</span>
                              <button onClick={() => {
                                setSubmissionContent(prev => prev + "\n\n" + aiResult);
                                toast.success("Added to submission");
                              }} className="text-xs text-gray-400 hover:text-white flex items-center gap-1">
                                <Plus className="w-3 h-3" /> Add to submission
                              </button>
                            </div>
                            <div className="text-sm text-gray-300 whitespace-pre-wrap max-h-64 overflow-y-auto">
                              {aiResult}
                            </div>
                          </div>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Submission Form */}
                {canSubmit ? (
                  <div className="glass-card p-5 space-y-4">
                    <h3 className="font-semibold text-white flex items-center gap-2">
                      <Send className="w-4 h-4 text-brand-400" />
                      {latestSubmission ? "Submit Revision" : "Submit Your Work"}
                    </h3>

                    <div>
                      <label className="text-sm text-gray-400 mb-2 block">Your Content</label>
                      <textarea
                        value={submissionContent}
                        onChange={e => setSubmissionContent(e.target.value)}
                        placeholder="Paste or type your content here..."
                        rows={12}
                        className="input-field w-full resize-none font-mono text-sm"
                      />
                      <div className="flex justify-between mt-1">
                        <span className="text-xs text-gray-500">
                          ~{Math.round(submissionContent.split(/\s+/).filter(Boolean).length)} words
                        </span>
                        <span className="text-xs text-gray-500">Target: {order.wordCount} words</span>
                      </div>
                    </div>

                    <div className="border-t border-white/10 pt-4">
                      <label className="text-sm text-gray-400 mb-2 block">Or attach a file</label>
                      <div
                        onClick={() => fileInputRef.current?.click()}
                        className="border-2 border-dashed border-white/20 rounded-xl p-6 text-center cursor-pointer hover:border-brand-500/50 transition-colors"
                      >
                        {uploading ? (
                          <div className="flex flex-col items-center gap-2">
                            <Loader2 className="w-8 h-8 text-brand-400 animate-spin" />
                            <p className="text-sm text-gray-400">Uploading...</p>
                          </div>
                        ) : submissionFile ? (
                          <div className="flex items-center justify-center gap-3">
                            <FileText className="w-6 h-6 text-brand-400" />
                            <div className="text-left">
                              <p className="text-sm font-medium text-white">{submissionFile.name}</p>
                              <p className="text-xs text-gray-400">{(submissionFile.size / 1024).toFixed(1)} KB</p>
                            </div>
                            <button onClick={e => { e.stopPropagation(); setSubmissionFile(null); setSubmissionFileUrl(""); }}
                              className="p-1 rounded-lg hover:bg-white/10 text-gray-400 hover:text-red-400 ml-2">
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <>
                            <Upload className="w-8 h-8 text-gray-500 mx-auto mb-2" />
                            <p className="text-sm text-gray-400">Click to upload file</p>
                            <p className="text-xs text-gray-600 mt-1">DOC, DOCX, PDF, TXT up to 25MB</p>
                          </>
                        )}
                      </div>
                      <input
                        ref={fileInputRef}
                        type="file"
                        className="hidden"
                        accept=".doc,.docx,.pdf,.txt"
                        onChange={e => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
                      />
                    </div>

                    <button
                      onClick={handleSubmit}
                      disabled={submitMutation.isPending || uploading}
                      className="btn-primary w-full flex items-center justify-center gap-2 py-3"
                    >
                      {submitMutation.isPending ? (
                        <><Loader2 className="w-5 h-5 animate-spin" /> Submitting...</>
                      ) : (
                        <><Send className="w-5 h-5" /> Submit Work</>
                      )}
                    </button>
                  </div>
                ) : isCompleted ? (
                  <div className="glass-card p-6 text-center border border-green-500/30 bg-green-500/5">
                    <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-3" />
                    <h3 className="font-semibold text-white mb-1">Order Completed!</h3>
                    <p className="text-sm text-gray-400">The client has approved your work. Payment of {formatPrice(order.totalPrice * 0.8)} has been credited to your wallet.</p>
                  </div>
                ) : (
                  <div className="glass-card p-6 text-center border border-blue-500/30 bg-blue-500/5">
                    <Eye className="w-12 h-12 text-blue-400 mx-auto mb-3" />
                    <h3 className="font-semibold text-white mb-1">Under Client Review</h3>
                    <p className="text-sm text-gray-400">Your submission is being reviewed. You'll be notified of any feedback.</p>
                  </div>
                )}
              </motion.div>
            )}

            {/* Chat Tab */}
            {activeTab === "chat" && (
              <motion.div key="chat" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                className="glass-card p-5">
                <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-brand-400" /> Chat with {order.client.name}
                </h3>
                <div className="h-80 overflow-y-auto space-y-3 mb-4 pr-1">
                  {order.messages?.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-gray-500">
                      <MessageSquare className="w-8 h-8 mb-2" />
                      <p className="text-sm">No messages yet</p>
                    </div>
                  ) : (
                    order.messages?.map(msg => (
                      <div key={msg.id} className={`flex gap-2 ${msg.senderId !== order.client.id ? "flex-row-reverse" : ""}`}>
                        <div className="w-7 h-7 rounded-full bg-brand-500/20 flex items-center justify-center shrink-0 text-xs font-bold text-brand-400">
                          {msg.sender.name[0]}
                        </div>
                        <div className={`max-w-xs rounded-2xl px-3 py-2 ${
                          msg.senderId !== order.client.id ? "bg-brand-500 text-white" : "bg-white/10 text-gray-300"
                        }`}>
                          <p className="text-sm">{msg.content}</p>
                          <p className={`text-xs mt-1 ${msg.senderId !== order.client.id ? "text-blue-200" : "text-gray-500"}`}>
                            {new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
                <div className="flex gap-2">
                  <input
                    value={message}
                    onChange={e => setMessage(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && !e.shiftKey && message.trim() && sendMessageMutation.mutate(message.trim())}
                    placeholder="Type a message..."
                    className="input-field flex-1"
                  />
                  <button
                    onClick={() => message.trim() && sendMessageMutation.mutate(message.trim())}
                    disabled={sendMessageMutation.isPending || !message.trim()}
                    className="btn-primary px-4"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            )}

            {/* Files Tab */}
            {activeTab === "files" && (
              <motion.div key="files" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                className="glass-card p-5">
                <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-brand-400" /> Client Files
                </h3>
                {order.attachments?.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <FileText className="w-8 h-8 mx-auto mb-2" />
                    <p className="text-sm">No files attached</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {order.attachments?.map(file => (
                      <div key={file.id} className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10">
                        <div className="flex items-center gap-3">
                          <FileText className="w-5 h-5 text-brand-400" />
                          <div>
                            <p className="text-sm font-medium text-white">{file.name}</p>
                            <p className="text-xs text-gray-400">{(file.size / 1024).toFixed(1)} KB</p>
                          </div>
                        </div>
                        <a href={file.url} target="_blank" rel="noreferrer"
                          className="btn-secondary text-xs px-3 py-1.5 flex items-center gap-1">
                          <Download className="w-3 h-3" /> Download
                        </a>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Deadline */}
          <div className="glass-card p-4">
            <div className="flex items-center gap-2 mb-3">
              <Clock className="w-4 h-4 text-brand-400" />
              <h3 className="font-semibold text-white text-sm">Deadline</h3>
            </div>
            <CountdownTimer deadline={order.deadline} />
            <p className="text-xs text-gray-500 mt-2">
              {new Date(order.deadline).toLocaleString()}
            </p>
          </div>

          {/* Order Summary */}
          <div className="glass-card p-4">
            <h3 className="font-semibold text-white text-sm mb-3">Order Details</h3>
            <div className="space-y-2 text-sm">
              {[
                { label: "Urgency", value: order.urgency.replace(/_/g, " ") },
                { label: "Academic Level", value: order.academicLevel },
                { label: "Word Count", value: `${order.wordCount.toLocaleString()} words` },
                { label: "Category", value: order.category },
                { label: "Revisions", value: `${order.revisionCount}/${order.maxRevisions} used` },
              ].map(({ label, value }) => (
                <div key={label} className="flex justify-between">
                  <span className="text-gray-400">{label}</span>
                  <span className="text-white font-medium">{value}</span>
                </div>
              ))}
              <div className="border-t border-white/10 pt-2 mt-2">
                <div className="flex justify-between">
                  <span className="text-gray-400">Order Total</span>
                  <span className="text-white font-bold">{formatPrice(order.totalPrice)}</span>
                </div>
                <div className="flex justify-between mt-1">
                  <span className="text-brand-400 font-medium">Your Earnings (80%)</span>
                  <span className="text-brand-400 font-bold">{formatPrice(order.totalPrice * 0.8)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Client Info */}
          <div className="glass-card p-4">
            <h3 className="font-semibold text-white text-sm mb-3">Client</h3>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center text-white font-bold">
                {order.client.name[0]}
              </div>
              <div>
                <p className="font-medium text-white text-sm">{order.client.name}</p>
                <p className="text-xs text-gray-400">Client</p>
              </div>
            </div>
            <button onClick={() => setActiveTab("chat")}
              className="mt-3 w-full btn-secondary text-sm flex items-center justify-center gap-2">
              <MessageSquare className="w-4 h-4" /> Send Message
            </button>
          </div>

          {/* Tips */}
          <div className="glass-card p-4 border border-brand-500/20 bg-brand-500/5">
            <h3 className="font-semibold text-brand-400 text-sm mb-2">✨ Writer Tips</h3>
            <ul className="space-y-1.5 text-xs text-gray-400">
              <li>• Use the AI tools for research and outlining</li>
              <li>• Submit before the deadline to avoid penalties</li>
              <li>• Message the client if you need clarification</li>
              <li>• Check the style/format requirements carefully</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
