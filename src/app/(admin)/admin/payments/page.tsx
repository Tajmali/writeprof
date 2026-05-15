"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  DollarSign, Search, ArrowUpRight, ArrowDownLeft, Clock,
  CheckCircle, XCircle, Loader2, TrendingUp, Wallet, AlertTriangle
} from "lucide-react";
import { formatPrice } from "@/lib/pricing";

interface Transaction {
  id: string; type: string; amount: number; status: string;
  reference: string; description: string; createdAt: string;
  user: { name: string; email: string };
}

interface PaymentStats {
  totalRevenue: number; totalPlatformEarnings: number;
  pendingPayouts: number; successfulTransactions: number;
}

export default function AdminPaymentsPage() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const { data: stats } = useQuery({
    queryKey: ["admin-payment-stats"],
    queryFn: async () => {
      const res = await fetch("/api/admin/stats");
      const json = await res.json();
      return json.data as PaymentStats;
    },
  });

  const { data: txData, isLoading } = useQuery({
    queryKey: ["admin-transactions", page, search],
    queryFn: async () => {
      const params = new URLSearchParams({ page: page.toString(), limit: "20", ...(search && { search }) });
      const res = await fetch(`/api/admin/transactions?${params}`);
      const json = await res.json();
      if (!json.success) return { data: { transactions: [] }, pagination: { total: 0, totalPages: 1 } };
      return json;
    },
  });

  const transactions: Transaction[] = txData?.data?.transactions || [];
  const pagination = txData?.pagination;

  const summaryCards = [
    { label: "Total Revenue", value: formatPrice(stats?.totalRevenue || 0), icon: DollarSign, color: "text-green-400", bg: "bg-green-500/10" },
    { label: "Platform Earnings (20%)", value: formatPrice(stats?.totalPlatformEarnings || 0), icon: TrendingUp, color: "text-brand-400", bg: "bg-brand-500/10" },
    { label: "Pending Payouts", value: formatPrice(stats?.pendingPayouts || 0), icon: Clock, color: "text-yellow-400", bg: "bg-yellow-500/10" },
    { label: "Transactions", value: (stats?.successfulTransactions || 0).toString(), icon: CheckCircle, color: "text-purple-400", bg: "bg-purple-500/10" },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <Wallet className="w-6 h-6 text-brand-400" /> Payments & Transactions
        </h1>
        <p className="text-gray-400 mt-1">Financial overview and transaction history</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {summaryCards.map((card, i) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className={`glass-card p-4 ${card.bg}`}
          >
            <card.icon className={`w-6 h-6 ${card.color} mb-2`} />
            <p className={`text-2xl font-bold ${card.color}`}>{card.value}</p>
            <p className="text-xs text-gray-400 mt-1">{card.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Transactions Table */}
      <div className="glass-card overflow-hidden">
        <div className="p-4 border-b border-white/10">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <h3 className="font-semibold text-white">Transaction History</h3>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                value={search}
                onChange={e => { setSearch(e.target.value); setPage(1); }}
                placeholder="Search transactions..."
                className="input-field pl-9 text-sm w-64"
              />
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                {["User", "Type", "Amount", "Status", "Reference", "Date"].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {isLoading ? (
                <tr><td colSpan={6} className="text-center py-12"><Loader2 className="w-8 h-8 text-brand-400 animate-spin mx-auto" /></td></tr>
              ) : transactions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12">
                    <DollarSign className="w-10 h-10 text-gray-600 mx-auto mb-2" />
                    <p className="text-gray-500 text-sm">No transactions yet</p>
                  </td>
                </tr>
              ) : (
                transactions.map((tx, i) => (
                  <motion.tr key={tx.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.03 }} className="hover:bg-white/3">
                    <td className="px-4 py-3">
                      <p className="text-sm font-medium text-white">{tx.user.name}</p>
                      <p className="text-xs text-gray-500">{tx.user.email}</p>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        {tx.type === "CREDIT" ? (
                          <ArrowDownLeft className="w-4 h-4 text-green-400" />
                        ) : (
                          <ArrowUpRight className="w-4 h-4 text-red-400" />
                        )}
                        <span className={`text-xs font-medium ${tx.type === "CREDIT" ? "text-green-400" : "text-red-400"}`}>
                          {tx.type}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-sm font-bold ${tx.type === "CREDIT" ? "text-green-400" : "text-red-400"}`}>
                        {tx.type === "CREDIT" ? "+" : "-"}{formatPrice(tx.amount)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                        tx.status === "SUCCESS" ? "bg-green-500/20 text-green-400" :
                        tx.status === "PENDING" ? "bg-yellow-500/20 text-yellow-400" :
                        "bg-red-500/20 text-red-400"
                      }`}>
                        {tx.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs text-gray-400 font-mono">{tx.reference?.slice(0, 16)}...</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs text-gray-400">{new Date(tx.createdAt).toLocaleDateString()}</span>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>

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
