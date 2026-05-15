"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, Clock, CheckCircle, Download, MessageSquare, AlertCircle,
  Star, FileText, RefreshCw, Shield, Zap, ChevronDown, ExternalLink, User
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { CountdownTimer } from "@/components/dashboard/CountdownTimer";
import { formatPrice, getTimeRemaining } from "@/lib/pricing";
import { useAuthStore } from "@/store";
import toast from "react-hot-toast";
import type { Order } from "@/types";

const STATUS_STEPS = [
  { key: "PENDING", label: "Order Placed", icon: FileText },
  { key: "ASSIGNED", label: "Writer Assigned", icon: User },
  { key: "IN_PROGRESS", label: "Writing in Progress", icon: Clock },
  { key: "UNDER_REVIEW", label: "Submitted for Review", icon: CheckCircle },
  { key: "COMPLETED", label: "Completed", icon: CheckCircle },
];

const STATUS_STEP_INDEX: Record<string, number> = { PENDING: 0, ASSIGNED: 1, IN_PROGRESS: 2, UNDER_REVIEW: 3, REVISION_REQUESTED: 2, COMPLETED: 4, CANCELLED: -1 };

async function fetchOrder(id: string): Promise<Order> {
  const res = await fetch(`/api/orders/${id}`);
  const data = await res.json();
  if (!res.ok) throw new Error(data.error);
  return data.data.order;
}

export default function OrderDetailPage() {
  const { id } = useParams() as { id: string };
  const router = useRouter();
  const { user } = useAuthStore();
  const qc = useQueryClient();

  const [showReviseModal, setShowReviseModal] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [revisionNotes, setRevisionNotes] = useState("");
  const [rating, setRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [activeTab, setActiveTab] = useState<"overview" | "chat" | "files">("overview");

  const { data: order, isLoading, error } = useQuery<Order>({
    queryKey: ["order", id],
    queryFn: () => fetchOrder(id),
    refetchInterval: 30000,
  });

  const releaseMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/orders/${id}/release`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      return data;
    },
    onSuccess: () => { toast.success("Payment released! Order marked as complete."); qc.invalidateQueries({ queryKey: ["order", id] }); },
    onError: (e: Error) => toast.error(e.message),
  });

  const reviseMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/orders/${id}/revise`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ notes: revisionNotes }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      return data;
    },
    onSuccess: () => { toast.success("Revision requested!"); setShowReviseModal(false); setRevisionNotes(""); qc.invalidateQueries({ queryKey: ["order", id] }); },
    onError: (e: Error) => toast.error(e.message),
  });

  const reviewMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/reviews", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId: id, targetId: (order as any)?.writer?.userId, rating, comment: reviewComment }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      return data;
    },
    onSuccess: () => { toast.success("Review submitted! Thank you."); setShowReviewModal(false); qc.invalidateQueries({ queryKey: ["order", id] }); },
    onError: (e: Error) => toast.error(e.message),
  });

  if (isLoading) return (
    <div className="p-8">
      <div className="space-y-4">{[1,2,3].map(i => <div key={i} className="h-32 glass rounded-xl shimmer" />)}</div>
    </div>
  );

  if (error || !order) return (
    <div className="p-8 flex items-center justify-center">
      <div className="text-center"><AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" /><h2 className="text-white text-xl font-bold mb-2">Order not found</h2><Link href="/dashboard/orders" className="btn-primary">Back to Orders</Link></div>
    </div>
  );

  const stepIndex = STATUS_STEP_INDEX[order.status] ?? 0;
  const timeLeft = getTimeRemaining(order.deadline);
  const writer = (order as any).writer;
  const submissions = (order as any).submissions || [];
  const latestSubmission = submissions[0];
  const isCompleted = order.status === "COMPLETED";
  const isUnderReview = order.status === "UNDER_REVIEW";
  const canRevise = isUnderReview && order.revisionCount < order.maxRevisions;

  return (
    <div className="p-6 lg:p-8 max-w-6xl mx-auto">
          {/* Back + header */}
          <div className="mb-6">
            <Link href="/dashboard/orders" className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm mb-4">
              <ArrowLeft className="w-4 h-4" /> Back to Orders
            </Link>
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  <span className="text-slate-500 text-sm font-mono">#{order.orderNumber}</span>
                  {order.isEmergency && <span className="badge bg-emergency-500/20 text-emergency-400 border-emergency-500/30">⚡ EMERGENCY</span>}
                  <span className={`badge ${isCompleted ? "badge-green" : isUnderReview ? "badge-purple" : "badge-blue"}`}>
                    {order.status.replace(/_/g, " ")}
                  </span>
                </div>
                <h1 className="text-2xl font-bold text-white leading-tight">{order.title}</h1>
                <p className="text-slate-400 text-sm mt-1">{order.category} · {order.wordCount.toLocaleString()} words · {order.academicLevel.replace(/_/g, " ")}</p>
              </div>
              {!isCompleted && !["CANCELLED", "DISPUTED"].includes(order.status) && (
                <div className="flex-shrink-0">
                  <div className={`flex flex-col items-end gap-1 p-4 glass rounded-xl ${timeLeft.isUrgent ? "border-red-500/30" : "border-brand-500/20"}`}>
                    <span className="text-xs text-slate-500">Time Remaining</span>
                    <CountdownTimer deadline={order.deadline} />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Progress stepper */}
          {!["CANCELLED", "DISPUTED"].includes(order.status) && (
            <div className="glass-card p-6 mb-6 overflow-x-auto">
              <div className="flex items-center min-w-max">
                {STATUS_STEPS.map((step, i) => {
                  const done = i < stepIndex;
                  const active = i === stepIndex;
                  return (
                    <div key={step.key} className="flex items-center">
                      <div className={`flex flex-col items-center ${i < STATUS_STEPS.length - 1 ? "w-28 lg:w-36" : ""}`}>
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${done ? "bg-green-500 text-white" : active ? "bg-brand-500 text-white ring-4 ring-brand-500/30" : "bg-white/10 text-slate-500"}`}>
                          {done ? <CheckCircle className="w-5 h-5" /> : <step.icon className="w-5 h-5" />}
                        </div>
                        <span className={`text-xs mt-2 text-center w-20 ${done || active ? "text-white font-medium" : "text-slate-600"}`}>{step.label}</span>
                      </div>
                      {i < STATUS_STEPS.length - 1 && (
                        <div className={`h-0.5 flex-1 mb-5 mx-1 transition-all ${done ? "bg-green-500" : "bg-white/10"}`} />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Main content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Tabs */}
              <div className="flex border-b border-white/10">
                {(["overview", "chat", "files"] as const).map((tab) => (
                  <button key={tab} onClick={() => setActiveTab(tab)}
                    className={`px-5 py-3 text-sm font-medium capitalize transition-all border-b-2 -mb-px ${activeTab === tab ? "border-brand-500 text-brand-400" : "border-transparent text-slate-500 hover:text-slate-300"}`}>
                    {tab}
                  </button>
                ))}
              </div>

              {/* Overview tab */}
              {activeTab === "overview" && (
                <div className="space-y-5">
                  {/* Latest submission */}
                  {latestSubmission && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                      className={`glass-card p-5 ${isUnderReview ? "border-brand-500/30" : isCompleted ? "border-green-500/30" : ""}`}>
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-white font-semibold flex items-center gap-2">
                          <CheckCircle className={`w-5 h-5 ${isCompleted ? "text-green-400" : "text-brand-400"}`} />
                          {latestSubmission.isRevision ? `Revision v${latestSubmission.version}` : "Submitted Work"}
                        </h3>
                        <span className="text-slate-500 text-xs">{new Date(latestSubmission.submittedAt).toLocaleString()}</span>
                      </div>
                      {latestSubmission.notes && <p className="text-slate-400 text-sm mb-4 p-3 bg-white/5 rounded-lg">{latestSubmission.notes}</p>}
                      {latestSubmission.content && (
                        <div className="bg-white/5 rounded-xl p-4 max-h-64 overflow-y-auto">
                          <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-wrap">{latestSubmission.content}</p>
                        </div>
                      )}
                      {latestSubmission.fileUrl && (
                        <a href={latestSubmission.fileUrl} target="_blank" rel="noopener noreferrer"
                          className="mt-3 flex items-center gap-2 text-brand-400 hover:text-brand-300 text-sm transition-colors">
                          <Download className="w-4 h-4" /> Download {latestSubmission.fileName || "Submitted File"}
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                      {isUnderReview && (
                        <div className="flex gap-3 mt-4 pt-4 border-t border-white/10">
                          <button onClick={() => releaseMutation.mutate()} disabled={releaseMutation.isPending}
                            className="btn-primary flex-1 py-2.5 text-sm">
                            {releaseMutation.isPending ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mx-auto" /> : <><CheckCircle className="w-4 h-4" /> Approve & Release Payment</>}
                          </button>
                          {canRevise && (
                            <button onClick={() => setShowReviseModal(true)} className="btn-secondary flex-1 py-2.5 text-sm">
                              <RefreshCw className="w-4 h-4" /> Request Revision ({order.maxRevisions - order.revisionCount} left)
                            </button>
                          )}
                        </div>
                      )}
                    </motion.div>
                  )}

                  {/* Order description */}
                  <div className="glass-card p-5">
                    <h3 className="text-white font-semibold mb-3">Order Details</h3>
                    <p className="text-slate-400 text-sm leading-relaxed mb-4">{order.description}</p>
                    {(order as any).instructions && (
                      <div className="mt-3 pt-3 border-t border-white/10">
                        <p className="text-slate-500 text-xs font-medium mb-1 uppercase tracking-wide">Additional Instructions</p>
                        <p className="text-slate-400 text-sm leading-relaxed">{(order as any).instructions}</p>
                      </div>
                    )}
                  </div>

                  {/* Review section for completed orders */}
                  {isCompleted && (
                    <div className="glass-card p-5 border-green-500/20">
                      <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
                        <Star className="w-5 h-5 text-yellow-400" /> Rate Your Experience
                      </h3>
                      <p className="text-slate-400 text-sm mb-4">How was your experience with this order?</p>
                      <button onClick={() => setShowReviewModal(true)} className="btn-primary text-sm">
                        <Star className="w-4 h-4" /> Leave a Review
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Chat tab */}
              {activeTab === "chat" && (
                <div className="glass-card p-0 overflow-hidden" style={{ height: "500px" }}>
                  <iframe src={`/dashboard/chat?orderId=${id}`} className="w-full h-full border-0" title="Order Chat" />
                </div>
              )}

              {/* Files tab */}
              {activeTab === "files" && (
                <div className="space-y-3">
                  {(order as any).attachments?.length === 0 ? (
                    <div className="glass-card p-10 text-center"><FileText className="w-10 h-10 text-slate-700 mx-auto mb-2" /><p className="text-slate-500 text-sm">No files attached</p></div>
                  ) : (
                    (order as any).attachments?.map((file: any) => (
                      <a key={file.id} href={file.url} target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-3 p-4 glass rounded-xl hover:border-white/20 transition-all group">
                        <FileText className="w-5 h-5 text-brand-400 flex-shrink-0" />
                        <div className="flex-1 min-w-0"><p className="text-white text-sm font-medium truncate group-hover:text-brand-300">{file.name}</p><p className="text-slate-500 text-xs">{(file.size / 1024).toFixed(0)} KB</p></div>
                        <Download className="w-4 h-4 text-slate-600 group-hover:text-brand-400" />
                      </a>
                    ))
                  )}
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-5">
              {/* Writer info */}
              {writer ? (
                <div className="glass-card p-5">
                  <h3 className="text-white font-semibold mb-3 text-sm">Your Writer</h3>
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-brand-600 to-brand-400 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                      {writer.user?.name?.slice(0, 2).toUpperCase() || "WR"}
                    </div>
                    <div className="flex-1">
                      <p className="text-white font-semibold text-sm">{writer.user?.name || "Writer"}</p>
                      <div className="flex items-center gap-1 mt-0.5">
                        {[1,2,3,4,5].map(i => <Star key={i} className={`w-3 h-3 ${i <= Math.round(writer.rating || 0) ? "fill-yellow-400 text-yellow-400" : "text-slate-600"}`} />)}
                        <span className="text-slate-400 text-xs ml-1">{writer.rating?.toFixed(1)}</span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 mt-3">
                        <div className="text-center p-2 bg-white/5 rounded-lg">
                          <p className="text-white text-sm font-bold">{writer.completedOrders}</p>
                          <p className="text-slate-600 text-xs">Orders</p>
                        </div>
                        <div className="text-center p-2 bg-white/5 rounded-lg">
                          <p className="text-white text-sm font-bold">{writer.onTimeDelivery}%</p>
                          <p className="text-slate-600 text-xs">On-time</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <button onClick={() => setActiveTab("chat")} className="btn-secondary w-full text-xs py-2 mt-3">
                    <MessageSquare className="w-3.5 h-3.5" /> Message Writer
                  </button>
                </div>
              ) : (
                <div className="glass-card p-5">
                  <h3 className="text-white font-semibold mb-2 text-sm">Writer Assignment</h3>
                  <div className="flex items-center gap-2 text-slate-400 text-sm">
                    <div className="w-2 h-2 bg-orange-400 rounded-full animate-pulse" />
                    Looking for the best match...
                  </div>
                  <p className="text-slate-600 text-xs mt-1">Usually within 5-15 minutes</p>
                </div>
              )}

              {/* Order summary */}
              <div className="glass-card p-5">
                <h3 className="text-white font-semibold mb-3 text-sm">Order Summary</h3>
                <div className="space-y-2.5">
                  {[
                    { label: "Order #", value: order.orderNumber },
                    { label: "Category", value: order.category },
                    { label: "Word Count", value: `${order.wordCount.toLocaleString()} words` },
                    { label: "Urgency", value: order.urgency.replace(/_/g, " ") },
                    { label: "Revisions", value: `${order.revisionCount}/${order.maxRevisions} used` },
                  ].map(row => (
                    <div key={row.label} className="flex items-center justify-between">
                      <span className="text-slate-500 text-xs">{row.label}</span>
                      <span className="text-white text-xs font-medium">{row.value}</span>
                    </div>
                  ))}
                </div>
                <div className="pt-3 mt-3 border-t border-white/10">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 text-sm">Total Paid</span>
                    <span className="text-white font-bold">{formatPrice(order.totalPrice)}</span>
                  </div>
                  {(order as any).payment?.status && (
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-slate-400 text-xs">Payment</span>
                      <span className={`badge text-xs ${(order as any).payment.status === "RELEASED" ? "badge-green" : "badge-orange"}`}>{(order as any).payment.status}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Guarantee */}
              <div className="glass-card p-4 border-brand-500/20">
                <div className="flex items-start gap-3">
                  <Shield className="w-5 h-5 text-brand-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-white font-semibold text-sm mb-1">WriteProf Guarantee</p>
                    <ul className="text-slate-500 text-xs space-y-1">
                      <li>✓ Payment held in secure escrow</li>
                      <li>✓ Released only on your approval</li>
                      <li>✓ Full refund if deadline missed</li>
                      <li>✓ Free revisions included</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>


      {/* Revision Modal */}
      <AnimatePresence>
        {showReviseModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} className="glass-card p-6 w-full max-w-lg">
              <h3 className="text-white font-bold text-lg mb-1">Request Revision</h3>
              <p className="text-slate-400 text-sm mb-4">Clearly describe what needs to be changed. ({order.maxRevisions - order.revisionCount} revision{order.maxRevisions - order.revisionCount !== 1 ? "s" : ""} remaining)</p>
              <textarea value={revisionNotes} onChange={e => setRevisionNotes(e.target.value)} rows={5} placeholder="Please be specific: 'Change the introduction to focus on X', 'Add a section on Y', 'Use APA 7th edition for citations'..." className="input-field resize-none w-full mb-4" />
              <div className="flex gap-3">
                <button onClick={() => setShowReviseModal(false)} className="btn-secondary flex-1 py-2.5">Cancel</button>
                <button onClick={() => reviseMutation.mutate()} disabled={revisionNotes.trim().length < 10 || reviseMutation.isPending} className="btn-primary flex-1 py-2.5">
                  {reviseMutation.isPending ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mx-auto" /> : <><RefreshCw className="w-4 h-4" /> Send Request</>}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Review Modal */}
      <AnimatePresence>
        {showReviewModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} className="glass-card p-6 w-full max-w-md">
              <h3 className="text-white font-bold text-lg mb-4">Rate Your Experience</h3>
              <div className="flex items-center justify-center gap-2 mb-5">
                {[1,2,3,4,5].map(i => (
                  <button key={i} onClick={() => setRating(i)} className="transition-transform hover:scale-125">
                    <Star className={`w-8 h-8 ${i <= rating ? "fill-yellow-400 text-yellow-400" : "text-slate-600"}`} />
                  </button>
                ))}
              </div>
              <textarea value={reviewComment} onChange={e => setReviewComment(e.target.value)} rows={4} placeholder="Share your experience with this writer..." className="input-field resize-none w-full mb-4" />
              <div className="flex gap-3">
                <button onClick={() => setShowReviewModal(false)} className="btn-secondary flex-1 py-2.5">Cancel</button>
                <button onClick={() => reviewMutation.mutate()} disabled={reviewComment.length < 10 || reviewMutation.isPending} className="btn-primary flex-1 py-2.5">
                  {reviewMutation.isPending ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mx-auto" /> : <><Star className="w-4 h-4" /> Submit Review</>}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
