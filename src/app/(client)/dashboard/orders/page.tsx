"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { FileText, Search, Filter, Clock, ChevronRight, Plus, Download } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { CountdownTimer } from "@/components/dashboard/CountdownTimer";
import { formatPrice, getTimeRemaining } from "@/lib/pricing";
import type { Order } from "@/types";

const STATUS_FILTERS = ["All", "PENDING", "ASSIGNED", "IN_PROGRESS", "COMPLETED", "CANCELLED"];

const STATUS_DISPLAY: Record<string, { label: string; className: string }> = {
  PENDING: { label: "Pending", className: "badge-orange" },
  ASSIGNED: { label: "Assigned", className: "badge-blue" },
  IN_PROGRESS: { label: "In Progress", className: "badge-blue" },
  UNDER_REVIEW: { label: "Under Review", className: "badge-purple" },
  REVISION_REQUESTED: { label: "Revision", className: "badge-orange" },
  COMPLETED: { label: "Completed", className: "badge-green" },
  CANCELLED: { label: "Cancelled", className: "badge-red" },
  DISPUTED: { label: "Disputed", className: "badge-red" },
};

async function fetchOrders(status: string, page: number) {
  const params = new URLSearchParams({ page: String(page), limit: "15" });
  if (status !== "All") params.set("status", status);
  const res = await fetch(`/api/orders?${params}`);
  const data = await res.json();
  return { orders: data.data?.orders || [], total: data.pagination?.total || 0, totalPages: data.pagination?.totalPages || 1 };
}

export default function OrdersPage() {
  const [statusFilter, setStatusFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ["orders", statusFilter, page],
    queryFn: () => fetchOrders(statusFilter, page),
  });

  const orders = data?.orders || [];
  const filtered = search
    ? orders.filter((o: Order) =>
        o.title.toLowerCase().includes(search.toLowerCase()) ||
        o.orderNumber.toLowerCase().includes(search.toLowerCase())
      )
    : orders;

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-white">My Orders</h1>
              <p className="text-slate-400 text-sm mt-0.5">{data?.total || 0} total orders</p>
            </div>
            <Link href="/dashboard/new-order" className="btn-primary text-sm">
              <Plus className="w-4 h-4" /> New Order
            </Link>
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by title or order number..." className="input-field pl-9" />
            </div>
            <div className="flex gap-2 overflow-x-auto scrollbar-hide">
              {STATUS_FILTERS.map((s) => (
                <button
                  key={s}
                  onClick={() => { setStatusFilter(s); setPage(1); }}
                  className={`px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                    statusFilter === s ? "bg-brand-500 text-white" : "bg-white/5 text-slate-400 hover:bg-white/10"
                  }`}
                >
                  {s === "All" ? "All Orders" : STATUS_DISPLAY[s]?.label || s}
                </button>
              ))}
            </div>
          </div>

          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => <div key={i} className="h-24 glass rounded-xl shimmer" />)}
            </div>
          ) : filtered.length === 0 ? (
            <div className="glass-card p-16 text-center">
              <FileText className="w-12 h-12 text-slate-700 mx-auto mb-3" />
              <p className="text-slate-400 font-medium">No orders found</p>
              <p className="text-slate-600 text-sm mt-1">
                {search ? "Try adjusting your search" : "Submit your first order to get started"}
              </p>
              {!search && (
                <Link href="/dashboard/new-order" className="btn-primary inline-flex mt-4 text-sm">
                  <Plus className="w-4 h-4" /> New Order
                </Link>
              )}
            </div>
          ) : (
            <>
              <div className="space-y-3">
                {filtered.map((order: Order, i) => {
                  const timeLeft = getTimeRemaining(order.deadline);
                  const statusInfo = STATUS_DISPLAY[order.status] || { label: order.status, className: "badge-blue" };
                  return (
                    <motion.div
                      key={order.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                    >
                      <Link
                        href={`/dashboard/orders/${order.id}`}
                        className="flex items-start gap-4 p-5 glass rounded-xl hover:border-brand-500/30 transition-all duration-200 group"
                      >
                        {/* Status indicator */}
                        <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center mt-0.5">
                          <FileText className="w-5 h-5 text-slate-500 group-hover:text-brand-400 transition-colors" />
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <span className={`badge ${statusInfo.className} text-xs`}>
                              {statusInfo.label}
                            </span>
                            {order.isEmergency && (
                              <span className="badge bg-emergency-500/20 text-emergency-400 border-emergency-500/30 text-xs">
                                ⚡ Emergency
                              </span>
                            )}
                          </div>
                          <p className="text-white font-medium truncate group-hover:text-brand-300 transition-colors">
                            {order.title}
                          </p>
                          <div className="flex items-center gap-3 mt-1 flex-wrap text-xs text-slate-500">
                            <span>#{order.orderNumber}</span>
                            <span>·</span>
                            <span>{order.category}</span>
                            <span>·</span>
                            <span>{order.wordCount.toLocaleString()} words</span>
                            <span>·</span>
                            <span>{new Date(order.createdAt).toLocaleDateString()}</span>
                          </div>
                        </div>

                        {/* Right side */}
                        <div className="flex-shrink-0 text-right">
                          <p className="text-white font-semibold">{formatPrice(order.totalPrice)}</p>
                          {!["COMPLETED", "CANCELLED"].includes(order.status) ? (
                            <div className={`text-xs mt-0.5 ${timeLeft.isUrgent ? "text-orange-400" : "text-slate-500"}`}>
                              {timeLeft.label} left
                            </div>
                          ) : (
                            <p className="text-slate-500 text-xs mt-0.5">
                              {order.status === "COMPLETED" ? "Delivered" : "Cancelled"}
                            </p>
                          )}
                        </div>

                        <ChevronRight className="w-4 h-4 text-slate-700 group-hover:text-brand-400 transition-all flex-shrink-0 mt-1" />
                      </Link>
                    </motion.div>
                  );
                })}
              </div>

              {/* Pagination */}
              {(data?.totalPages || 1) > 1 && (
                <div className="flex items-center justify-center gap-2 mt-6">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="btn-ghost px-3 py-1.5 text-sm disabled:opacity-50"
                  >
                    ← Prev
                  </button>
                  <span className="text-slate-400 text-sm">Page {page} of {data?.totalPages}</span>
                  <button
                    onClick={() => setPage((p) => Math.min(data?.totalPages || 1, p + 1))}
                    disabled={page === data?.totalPages}
                    className="btn-ghost px-3 py-1.5 text-sm disabled:opacity-50"
                  >
                    Next →
                  </button>
                </div>
              )}
            </>
          )}
    </div>
  );
}
