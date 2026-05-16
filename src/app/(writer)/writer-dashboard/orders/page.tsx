"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  ArrowRight, Search, Clock, BookOpen, CheckCircle2,
  XCircle, Loader2, RotateCcw, Eye, AlertCircle
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { CountdownTimer } from "@/components/dashboard/CountdownTimer";
import { formatPrice } from "@/lib/pricing";
import toast from "react-hot-toast";
import type { Order } from "@/types";

// ─── API helpers ────────────────────────────────────────────────────────────

async function fetchOrdersByStatus(statuses: string[]) {
  const params = statuses.map((s) => `status=${s}`).join("&");
  const res = await fetch(`/api/orders?${params}&limit=50`);
  const data = await res.json();
  return data.data?.orders || [];
}

// ─── Config ──────────────────────────────────────────────────────────────────

const MAIN_TABS = [
  { key: "inprogress", label: "In Progress", icon: Loader2 },
  { key: "completed",  label: "Completed",   icon: CheckCircle2 },
  { key: "cancelled",  label: "Cancelled",   icon: XCircle },
] as const;

type MainTab = typeof MAIN_TABS[number]["key"];

const SUB_FILTERS = [
  { key: "ALL",         label: "All" },
  { key: "IN_PROGRESS", label: "In Progress" },
  { key: "IN_REVIEW",   label: "In Review" },
  { key: "IN_REVISION", label: "In Revision" },
] as const;

type SubFilter = typeof SUB_FILTERS[number]["key"];

const STATUS_BADGE: Record<string, { label: string; color: string; bg: string; icon: React.ElementType }> = {
  IN_PROGRESS: { label: "In Progress", color: "text-brand-400",  bg: "bg-brand-500/10 border-brand-500/20",   icon: Loader2 },
  IN_REVIEW:   { label: "In Review",   color: "text-yellow-400", bg: "bg-yellow-500/10 border-yellow-500/20", icon: Eye },
  IN_REVISION: { label: "In Revision", color: "text-violet-400", bg: "bg-violet-500/10 border-violet-500/20", icon: RotateCcw },
  COMPLETED:   { label: "Completed",   color: "text-green-400",  bg: "bg-green-500/10 border-green-500/20",   icon: CheckCircle2 },
  CANCELLED:   { label: "Cancelled",   color: "text-red-400",    bg: "bg-red-500/10 border-red-500/20",       icon: XCircle },
  PENDING:     { label: "Pending",     color: "text-slate-400",  bg: "bg-slate-500/10 border-slate-500/20",   icon: AlertCircle },
};

// ─── Component ───────────────────────────────────────────────────────────────

export default function WriterOrdersPage() {
  const qc = useQueryClient();
  const [mainTab, setMainTab]   = useState<MainTab>("inprogress");
  const [subFilter, setSubFilter] = useState<SubFilter>("ALL");
  const [search, setSearch]     = useState("");

  // Decide which statuses to fetch based on active main tab
  const statusMap: Record<MainTab, string[]> = {
    inprogress: ["IN_PROGRESS", "IN_REVIEW", "IN_REVISION"],
    completed:  ["COMPLETED"],
    cancelled:  ["CANCELLED"],
  };

  const { data: orders = [], isLoading } = useQuery<Order[]>({
    queryKey: ["writer-orders", mainTab],
    queryFn: () => fetchOrdersByStatus(statusMap[mainTab]),
    refetchInterval: 30000,
  });

  const acceptMutation = useMutation({
    mutationFn: async (orderId: string) => {
      const res  = await fetch(`/api/orders/${orderId}/accept`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      return data;
    },
    onSuccess: () => {
      toast.success("Order accepted! Start working.");
      qc.invalidateQueries({ queryKey: ["writer-orders"] });
    },
    onError: (e: Error) => toast.error(e.message || "Failed to accept order"),
  });

  // Apply sub-filter + search
  const filtered = orders.filter((o: Order) => {
    const matchSub    = mainTab !== "inprogress" || subFilter === "ALL" || o.status === subFilter;
    const matchSearch = !search ||
      o.title.toLowerCase().includes(search.toLowerCase()) ||
      o.category.toLowerCase().includes(search.toLowerCase());
    return matchSub && matchSearch;
  });

  // Counts per sub-filter
  const subCounts: Record<SubFilter, number> = {
    ALL:         orders.length,
    IN_PROGRESS: orders.filter((o: Order) => o.status === "IN_PROGRESS").length,
    IN_REVIEW:   orders.filter((o: Order) => o.status === "IN_REVIEW").length,
    IN_REVISION: orders.filter((o: Order) => o.status === "IN_REVISION").length,
  };

  const handleMainTab = (tab: MainTab) => {
    setMainTab(tab);
    setSubFilter("ALL");
    setSearch("");
  };

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">

      {/* Page title */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">My Orders</h1>
        <p className="text-slate-400 text-sm mt-1">Track and manage all your writing assignments.</p>
      </div>

      {/* ── Main segment tabs ─────────────────────────────────────────────── */}
      <div className="flex items-center gap-2 p-1 bg-slate-900/60 border border-white/5 rounded-2xl mb-6 w-fit">
        {MAIN_TABS.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => handleMainTab(key)}
            className={`relative flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200
              ${mainTab === key
                ? "bg-brand-600 text-white shadow-lg shadow-brand-600/30"
                : "text-slate-400 hover:text-white hover:bg-white/5"
              }`}
          >
            <Icon className={`w-4 h-4 ${mainTab === key && key === "inprogress" ? "animate-spin" : ""}`}
              style={mainTab === key && key === "inprogress" ? { animationDuration: "3s" } : {}} />
            {label}
            {key === "inprogress" && orders.length > 0 && mainTab !== "inprogress" && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-brand-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                {orders.length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ── Single search bar ──────────────────────────────────────────────── */}
      <div className="relative mb-5">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by title or category..."
          className="input-field pl-9 w-full max-w-sm"
        />
      </div>

      {/* ── Sub-filters (only for In Progress tab) ─────────────────────────── */}
      <AnimatePresence>
        {mainTab === "inprogress" && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="flex items-center gap-2 mb-5 overflow-hidden"
          >
            {SUB_FILTERS.map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setSubFilter(key)}
                className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold border transition-all
                  ${subFilter === key
                    ? "bg-white/10 border-white/20 text-white"
                    : "border-white/5 text-slate-500 hover:text-slate-300 hover:border-white/10"
                  }`}
              >
                {label}
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold
                  ${subFilter === key ? "bg-white/20 text-white" : "bg-white/5 text-slate-600"}`}>
                  {subCounts[key]}
                </span>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>


      {/* ── Order cards ────────────────────────────────────────────────────── */}
      {isLoading ? (
        <div className="grid md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-48 glass rounded-xl shimmer" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-16 text-center"
        >
          {mainTab === "inprogress"  && <Loader2 className="w-12 h-12 text-slate-700 mx-auto mb-3" />}
          {mainTab === "completed"   && <CheckCircle2 className="w-12 h-12 text-slate-700 mx-auto mb-3" />}
          {mainTab === "cancelled"   && <XCircle className="w-12 h-12 text-slate-700 mx-auto mb-3" />}
          <p className="text-slate-400 font-medium">
            {mainTab === "inprogress" ? "No active orders right now" :
             mainTab === "completed"  ? "No completed orders yet"    :
             "No cancelled orders"}
          </p>
          <p className="text-slate-600 text-sm mt-1">
            {mainTab === "inprogress" ? "Accept an available order to get started." : "They'll appear here once available."}
          </p>
        </motion.div>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {filtered.map((order: Order, i) => {
            const badge = STATUS_BADGE[order.status] || STATUS_BADGE["PENDING"];
            const StatusIcon = badge.icon;
            return (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="glass-card p-5 hover:border-white/20 transition-all"
              >
                {/* Header */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex-1">
                    <div className="flex flex-wrap gap-1.5 mb-2">
                      {order.isEmergency && (
                        <span className="badge bg-emergency-500/20 text-emergency-400 border-emergency-500/30 text-xs">
                          ⚡ EMERGENCY
                        </span>
                      )}
                      <span className="badge-blue text-xs">{order.category}</span>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-slate-400">
                        {order.academicLevel?.replace(/_/g, " ")}
                      </span>
                    </div>
                    <h3 className="text-white font-semibold text-sm leading-snug line-clamp-2">
                      {order.title}
                    </h3>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-white font-bold">{formatPrice(order.totalPrice * 0.8)}</p>
                    <p className="text-slate-500 text-xs">your earnings</p>
                  </div>
                </div>

                {/* Description */}
                <p className="text-slate-500 text-xs mb-3 line-clamp-2">{order.description}</p>

                {/* Metadata row */}
                <div className="flex items-center gap-3 text-xs text-slate-500 mb-4">
                  <div className="flex items-center gap-1">
                    <BookOpen className="w-3.5 h-3.5" />
                    {order.wordCount?.toLocaleString()} words
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    <CountdownTimer deadline={order.deadline} compact />
                  </div>
                  {/* Status badge */}
                  <div className={`ml-auto flex items-center gap-1 px-2.5 py-1 rounded-full border text-xs font-semibold ${badge.bg} ${badge.color}`}>
                    <StatusIcon className="w-3 h-3" />
                    {badge.label}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <Link
                    href={`/writer-dashboard/work/${order.id}`}
                    className="btn-secondary flex-1 text-xs py-2 text-center"
                  >
                    View Details
                  </Link>
                  {order.status === "PENDING" && (
                    <button
                      onClick={() => acceptMutation.mutate(order.id)}
                      disabled={acceptMutation.isPending}
                      className="btn-primary flex-1 text-xs py-2"
                    >
                      {acceptMutation.isPending ? (
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        <>Accept <ArrowRight className="w-3.5 h-3.5" /></>
                      )}
                    </button>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
