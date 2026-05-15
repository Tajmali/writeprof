"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Search, Clock, DollarSign, BookOpen } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { CountdownTimer } from "@/components/dashboard/CountdownTimer";
import { formatPrice } from "@/lib/pricing";
import toast from "react-hot-toast";
import type { Order } from "@/types";

async function fetchAvailableOrders() {
  const res = await fetch("/api/orders?status=PENDING&limit=20");
  const data = await res.json();
  return data.data?.orders || [];
}

export default function WriterOrdersPage() {
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");

  const { data: orders = [], isLoading } = useQuery<Order[]>({
    queryKey: ["available-orders"],
    queryFn: fetchAvailableOrders,
    refetchInterval: 30000,
  });

  const acceptMutation = useMutation({
    mutationFn: async (orderId: string) => {
      const res = await fetch(`/api/orders/${orderId}/accept`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      return data;
    },
    onSuccess: () => {
      toast.success("Order accepted! Start working.");
      qc.invalidateQueries({ queryKey: ["available-orders"] });
    },
    onError: (e: Error) => toast.error(e.message || "Failed to accept order"),
  });

  const filtered = orders.filter((o: Order) => {
    const matchSearch = !search || o.title.toLowerCase().includes(search.toLowerCase()) || o.category.toLowerCase().includes(search.toLowerCase());
    const matchCategory = categoryFilter === "All" || o.category === categoryFilter;
    return matchSearch && matchCategory;
  });

  const categories = ["All", ...Array.from(new Set(orders.map((o: Order) => o.category)))];

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-white">Available Orders</h1>
            <p className="text-slate-400 text-sm mt-1">{filtered.length} orders available — accept one to start earning</p>
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search orders..."
                className="input-field pl-9"
              />
            </div>
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
              {categories.slice(0, 6).map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategoryFilter(cat)}
                  className={`px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                    categoryFilter === cat ? "bg-brand-500 text-white" : "bg-white/5 text-slate-400 hover:bg-white/10"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {isLoading ? (
            <div className="grid md:grid-cols-2 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-48 glass rounded-xl shimmer" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="glass-card p-12 text-center">
              <BookOpen className="w-12 h-12 text-slate-700 mx-auto mb-3" />
              <p className="text-slate-400 font-medium">No orders match your filters</p>
              <p className="text-slate-600 text-sm mt-1">Try adjusting your search or check back soon</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-4">
              {filtered.map((order: Order, i) => (
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
                          {order.academicLevel.replace(/_/g, " ")}
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

                  {/* Metadata */}
                  <div className="flex items-center gap-3 text-xs text-slate-500 mb-4">
                    <div className="flex items-center gap-1">
                      <BookOpen className="w-3.5 h-3.5" />
                      {order.wordCount.toLocaleString()} words
                    </div>
                    <div className="flex items-center gap-1">
                      <DollarSign className="w-3.5 h-3.5" />
                      {formatPrice(order.totalPrice)}
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      <CountdownTimer deadline={order.deadline} compact />
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Link
                      href={`/writer-dashboard/orders/${order.id}`}
                      className="btn-secondary flex-1 text-xs py-2 text-center"
                    >
                      View Details
                    </Link>
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
                  </div>
                </motion.div>
              ))}
            </div>
          )}
    </div>
  );
}
