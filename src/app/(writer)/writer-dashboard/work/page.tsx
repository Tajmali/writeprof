"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  FileText, Clock, CheckCircle, AlertTriangle, Search, Filter,
  ChevronRight, Zap, Star, ArrowRight, Loader2, BookOpen, Eye
} from "lucide-react";
import { CountdownTimer } from "@/components/dashboard/CountdownTimer";
import { formatPrice } from "@/lib/pricing";
import toast from "react-hot-toast";

interface Order {
  id: string; orderNumber: string; title: string; category: string;
  wordCount: number; urgency: string; academicLevel: string;
  status: string; isEmergency: boolean; deadline: string; totalPrice: number;
  revisionCount: number; maxRevisions: number;
  client: { id: string; name: string; avatar: string | null };
  _count: { messages: number; submissions: number };
}

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  ASSIGNED: { label: "Assigned", color: "text-brand-400", bg: "bg-brand-500/20" },
  IN_PROGRESS: { label: "In Progress", color: "text-blue-400", bg: "bg-blue-500/20" },
  UNDER_REVIEW: { label: "Under Review", color: "text-yellow-400", bg: "bg-yellow-500/20" },
  REVISION: { label: "Revision Needed", color: "text-orange-400", bg: "bg-orange-500/20" },
  COMPLETED: { label: "Completed", color: "text-green-400", bg: "bg-green-500/20" },
};

export default function WriterWorkPage() {
  const queryClient = useQueryClient();
  const [tab, setTab] = useState<"active" | "completed">("active");
  const [search, setSearch] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["writer-orders", tab],
    queryFn: async () => {
      const statuses = tab === "active"
        ? "ASSIGNED,IN_PROGRESS,UNDER_REVIEW,REVISION"
        : "COMPLETED";
      const res = await fetch(`/api/orders?status=${statuses}&limit=50`);
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      return json.data.orders as Order[];
    },
    refetchInterval: 15000,
  });

  const filtered = data?.filter(o =>
    !search ||
    o.title.toLowerCase().includes(search.toLowerCase()) ||
    o.orderNumber.toLowerCase().includes(search.toLowerCase()) ||
    o.category.toLowerCase().includes(search.toLowerCase())
  ) || [];

  const active = filtered.filter(o => ["ASSIGNED", "IN_PROGRESS", "REVISION"].includes(o.status));
  const review = filtered.filter(o => o.status === "UNDER_REVIEW");
  const completed = filtered.filter(o => o.status === "COMPLETED");

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">My Work</h1>
        <p className="text-gray-400 mt-1">Manage your active and completed orders</p>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Active Orders", value: data?.filter(o => ["ASSIGNED", "IN_PROGRESS", "REVISION"].includes(o.status)).length || 0, color: "text-brand-400" },
          { label: "Under Review", value: data?.filter(o => o.status === "UNDER_REVIEW").length || 0, color: "text-yellow-400" },
          { label: "Completed", value: data?.filter(o => o.status === "COMPLETED").length || 0, color: "text-green-400" },
        ].map(stat => (
          <div key={stat.label} className="glass-card p-4 text-center">
            <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
            <p className="text-xs text-gray-400 mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search orders..."
            className="input-field pl-10 w-full"
          />
        </div>
        <div className="flex gap-1 glass-card p-1">
          {[
            { id: "active", label: "Active" },
            { id: "completed", label: "Completed" },
          ].map(t => (
            <button key={t.id} onClick={() => setTab(t.id as typeof tab)}
              className={`px-5 py-2 rounded-lg text-sm font-medium transition-all ${
                tab === t.id ? "bg-brand-500 text-white" : "text-gray-400 hover:text-white"
              }`}>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-8 h-8 text-brand-400 animate-spin" />
        </div>
      ) : (
        <div className="space-y-6">
          {tab === "active" && (
            <>
              {/* Revision Alert */}
              {active.filter(o => o.status === "REVISION").length > 0 && (
                <div className="glass-card p-4 border border-orange-500/30 bg-orange-500/5">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="w-4 h-4 text-orange-400" />
                    <span className="text-sm font-semibold text-orange-400">Revision Requested</span>
                  </div>
                  <p className="text-xs text-gray-400">You have orders that need revision. Click on them to see client feedback.</p>
                </div>
              )}

              {/* Active Orders */}
              {active.length > 0 ? (
                <div className="space-y-3">
                  <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Active ({active.length})</h2>
                  {active.map((order, i) => (
                    <OrderCard key={order.id} order={order} index={i} />
                  ))}
                </div>
              ) : (
                <EmptyState
                  icon={BookOpen}
                  title="No active orders"
                  desc="Check the available orders tab to find new work"
                  action={{ label: "Browse Available Orders", href: "/writer-dashboard/orders" }}
                />
              )}

              {/* Under Review */}
              {review.length > 0 && (
                <div className="space-y-3">
                  <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Under Review ({review.length})</h2>
                  {review.map((order, i) => (
                    <OrderCard key={order.id} order={order} index={i} />
                  ))}
                </div>
              )}
            </>
          )}

          {tab === "completed" && (
            completed.length > 0 ? (
              <div className="space-y-3">
                <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Completed ({completed.length})</h2>
                {completed.map((order, i) => (
                  <OrderCard key={order.id} order={order} index={i} />
                ))}
              </div>
            ) : (
              <EmptyState
                icon={CheckCircle}
                title="No completed orders yet"
                desc="Completed orders will appear here once approved by clients"
              />
            )
          )}
        </div>
      )}
    </div>
  );
}

function OrderCard({ order, index }: { order: Order; index: number }) {
  const config = STATUS_CONFIG[order.status] || STATUS_CONFIG.ASSIGNED;
  const isUrgent = new Date(order.deadline).getTime() - Date.now() < 3 * 60 * 60 * 1000;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
    >
      <Link href={`/writer-dashboard/work/${order.id}`}>
        <div className={`glass-card p-5 hover:border-brand-500/30 transition-all cursor-pointer group ${
          order.status === "REVISION" ? "border-orange-500/30" : ""
        }`}>
          <div className="flex items-start gap-4">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
              order.status === "COMPLETED" ? "bg-green-500/20" :
              order.status === "REVISION" ? "bg-orange-500/20" :
              order.status === "UNDER_REVIEW" ? "bg-yellow-500/20" : "bg-brand-500/20"
            }`}>
              {order.status === "COMPLETED" ? <CheckCircle className="w-5 h-5 text-green-400" /> :
               order.status === "REVISION" ? <AlertTriangle className="w-5 h-5 text-orange-400" /> :
               order.status === "UNDER_REVIEW" ? <Eye className="w-5 h-5 text-yellow-400" /> :
               <FileText className="w-5 h-5 text-brand-400" />}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <span className="text-xs text-gray-500 font-mono">{order.orderNumber}</span>
                {order.isEmergency && (
                  <span className="px-1.5 py-0.5 rounded text-xs font-bold bg-orange-500/20 text-orange-400">⚡ EMERGENCY</span>
                )}
                <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${config.bg} ${config.color}`}>
                  {config.label}
                </span>
                {isUrgent && order.status !== "COMPLETED" && (
                  <span className="px-1.5 py-0.5 rounded text-xs font-bold bg-red-500/20 text-red-400 animate-pulse">URGENT</span>
                )}
              </div>
              <h3 className="font-semibold text-white group-hover:text-brand-300 transition-colors truncate">{order.title}</h3>
              <p className="text-sm text-gray-400 mt-0.5">{order.category} • {order.wordCount.toLocaleString()} words • {order.academicLevel}</p>

              <div className="flex items-center gap-4 mt-3">
                {order.status !== "COMPLETED" && (
                  <CountdownTimer deadline={order.deadline} compact />
                )}
                <span className="text-xs text-gray-500">Client: {order.client.name}</span>
                <span className="text-xs text-gray-500">{order._count.messages} messages</span>
                <span className="text-xs text-gray-500">{order._count.submissions} submission(s)</span>
              </div>
            </div>

            <div className="text-right shrink-0">
              <p className="font-bold text-brand-400">{formatPrice(order.totalPrice * 0.8)}</p>
              <p className="text-xs text-gray-500">earnings</p>
              <ChevronRight className="w-5 h-5 text-gray-600 group-hover:text-brand-400 transition-colors mt-2 ml-auto" />
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

function EmptyState({ icon: Icon, title, desc, action }: {
  icon: React.ElementType; title: string; desc: string;
  action?: { label: string; href: string };
}) {
  return (
    <div className="glass-card p-12 text-center">
      <Icon className="w-12 h-12 text-gray-600 mx-auto mb-4" />
      <h3 className="font-semibold text-white mb-2">{title}</h3>
      <p className="text-sm text-gray-400 mb-4">{desc}</p>
      {action && (
        <Link href={action.href} className="btn-primary inline-flex items-center gap-2">
          {action.label} <ArrowRight className="w-4 h-4" />
        </Link>
      )}
    </div>
  );
}
