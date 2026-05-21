"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, Clock, BookOpen, Zap, AlertCircle, Loader2,
  FileText, Send, X, ChevronDown, CheckCircle2, Users
} from "lucide-react";
import { CountdownTimer } from "@/components/dashboard/CountdownTimer";
import { formatPrice } from "@/lib/pricing";
import toast from "react-hot-toast";

// ─── Types ────────────────────────────────────────────────────────────────────
interface AvailableOrder {
  id: string;
  orderNumber: string;
  title: string;
  description: string;
  category: string;
  academicLevel: string;
  wordCount: number;
  urgency: string;
  totalPrice: number;
  deadline: string;
  isEmergency: boolean;
  createdAt: string;
  _count: { proposals: number };
  proposals: { id: string; status: string; createdAt: string }[];
}

const CATEGORIES = [
  "All", "Essay", "Research Paper", "Thesis", "Dissertation",
  "Case Study", "Report", "Literature Review", "Assignment", "Coursework"
];
const LEVELS = ["All", "HIGH_SCHOOL", "UNDERGRADUATE", "MASTERS", "PHD", "PROFESSIONAL"];
const LEVEL_LABELS: Record<string, string> = {
  ALL: "All Levels", HIGH_SCHOOL: "High School", UNDERGRADUATE: "Undergraduate",
  MASTERS: "Masters", PHD: "PhD", PROFESSIONAL: "Professional",
};

// ─── BidModal ─────────────────────────────────────────────────────────────────
function BidModal({
  order,
  onClose,
  onSuccess,
}: {
  order: AvailableOrder;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [coverLetter, setCoverLetter] = useState("");
  const [bidAmount, setBidAmount] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (coverLetter.trim().length < 20) {
      toast.error("Cover letter must be at least 20 characters");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/proposals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: order.id,
          coverLetter: coverLetter.trim(),
          ...(bidAmount ? { bidAmount: parseFloat(bidAmount) } : {}),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to submit bid");
      toast.success("Bid submitted successfully!");
      onSuccess();
      onClose();
    } catch (err: any) {
      toast.error(err.message || "Failed to submit bid");
    } finally {
      setSubmitting(false);
    }
  };

  const writerEarnings = order.totalPrice * 0.8;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={(e) => e.target === e.currentTarget && onClose()}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="bg-slate-900 border border-white/10 rounded-2xl w-full max-w-lg shadow-2xl"
        >
          {/* Header */}
          <div className="flex items-start justify-between p-5 border-b border-white/10">
            <div className="flex-1 min-w-0 pr-4">
              <p className="text-slate-400 text-xs mb-1 font-mono">{order.orderNumber}</p>
              <h2 className="text-white font-bold text-base leading-snug line-clamp-2">{order.title}</h2>
            </div>
            <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-all flex-shrink-0">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Order quick info */}
          <div className="px-5 py-3 bg-white/3 border-b border-white/5 flex flex-wrap gap-3 text-xs text-slate-400">
            <span className="flex items-center gap-1"><BookOpen className="w-3.5 h-3.5" />{order.wordCount.toLocaleString()} words</span>
            <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /><CountdownTimer deadline={order.deadline} compact /></span>
            <span className="flex items-center gap-1 text-green-400 font-semibold">
              Your earnings: {formatPrice(writerEarnings)}
            </span>
            <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" />{order._count.proposals} bid{order._count.proposals !== 1 ? "s" : ""}</span>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-5 space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Cover Letter <span className="text-red-400">*</span>
              </label>
              <textarea
                value={coverLetter}
                onChange={(e) => setCoverLetter(e.target.value)}
                placeholder="Introduce yourself and explain why you're the best writer for this order. Mention your relevant experience, approach, and what makes your work stand out..."
                rows={6}
                className="input-field resize-none w-full text-sm"
                required
                maxLength={2000}
              />
              <p className={`text-right text-xs mt-1 ${coverLetter.length < 20 ? "text-red-400" : "text-slate-500"}`}>
                {coverLetter.length}/2000
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Bid Amount (optional)
                <span className="text-slate-500 font-normal ml-1">— leave blank to accept listed price</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">₦</span>
                <input
                  type="number"
                  value={bidAmount}
                  onChange={(e) => setBidAmount(e.target.value)}
                  placeholder={String(Math.round(writerEarnings))}
                  min={1}
                  step={100}
                  className="input-field pl-7 w-full text-sm"
                />
              </div>
            </div>

            <div className="flex gap-3 pt-1">
              <button type="button" onClick={onClose} className="btn-secondary flex-1 py-2.5 text-sm">
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting || coverLetter.trim().length < 20}
                className="btn-primary flex-1 py-2.5 text-sm gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
                {submitting ? "Submitting..." : "Submit Bid"}
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function AvailableOrdersPage() {
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [level, setLevel] = useState("All");
  const [bidTarget, setBidTarget] = useState<AvailableOrder | null>(null);
  const [levelOpen, setLevelOpen] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["available-orders", search, category, level],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (category !== "All") params.set("category", category);
      if (level !== "All") params.set("level", level);
      params.set("limit", "40");
      const res = await fetch(`/api/available-orders?${params}`);
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      return json.data.orders as AvailableOrder[];
    },
    refetchInterval: 20000,
  });

  const orders = data || [];
  const emergencyOrders = orders.filter((o) => o.isEmergency);
  const regularOrders = orders.filter((o) => !o.isEmergency);

  return (
    <div className="p-6 lg:p-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Available Orders</h1>
        <p className="text-slate-400 text-sm mt-1">Browse open orders and place your bids to get started.</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search orders..."
            className="input-field pl-9 w-full"
          />
        </div>

        {/* Category pills */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {CATEGORIES.slice(0, 5).map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all
                ${category === cat
                  ? "bg-brand-500/20 border-brand-500/40 text-brand-300"
                  : "border-white/10 text-slate-400 hover:border-white/20 hover:text-white"
                }`}
            >
              {cat}
            </button>
          ))}
          {/* More categories */}
          <div className="relative">
            <button
              onClick={() => {}}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all flex items-center gap-1
                ${CATEGORIES.slice(5).includes(category)
                  ? "bg-brand-500/20 border-brand-500/40 text-brand-300"
                  : "border-white/10 text-slate-400 hover:border-white/20 hover:text-white"
                }`}
            >
              More <ChevronDown className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Level dropdown */}
        <div className="relative">
          <button
            onClick={() => setLevelOpen((v) => !v)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900/60 border border-white/10 text-sm text-slate-300 hover:text-white hover:border-white/20 transition-all"
          >
            {LEVEL_LABELS[level] || level}
            <ChevronDown className={`w-4 h-4 text-slate-500 transition-transform ${levelOpen ? "rotate-180" : ""}`} />
          </button>
          <AnimatePresence>
            {levelOpen && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                className="absolute right-0 top-full mt-2 w-44 bg-slate-900 border border-white/10 rounded-xl shadow-xl overflow-hidden z-30"
              >
                {LEVELS.map((l) => (
                  <button
                    key={l}
                    onClick={() => { setLevel(l); setLevelOpen(false); }}
                    className={`w-full text-left px-4 py-2.5 text-sm transition-colors
                      ${level === l ? "bg-brand-500/20 text-brand-400 font-semibold" : "text-slate-400 hover:bg-white/5 hover:text-white"}`}
                  >
                    {LEVEL_LABELS[l] || l}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Results count */}
      {!isLoading && (
        <p className="text-slate-500 text-sm mb-4">
          {orders.length} order{orders.length !== 1 ? "s" : ""} available
        </p>
      )}

      {isLoading ? (
        <div className="grid md:grid-cols-2 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-52 glass rounded-2xl shimmer" />
          ))}
        </div>
      ) : orders.length === 0 ? (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-16 text-center">
          <FileText className="w-12 h-12 text-slate-700 mx-auto mb-3" />
          <p className="text-slate-300 font-semibold">No orders available right now</p>
          <p className="text-slate-500 text-sm mt-1">Check back soon — new orders are posted frequently.</p>
        </motion.div>
      ) : (
        <div className="space-y-6">
          {/* Emergency orders */}
          {emergencyOrders.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-emergency-400" />
                <h2 className="text-sm font-semibold text-emergency-400 uppercase tracking-wider">Emergency Orders</h2>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                {emergencyOrders.map((order, i) => (
                  <OrderCard key={order.id} order={order} index={i} onBid={() => setBidTarget(order)} />
                ))}
              </div>
            </div>
          )}

          {/* Regular orders */}
          {regularOrders.length > 0 && (
            <div className="space-y-3">
              {emergencyOrders.length > 0 && (
                <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Regular Orders</h2>
              )}
              <div className="grid md:grid-cols-2 gap-4">
                {regularOrders.map((order, i) => (
                  <OrderCard key={order.id} order={order} index={i} onBid={() => setBidTarget(order)} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Bid modal */}
      {bidTarget && (
        <BidModal
          order={bidTarget}
          onClose={() => setBidTarget(null)}
          onSuccess={() => qc.invalidateQueries({ queryKey: ["available-orders"] })}
        />
      )}
    </div>
  );
}

// ─── Order Card ───────────────────────────────────────────────────────────────
function OrderCard({
  order,
  index,
  onBid,
}: {
  order: AvailableOrder;
  index: number;
  onBid: () => void;
}) {
  const myProposal = order.proposals?.[0];
  const hasBid = !!myProposal;
  const writerEarnings = order.totalPrice * 0.8;

  const statusColors: Record<string, string> = {
    OPEN: "text-yellow-400 bg-yellow-500/10 border-yellow-500/30",
    UNCONFIRMED: "text-blue-400 bg-blue-500/10 border-blue-500/30",
    DECLINED: "text-red-400 bg-red-500/10 border-red-500/30",
    CANCELED: "text-slate-400 bg-slate-500/10 border-slate-500/30",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }}
      className={`glass-card p-5 flex flex-col gap-4 hover:border-white/20 transition-all
        ${order.isEmergency ? "border-emergency-500/30 bg-emergency-500/5" : ""}
        ${hasBid ? "border-brand-500/20" : ""}
      `}
    >
      {/* Top row */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap gap-1.5 mb-2">
            {order.isEmergency && (
              <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-emergency-500/20 text-emergency-400 border border-emergency-500/30">
                ⚡ EMERGENCY
              </span>
            )}
            <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-brand-500/10 border border-brand-500/20 text-brand-300">
              {order.category}
            </span>
            <span className="px-2 py-0.5 rounded-full text-xs bg-white/5 border border-white/10 text-slate-400">
              {LEVEL_LABELS[order.academicLevel] || order.academicLevel}
            </span>
          </div>
          <h3 className="text-white font-semibold text-sm leading-snug line-clamp-2">{order.title}</h3>
        </div>
        <div className="text-right flex-shrink-0">
          <p className="text-green-400 font-bold text-base">{formatPrice(writerEarnings)}</p>
          <p className="text-slate-500 text-xs">your cut</p>
        </div>
      </div>

      {/* Description */}
      <p className="text-slate-500 text-xs leading-relaxed line-clamp-2">{order.description}</p>

      {/* Meta */}
      <div className="flex items-center gap-3 text-xs text-slate-500">
        <span className="flex items-center gap-1">
          <BookOpen className="w-3.5 h-3.5" />
          {order.wordCount.toLocaleString()} words
        </span>
        <span className="flex items-center gap-1">
          <Clock className="w-3.5 h-3.5" />
          <CountdownTimer deadline={order.deadline} compact />
        </span>
        <span className="flex items-center gap-1 ml-auto">
          <Users className="w-3.5 h-3.5" />
          {order._count.proposals} bid{order._count.proposals !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Action row */}
      {hasBid ? (
        <div className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-semibold ${statusColors[myProposal.status] || statusColors.OPEN}`}>
          <CheckCircle2 className="w-3.5 h-3.5" />
          Your bid is {myProposal.status === "OPEN" ? "submitted & open" : myProposal.status.toLowerCase()}
        </div>
      ) : (
        <button
          onClick={onBid}
          className="btn-primary w-full py-2.5 text-sm gap-2"
        >
          <Send className="w-4 h-4" />
          Place Bid
        </button>
      )}
    </motion.div>
  );
}
