"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  Send, Clock, CheckCircle2, XCircle, FileText, AlertCircle,
  Loader2, ChevronDown, ChevronUp, X, BookOpen, Briefcase
} from "lucide-react";
import { formatPrice } from "@/lib/pricing";
import toast from "react-hot-toast";

// ─── Types ─────────────────────────────────────────────────────────────────────
type ProposalStatus = "OPEN" | "UNCONFIRMED" | "DECLINED" | "CANCELED";

interface Proposal {
  id: string;
  coverLetter: string;
  bidAmount: number | null;
  status: ProposalStatus;
  note: string | null;
  createdAt: string;
  order: {
    id: string;
    orderNumber: string;
    title: string;
    category: string;
    academicLevel: string;
    wordCount: number;
    totalPrice: number;
    deadline: string;
    status: string;
    isEmergency: boolean;
  };
}

// ─── Status config ──────────────────────────────────────────────────────────
const STATUS_CONFIG: Record<ProposalStatus, {
  label: string;
  color: string;
  bg: string;
  icon: React.ElementType;
  description: string;
}> = {
  OPEN: {
    label: "Open",
    color: "text-yellow-400",
    bg: "bg-yellow-500/10 border-yellow-500/30",
    icon: Clock,
    description: "Awaiting client decision",
  },
  UNCONFIRMED: {
    label: "Unconfirmed",
    color: "text-blue-400",
    bg: "bg-blue-500/10 border-blue-500/30",
    icon: AlertCircle,
    description: "Client is reviewing your bid",
  },
  DECLINED: {
    label: "Declined",
    color: "text-red-400",
    bg: "bg-red-500/10 border-red-500/30",
    icon: XCircle,
    description: "Not selected for this order",
  },
  CANCELED: {
    label: "Canceled",
    color: "text-slate-400",
    bg: "bg-slate-500/10 border-slate-500/30",
    icon: X,
    description: "You withdrew this bid",
  },
};

const LEVEL_LABELS: Record<string, string> = {
  HIGH_SCHOOL: "High School",
  UNDERGRADUATE: "Undergraduate",
  MASTERS: "Masters",
  PHD: "PhD",
  PROFESSIONAL: "Professional",
};

// ─── Proposal Card ────────────────────────────────────────────────────────────
function ProposalCard({
  proposal,
  index,
  onCancel,
}: {
  proposal: Proposal;
  index: number;
  onCancel: (id: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const cfg = STATUS_CONFIG[proposal.status];
  const StatusIcon = cfg.icon;
  const writerEarnings = (proposal.bidAmount ?? proposal.order.totalPrice) * 0.8;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06 }}
      className={`glass-card overflow-hidden transition-all ${
        proposal.status === "UNCONFIRMED" ? "border-blue-500/30 shadow-blue-500/5" : ""
      }`}
    >
      {/* Main row */}
      <div className="p-5 flex flex-col sm:flex-row sm:items-start gap-4">
        {/* Icon */}
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${cfg.bg}`}>
          <StatusIcon className={`w-5 h-5 ${cfg.color}`} />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Order badges */}
          <div className="flex flex-wrap gap-1.5 mb-2">
            {proposal.order.isEmergency && (
              <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-emergency-500/20 text-emergency-400 border border-emergency-500/30">
                ⚡ EMERGENCY
              </span>
            )}
            <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-brand-500/10 border border-brand-500/20 text-brand-300">
              {proposal.order.category}
            </span>
            <span className="px-2 py-0.5 rounded-full text-xs bg-white/5 border border-white/10 text-slate-400">
              {LEVEL_LABELS[proposal.order.academicLevel] || proposal.order.academicLevel}
            </span>
          </div>

          <p className="text-white font-semibold text-sm leading-snug mb-1 line-clamp-1">
            {proposal.order.title}
          </p>

          <div className="flex items-center gap-3 text-xs text-slate-500">
            <span className="font-mono">{proposal.order.orderNumber}</span>
            <span className="flex items-center gap-1">
              <BookOpen className="w-3 h-3" />
              {proposal.order.wordCount.toLocaleString()} words
            </span>
            <span>Submitted {new Date(proposal.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span>
          </div>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-3 sm:flex-col sm:items-end flex-shrink-0">
          {/* Earnings */}
          <div className="text-right">
            <p className="text-green-400 font-bold text-sm">{formatPrice(writerEarnings)}</p>
            <p className="text-slate-500 text-xs">your cut</p>
          </div>

          {/* Status badge */}
          <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-semibold ${cfg.bg} ${cfg.color}`}>
            <StatusIcon className="w-3 h-3" />
            {cfg.label}
          </div>
        </div>
      </div>

      {/* Expand / collapse cover letter */}
      <div className="border-t border-white/5">
        <button
          onClick={() => setExpanded((v) => !v)}
          className="w-full flex items-center justify-between px-5 py-2.5 text-xs text-slate-500 hover:text-slate-300 transition-colors"
        >
          <span>{cfg.description}</span>
          <div className="flex items-center gap-2">
            <span>Cover letter</span>
            {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </div>
        </button>

        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="px-5 pb-5 space-y-4">
                {/* Cover letter */}
                <div className="bg-white/3 border border-white/5 rounded-xl p-4">
                  <p className="text-slate-400 text-xs font-semibold uppercase tracking-wide mb-2">Your Cover Letter</p>
                  <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-wrap">{proposal.coverLetter}</p>
                </div>

                {/* Admin/client note (on decline) */}
                {proposal.note && (
                  <div className="bg-red-500/5 border border-red-500/20 rounded-xl p-4">
                    <p className="text-red-400 text-xs font-semibold uppercase tracking-wide mb-1">Feedback</p>
                    <p className="text-slate-300 text-sm">{proposal.note}</p>
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center gap-3">
                  <Link
                    href={`/writer-dashboard/orders`}
                    className="btn-secondary text-xs py-2 px-4 gap-1.5"
                  >
                    <Briefcase className="w-3.5 h-3.5" />
                    Browse More Orders
                  </Link>

                  {proposal.status === "OPEN" && (
                    <button
                      onClick={() => onCancel(proposal.id)}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-red-400 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 transition-all"
                    >
                      <X className="w-3.5 h-3.5" />
                      Withdraw Bid
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
type FilterTab = "ALL" | ProposalStatus;

const TABS: { key: FilterTab; label: string }[] = [
  { key: "ALL", label: "All" },
  { key: "OPEN", label: "Open" },
  { key: "UNCONFIRMED", label: "Unconfirmed" },
  { key: "DECLINED", label: "Declined" },
  { key: "CANCELED", label: "Canceled" },
];

export default function ProposalsPage() {
  const qc = useQueryClient();
  const [activeTab, setActiveTab] = useState<FilterTab>("ALL");

  // Fetch proposals
  const { data, isLoading } = useQuery({
    queryKey: ["proposals"],
    queryFn: async () => {
      const res = await fetch("/api/proposals");
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      return json.data.proposals as Proposal[];
    },
    refetchInterval: 30000,
  });

  // Cancel mutation
  const cancelMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/proposals/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "cancel" }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to cancel");
      return json;
    },
    onSuccess: () => {
      toast.success("Bid withdrawn");
      qc.invalidateQueries({ queryKey: ["proposals"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const proposals = data || [];

  // Counts per tab
  const counts: Record<FilterTab, number> = {
    ALL: proposals.length,
    OPEN: proposals.filter((p) => p.status === "OPEN").length,
    UNCONFIRMED: proposals.filter((p) => p.status === "UNCONFIRMED").length,
    DECLINED: proposals.filter((p) => p.status === "DECLINED").length,
    CANCELED: proposals.filter((p) => p.status === "CANCELED").length,
  };

  const filtered =
    activeTab === "ALL" ? proposals : proposals.filter((p) => p.status === activeTab);

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        {/* Header */}
        <div className="mb-8 flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white mb-1">My Proposals</h1>
            <p className="text-slate-400 text-sm">Track every bid you've submitted on available orders.</p>
          </div>
          <Link href="/writer-dashboard/orders" className="btn-primary text-sm gap-2 flex-shrink-0">
            <Briefcase className="w-4 h-4" />
            Browse Orders
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Total Bids", value: counts.ALL, gradient: "from-brand-600 to-brand-400" },
            { label: "Open", value: counts.OPEN, gradient: "from-yellow-600 to-yellow-400" },
            { label: "Unconfirmed", value: counts.UNCONFIRMED, gradient: "from-blue-600 to-blue-400" },
            { label: "Declined", value: counts.DECLINED, gradient: "from-red-600 to-red-400" },
          ].map((s) => (
            <div key={s.label} className="glass-card p-4 text-center">
              <div className={`text-3xl font-extrabold bg-gradient-to-r ${s.gradient} bg-clip-text text-transparent`}>
                {isLoading ? "–" : s.value}
              </div>
              <p className="text-slate-400 text-xs mt-1">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1 p-1 bg-slate-900/60 border border-white/5 rounded-2xl mb-6 overflow-x-auto">
          {TABS.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`relative flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-semibold whitespace-nowrap transition-all duration-200 flex-shrink-0
                ${activeTab === key
                  ? "bg-brand-600 text-white shadow-lg shadow-brand-600/30"
                  : "text-slate-400 hover:text-white hover:bg-white/5"
                }`}
            >
              {label}
              {counts[key] > 0 && (
                <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold
                  ${activeTab === key ? "bg-white/20 text-white" : "bg-white/10 text-slate-400"}`}>
                  {counts[key]}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 glass rounded-2xl shimmer" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-16 text-center">
            <Send className="w-12 h-12 text-slate-600 mx-auto mb-4" />
            <p className="text-slate-300 font-semibold">
              {activeTab === "ALL" ? "No proposals yet" : `No ${activeTab.toLowerCase()} proposals`}
            </p>
            <p className="text-slate-500 text-sm mt-1">
              {activeTab === "ALL"
                ? "Browse available orders and submit your first bid."
                : "They will appear here when available."}
            </p>
            {activeTab === "ALL" && (
              <Link href="/writer-dashboard/orders" className="btn-primary mt-5 inline-flex gap-2">
                <Briefcase className="w-4 h-4" />
                Browse Available Orders
              </Link>
            )}
          </motion.div>
        ) : (
          <div className="space-y-3">
            {filtered.map((proposal, i) => (
              <ProposalCard
                key={proposal.id}
                proposal={proposal}
                index={i}
                onCancel={(id) => cancelMutation.mutate(id)}
              />
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}
