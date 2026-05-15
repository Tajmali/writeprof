"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  DollarSign, ArrowUpRight, ArrowDownLeft, Clock, CheckCircle,
  XCircle, Download, Filter, Search, Loader2, Wallet, FileText
} from "lucide-react";
import Link from "next/link";
import { formatPrice } from "@/lib/pricing";

interface Payment {
  id: string; amount: number; status: string; paidAt: string | null;
  createdAt: string; reference: string;
  order: { id: string; orderNumber: string; title: string };
}

interface Transaction {
  id: string; type: string; amount: number; status: string;
  description: string; reference: string; createdAt: string;
}

const PAYMENT_STATUS: Record<string, { label: string; color: string }> = {
  PENDING: { label: "Pending", color: "text-yellow-400 bg-yellow-500/20" },
  PAID: { label: "Paid", color: "text-green-400 bg-green-500/20" },
  ESCROW: { label: "In Escrow", color: "text-blue-400 bg-blue-500/20" },
  RELEASED: { label: "Released", color: "text-brand-400 bg-brand-500/20" },
  REFUNDED: { label: "Refunded", color: "text-orange-400 bg-orange-500/20" },
  FAILED: { label: "Failed", color: "text-red-400 bg-red-500/20" },
};

export default function ClientPaymentsPage() {
  const [tab, setTab] = useState<"payments" | "transactions">("payments");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const { data: walletData } = useQuery({
    queryKey: ["client-wallet"],
    queryFn: async () => {
      const res = await fetch("/api/auth/me");
      const json = await res.json();
      return json.data;
    },
  });

  const { data: paymentsData, isLoading } = useQuery({
    queryKey: ["client-payments", page, search],
    queryFn: async () => {
      const params = new URLSearchParams({ page: page.toString(), limit: "20", ...(search && { search }) });
      const res = await fetch(`/api/payments/history?${params}`);
      const json = await res.json();
      if (!json.success) return { data: { payments: [] }, pagination: { total: 0, totalPages: 1 } };
      return json;
    },
  });

  const payments: Payment[] = paymentsData?.data?.payments || [];
  const wallet = walletData?.wallet;
  const pagination = paymentsData?.pagination;

  const totalSpent = payments.filter(p => ["PAID", "ESCROW", "RELEASED"].includes(p.status))
    .reduce((sum, p) => sum + p.amount, 0);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Payment History</h1>
        <p className="text-gray-400 mt-1">Track all your payments and transactions</p>
      </div>

      {/* Wallet Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-5 col-span-1 sm:col-span-1">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-green-500/20 flex items-center justify-center">
              <Wallet className="w-5 h-5 text-green-400" />
            </div>
            <div>
              <p className="text-xs text-gray-400">Wallet Balance</p>
              <p className="text-xl font-bold text-green-400">{formatPrice(wallet?.balance || 0)}</p>
            </div>
          </div>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-brand-500/20 flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-brand-400" />
            </div>
            <div>
              <p className="text-xs text-gray-400">Total Spent</p>
              <p className="text-xl font-bold text-brand-400">{formatPrice(wallet?.totalSpent || 0)}</p>
            </div>
          </div>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-card p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
              <Clock className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <p className="text-xs text-gray-400">In Escrow</p>
              <p className="text-xl font-bold text-blue-400">
                {formatPrice(payments.filter(p => p.status === "ESCROW").reduce((s, p) => s + p.amount, 0))}
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Tabs + Search */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex gap-1 glass-card p-1">
          {[
            { id: "payments", label: "Payments" },
            { id: "transactions", label: "Transactions" },
          ].map(t => (
            <button key={t.id} onClick={() => setTab(t.id as typeof tab)}
              className={`px-5 py-2 rounded-lg text-sm font-medium transition-all ${tab === t.id ? "bg-brand-500 text-white" : "text-gray-400 hover:text-white"}`}>
              {t.label}
            </button>
          ))}
        </div>
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search by order number..."
            className="input-field pl-9 w-full"
          />
        </div>
      </div>

      {/* Table */}
      <div className="glass-card overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 text-brand-400 animate-spin" />
          </div>
        ) : payments.length === 0 ? (
          <div className="py-12 text-center">
            <DollarSign className="w-12 h-12 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400">No payment records yet</p>
            <Link href="/dashboard/new-order" className="btn-primary inline-flex mt-4 items-center gap-2 text-sm">
              Place Your First Order
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  {["Order", "Amount", "Status", "Date", "Reference"].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {payments.map((payment, i) => {
                  const config = PAYMENT_STATUS[payment.status] || PAYMENT_STATUS.PENDING;
                  return (
                    <motion.tr
                      key={payment.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.03 }}
                      className="hover:bg-white/3 transition-colors"
                    >
                      <td className="px-4 py-3">
                        <Link href={`/dashboard/orders/${payment.order.id}`} className="hover:text-brand-400 transition-colors">
                          <p className="text-sm font-medium text-white">{payment.order.title}</p>
                          <p className="text-xs text-gray-500 font-mono">{payment.order.orderNumber}</p>
                        </Link>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm font-bold text-white">{formatPrice(payment.amount)}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${config.color}`}>{config.label}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-xs text-gray-400">
                          {payment.paidAt ? new Date(payment.paidAt).toLocaleDateString() : new Date(payment.createdAt).toLocaleDateString()}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-xs text-gray-500 font-mono">{payment.reference?.slice(0, 16)}...</span>
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {pagination && pagination.totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-white/10">
            <p className="text-sm text-gray-400">Page {page} of {pagination.totalPages}</p>
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
