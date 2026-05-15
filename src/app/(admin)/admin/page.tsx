"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import {
  Users, FileText, DollarSign, TrendingUp, AlertCircle, CheckCircle,
  Clock, BarChart3, Shield, Settings, ArrowUp, ArrowDown, ChevronRight
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { formatPrice } from "@/lib/pricing";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const mockChartData = [
  { day: "Mon", revenue: 45000, orders: 12 },
  { day: "Tue", revenue: 62000, orders: 18 },
  { day: "Wed", revenue: 38000, orders: 9 },
  { day: "Thu", revenue: 89000, orders: 24 },
  { day: "Fri", revenue: 115000, orders: 31 },
  { day: "Sat", revenue: 72000, orders: 19 },
  { day: "Sun", revenue: 98000, orders: 26 },
];

async function fetchAdminStats() {
  const res = await fetch("/api/admin/stats");
  const data = await res.json();
  return data.data || {
    totalUsers: 1284,
    totalWriters: 847,
    totalOrders: 12847,
    totalRevenue: 45820000,
    pendingOrders: 23,
    activeOrders: 67,
    completedToday: 142,
    revenueToday: 1840000,
    pendingPayouts: 12,
    disputes: 3,
  };
}

async function fetchRecentOrders() {
  const res = await fetch("/api/orders?limit=8");
  const data = await res.json();
  return data.data?.orders || [];
}

const statusColors: Record<string, string> = {
  PENDING: "text-orange-400 bg-orange-500/10",
  ASSIGNED: "text-brand-400 bg-brand-500/10",
  IN_PROGRESS: "text-blue-400 bg-blue-500/10",
  COMPLETED: "text-green-400 bg-green-500/10",
  CANCELLED: "text-red-400 bg-red-500/10",
  DISPUTED: "text-red-400 bg-red-500/10",
};

export default function AdminDashboard() {
  const { data: stats, isLoading } = useQuery({ queryKey: ["admin-stats"], queryFn: fetchAdminStats });
  const { data: recentOrders = [] } = useQuery({ queryKey: ["recent-orders"], queryFn: fetchRecentOrders });

  const statCards = [
    { label: "Total Users", value: stats?.totalUsers?.toLocaleString() || "—", icon: Users, color: "text-brand-400", bg: "bg-brand-500/10", change: "+12%", up: true },
    { label: "Active Writers", value: stats?.totalWriters?.toLocaleString() || "—", icon: FileText, color: "text-violet-400", bg: "bg-violet-500/10", change: "+5%", up: true },
    { label: "Total Revenue", value: formatPrice(stats?.totalRevenue || 0), icon: DollarSign, color: "text-emerald-400", bg: "bg-emerald-500/10", change: "+23%", up: true },
    { label: "Orders Today", value: stats?.completedToday?.toLocaleString() || "—", icon: BarChart3, color: "text-yellow-400", bg: "bg-yellow-500/10", change: "+8%", up: true },
  ];

  const alertCards = [
    { label: "Pending Orders", value: stats?.pendingOrders || 0, icon: Clock, color: "text-orange-400", href: "/admin/orders?status=PENDING" },
    { label: "Active Orders", value: stats?.activeOrders || 0, icon: TrendingUp, color: "text-brand-400", href: "/admin/orders?status=IN_PROGRESS" },
    { label: "Pending Payouts", value: stats?.pendingPayouts || 0, icon: DollarSign, color: "text-emerald-400", href: "/admin/payments" },
    { label: "Open Disputes", value: stats?.disputes || 0, icon: AlertCircle, color: "text-red-400", href: "/admin/disputes" },
  ];

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-2xl lg:text-3xl font-bold text-white">Admin Dashboard</h1>
            <p className="text-slate-400 mt-1">Platform overview and management</p>
          </div>

          {/* Main stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {statCards.map((card, i) => (
              <motion.div
                key={card.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="glass-card p-5"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className={`w-10 h-10 rounded-xl ${card.bg} flex items-center justify-center`}>
                    <card.icon className={`w-5 h-5 ${card.color}`} />
                  </div>
                  <div className={`flex items-center gap-0.5 text-xs font-semibold ${card.up ? "text-green-400" : "text-red-400"}`}>
                    {card.up ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
                    {card.change}
                  </div>
                </div>
                <div className="text-xl lg:text-2xl font-bold text-white mb-0.5">{card.value}</div>
                <div className="text-slate-500 text-xs">{card.label}</div>
              </motion.div>
            ))}
          </div>

          {/* Alert cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {alertCards.map((card, i) => (
              <Link key={card.label} href={card.href}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 + i * 0.1 }}
                  className="glass-card p-4 hover:border-white/20 transition-all group flex items-center gap-3"
                >
                  <card.icon className={`w-5 h-5 ${card.color} flex-shrink-0`} />
                  <div className="flex-1">
                    <p className="text-white font-bold text-lg leading-none">{card.value}</p>
                    <p className="text-slate-500 text-xs mt-0.5">{card.label}</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-700 group-hover:text-slate-400 transition-colors" />
                </motion.div>
              </Link>
            ))}
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Revenue chart */}
            <div className="lg:col-span-2 glass-card p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-white font-semibold">Revenue (7 Days)</h2>
                <span className="text-green-400 text-sm font-semibold">+23% this week</span>
              </div>
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={mockChartData}>
                  <defs>
                    <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="day" stroke="#475569" fontSize={12} />
                  <YAxis stroke="#475569" fontSize={12} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
                  <Tooltip
                    contentStyle={{ background: "#1e293b", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", color: "#e2e8f0" }}
                    formatter={(value: number) => [formatPrice(value), "Revenue"]}
                  />
                  <Area type="monotone" dataKey="revenue" stroke="#0ea5e9" fill="url(#revenueGradient)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Quick actions */}
            <div className="space-y-4">
              <h2 className="text-white font-semibold">Quick Actions</h2>
              {[
                { label: "Approve Writers", href: "/admin/writers?pending=true", icon: CheckCircle, color: "text-green-400" },
                { label: "Resolve Disputes", href: "/admin/disputes", icon: AlertCircle, color: "text-red-400" },
                { label: "Process Payouts", href: "/admin/payments", icon: DollarSign, color: "text-emerald-400" },
                { label: "View Analytics", href: "/admin/analytics", icon: BarChart3, color: "text-brand-400" },
                { label: "System Settings", href: "/admin/settings", icon: Settings, color: "text-slate-400" },
              ].map((action) => (
                <Link key={action.label} href={action.href} className="flex items-center gap-3 p-3 glass rounded-xl hover:border-white/20 transition-all group">
                  <action.icon className={`w-5 h-5 ${action.color} flex-shrink-0`} />
                  <span className="text-slate-300 text-sm group-hover:text-white transition-colors">{action.label}</span>
                  <ChevronRight className="w-4 h-4 text-slate-700 ml-auto group-hover:text-slate-400 transition-colors" />
                </Link>
              ))}
            </div>
          </div>

          {/* Recent Orders */}
          <div className="mt-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-white font-semibold text-lg">Recent Orders</h2>
              <Link href="/admin/orders" className="text-brand-400 text-sm hover:text-brand-300 flex items-center gap-1">
                View all <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="glass-card overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/5">
                    <th className="text-left px-6 py-3 text-slate-500 text-xs font-medium">ORDER</th>
                    <th className="text-left px-6 py-3 text-slate-500 text-xs font-medium hidden md:table-cell">CLIENT</th>
                    <th className="text-left px-6 py-3 text-slate-500 text-xs font-medium hidden lg:table-cell">CATEGORY</th>
                    <th className="text-left px-6 py-3 text-slate-500 text-xs font-medium">STATUS</th>
                    <th className="text-right px-6 py-3 text-slate-500 text-xs font-medium">AMOUNT</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.slice(0, 8).map((order: any) => (
                    <tr key={order.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                      <td className="px-6 py-3">
                        <p className="text-white text-sm font-medium truncate max-w-[200px]">{order.title}</p>
                        <p className="text-slate-600 text-xs">{order.orderNumber}</p>
                      </td>
                      <td className="px-6 py-3 hidden md:table-cell">
                        <p className="text-slate-300 text-sm">{order.client?.name}</p>
                      </td>
                      <td className="px-6 py-3 hidden lg:table-cell">
                        <span className="badge-blue">{order.category}</span>
                      </td>
                      <td className="px-6 py-3">
                        <span className={`text-xs font-semibold px-2 py-1 rounded-full ${statusColors[order.status] || "text-slate-400 bg-slate-500/10"}`}>
                          {order.status.replace("_", " ")}
                        </span>
                      </td>
                      <td className="px-6 py-3 text-right">
                        <span className="text-white text-sm font-semibold">{formatPrice(order.totalPrice)}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
    </div>
  );
}
