"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  FileText, Search, Filter, Clock, ChevronRight, Loader2,
  Zap, DollarSign, User, PenTool, Eye
} from "lucide-react";
import { formatPrice } from "@/lib/pricing";
import { CountdownTimer } from "@/components/dashboard/CountdownTimer";

interface Order {
  id: string; orderNumber: string; title: string; category: string;
  wordCount: number; urgency: string; status: string;
  isEmergency: boolean; deadline: string; totalPrice: number;
  createdAt: string;
  client: { id: string; name: string; email: string };
  writer: { user: { name: string } } | null;
  payment: { status: string; amount: number } | null;
  _count: { messages: number; submissions: number };
}

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  PENDING: { label: "Pending", color: "text-yellow-400 bg-yellow-500/20" },
  ASSIGNED: { label: "Assigned", color: "text-brand-400 bg-brand-500/20" },
  IN_PROGRESS: { label: "In Progress", color: "text-blue-400 bg-blue-500/20" },
  UNDER_REVIEW: { label: "Under Review", color: "text-purple-400 bg-purple-500/20" },
  REVISION: { label: "Revision", color: "text-orange-400 bg-orange-500/20" },
  COMPLETED: { label: "Completed", color: "text-green-400 bg-green-500/20" },
  CANCELLED: { label: "Cancelled", color: "text-red-400 bg-red-500/20" },
  DISPUTED: { label: "Disputed", color: "text-red-400 bg-red-500/20" },
};

const STATUSES = ["", "PENDING", "ASSIGNED", "IN_PROGRESS", "UNDER_REVIEW", "REVISION", "COMPLETED", "CANCELLED", "DISPUTED"];

export default function AdminOrdersPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [emergencyOnly, setEmergencyOnly] = useState(false);
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ["admin-orders", page, search, statusFilter, emergencyOnly],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: page.toString(), limit: "20",
        ...(search && { search }),
        ...(statusFilter && { status: statusFilter }),
        ...(emergencyOnly && { emergency: "true" }),
      });
      const res = await fetch(`/api/admin/orders?${params}`);
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      return json;
    },
  });

  const orders: Order[] = data?.data?.orders || [];
  const pagination = data?.pagination;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <FileText className="w-6 h-6 text-brand-400" /> All Orders
        </h1>
        <p className="text-gray-400 mt-1">{pagination?.total || 0} total orders</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search by title, order number, or client..."
            className="input-field pl-10 w-full"
          />
        </div>
        <select
          value={statusFilter}
          onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
          className="input-field sm:w-44"
        >
          {STATUSES.map(s => (
            <option key={s} value={s}>{s || "All Statuses"}</option>
          ))}
        </select>
        <button
          onClick={() => { setEmergencyOnly(!emergencyOnly); setPage(1); }}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium border transition-all ${
            emergencyOnly
              ? "bg-orange-500/20 border-orange-500/40 text-orange-400"
              : "glass border-white/20 text-gray-400 hover:text-white"
          }`}
        >
          <Zap className="w-4 h-4" /> Emergency Only
        </button>
      </div>

      {/* Table */}
      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px]">
            <thead>
              <tr className="border-b border-white/10">
                {["Order", "Client", "Writer", "Status", "Deadline", "Amount", ""].map((h, i) => (
                  <th key={i} className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {isLoading ? (
                <tr><td colSpan={7} className="text-center py-12"><Loader2 className="w-8 h-8 text-brand-400 animate-spin mx-auto" /></td></tr>
              ) : orders.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-12 text-gray-500">No orders found</td></tr>
              ) : (
                orders.map((order, i) => {
                  const config = STATUS_CONFIG[order.status] || STATUS_CONFIG.PENDING;
                  return (
                    <motion.tr
                      key={order.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.03 }}
                      className="hover:bg-white/3 transition-colors"
                    >
                      <td className="px-4 py-3">
                        <div>
                          <div className="flex items-center gap-1.5 mb-0.5">
                            <span className="text-xs text-gray-500 font-mono">{order.orderNumber}</span>
                            {order.isEmergency && (
                              <span className="px-1 py-0.5 rounded text-xs bg-orange-500/20 text-orange-400">⚡</span>
                            )}
                          </div>
                          <p className="text-sm font-medium text-white truncate max-w-[200px]">{order.title}</p>
                          <p className="text-xs text-gray-500">{order.category} · {order.wordCount}w</p>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <User className="w-3.5 h-3.5 text-gray-500" />
                          <div>
                            <p className="text-sm text-white">{order.client.name}</p>
                            <p className="text-xs text-gray-500">{order.client.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        {order.writer ? (
                          <div className="flex items-center gap-2">
                            <PenTool className="w-3.5 h-3.5 text-brand-400" />
                            <span className="text-sm text-white">{order.writer.user.name}</span>
                          </div>
                        ) : (
                          <span className="text-xs text-gray-500 italic">Unassigned</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${config.color}`}>
                          {config.label}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {["PENDING", "ASSIGNED", "IN_PROGRESS", "REVISION"].includes(order.status) ? (
                          <CountdownTimer deadline={order.deadline} compact />
                        ) : (
                          <span className="text-xs text-gray-500">{new Date(order.deadline).toLocaleDateString()}</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div>
                          <p className="text-sm font-semibold text-white">{formatPrice(order.totalPrice)}</p>
                          <p className={`text-xs ${order.payment?.status === "ESCROW" ? "text-green-400" : "text-gray-500"}`}>
                            {order.payment?.status || "Unpaid"}
                          </p>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <Link href={`/admin/orders/${order.id}`}
                          className="p-1.5 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white flex items-center gap-1 text-xs">
                          <Eye className="w-4 h-4" />
                        </Link>
                      </td>
                    </motion.tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {pagination && pagination.totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-white/10">
            <p className="text-sm text-gray-400">
              Showing {(page - 1) * 20 + 1}–{Math.min(page * 20, pagination.total)} of {pagination.total}
            </p>
            <div className="flex gap-2">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                className="btn-secondary text-sm px-3 py-1.5 disabled:opacity-50">← Prev</button>
              <button onClick={() => setPage(p => Math.min(pagination.totalPages, p + 1))} disabled={page === pagination.totalPages}
                className="btn-secondary text-sm px-3 py-1.5 disabled:opacity-50">Next →</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
