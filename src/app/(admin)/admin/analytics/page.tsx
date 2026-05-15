"use client";

import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  TrendingUp, Users, DollarSign, FileText, Star, PenTool,
  ArrowUp, ArrowDown, BarChart2, Activity, Loader2
} from "lucide-react";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend
} from "recharts";
import { formatPrice } from "@/lib/pricing";

interface Stats {
  totalUsers: number; totalWriters: number; totalOrders: number;
  totalRevenue: number; pendingOrders: number; activeOrders: number;
  completedOrders: number; disputedOrders: number;
  pendingPayouts: number; totalPlatformEarnings: number;
  revenueByDay: { date: string; revenue: number; orders: number }[];
  ordersByStatus: { status: string; count: number }[];
  topCategories: { category: string; count: number }[];
  writerStats: { approved: number; pending: number; verified: number };
}

const COLORS = ["#38bdf8", "#818cf8", "#34d399", "#fb923c", "#f472b6", "#a78bfa"];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass-card p-3 border border-white/20 text-sm">
      <p className="text-gray-400 mb-1">{label}</p>
      {payload.map((p: any, i: number) => (
        <p key={i} style={{ color: p.color }} className="font-medium">
          {p.name}: {p.name.includes("Revenue") ? formatPrice(p.value ?? 0) : p.value}
        </p>
      ))}
    </div>
  );
};

export default function AdminAnalyticsPage() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ["admin-analytics"],
    queryFn: async () => {
      const res = await fetch("/api/admin/stats");
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      return json.data as Stats;
    },
    refetchInterval: 60000,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-brand-400 animate-spin" />
      </div>
    );
  }

  const revenueData = stats?.revenueByDay || [];
  const statusData = stats?.ordersByStatus || [];
  const categoryData = stats?.topCategories?.slice(0, 6) || [];

  const kpis = [
    { label: "Total Revenue", value: formatPrice(stats?.totalRevenue || 0), icon: DollarSign, color: "text-green-400", bg: "bg-green-500/10", change: "+12.5%", up: true },
    { label: "Platform Earnings", value: formatPrice(stats?.totalPlatformEarnings || 0), icon: TrendingUp, color: "text-brand-400", bg: "bg-brand-500/10", change: "+8.3%", up: true },
    { label: "Total Users", value: (stats?.totalUsers || 0).toLocaleString(), icon: Users, color: "text-purple-400", bg: "bg-purple-500/10", change: "+5.2%", up: true },
    { label: "Total Orders", value: (stats?.totalOrders || 0).toLocaleString(), icon: FileText, color: "text-blue-400", bg: "bg-blue-500/10", change: "+18.7%", up: true },
    { label: "Active Writers", value: (stats?.writerStats?.approved || 0).toString(), icon: PenTool, color: "text-teal-400", bg: "bg-teal-500/10", change: "+3.1%", up: true },
    { label: "Pending Orders", value: (stats?.pendingOrders || 0).toString(), icon: Activity, color: "text-yellow-400", bg: "bg-yellow-500/10", change: "-2.0%", up: false },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <BarChart2 className="w-6 h-6 text-brand-400" /> Analytics
        </h1>
        <p className="text-gray-400 mt-1">Platform performance overview</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {kpis.map((kpi, i) => (
          <motion.div
            key={kpi.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className={`glass-card p-4 ${kpi.bg} border border-white/5`}
          >
            <div className="flex items-center justify-between mb-2">
              <kpi.icon className={`w-5 h-5 ${kpi.color}`} />
              <span className={`text-xs flex items-center gap-0.5 ${kpi.up ? "text-green-400" : "text-red-400"}`}>
                {kpi.up ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
                {kpi.change}
              </span>
            </div>
            <p className={`text-xl font-bold ${kpi.color}`}>{kpi.value}</p>
            <p className="text-xs text-gray-400 mt-0.5">{kpi.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Revenue Chart */}
      <div className="glass-card p-5">
        <h3 className="font-semibold text-white mb-4">Revenue & Orders (Last 7 Days)</h3>
        <ResponsiveContainer width="100%" height={280}>
          <AreaChart data={revenueData}>
            <defs>
              <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#38bdf8" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorOrders" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#818cf8" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#818cf8" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis dataKey="date" tick={{ fill: "#9ca3af", fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: "#9ca3af", fontSize: 11 }} axisLine={false} tickLine={false} />
            <Tooltip content={<CustomTooltip />} />
            <Area type="monotone" dataKey="revenue" name="Revenue ($)" stroke="#38bdf8" strokeWidth={2} fill="url(#colorRevenue)" />
            <Area type="monotone" dataKey="orders" name="Orders" stroke="#818cf8" strokeWidth={2} fill="url(#colorOrders)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Orders by Status */}
        <div className="glass-card p-5">
          <h3 className="font-semibold text-white mb-4">Orders by Status</h3>
          {statusData.length > 0 ? (
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  dataKey="count"
                  nameKey="status"
                >
                  {statusData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(v, n) => [v, n]} contentStyle={{ background: "rgba(10,15,30,0.9)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8 }} />
                <Legend formatter={(v) => <span style={{ color: "#9ca3af", fontSize: 12 }}>{v}</span>} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-40 text-gray-500 text-sm">No data yet</div>
          )}
        </div>

        {/* Top Categories */}
        <div className="glass-card p-5">
          <h3 className="font-semibold text-white mb-4">Top Categories</h3>
          {categoryData.length > 0 ? (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={categoryData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
                <XAxis type="number" tick={{ fill: "#9ca3af", fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis dataKey="category" type="category" tick={{ fill: "#9ca3af", fontSize: 11 }} axisLine={false} tickLine={false} width={100} />
                <Tooltip contentStyle={{ background: "rgba(10,15,30,0.9)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8 }} />
                <Bar dataKey="count" name="Orders" radius={[0, 4, 4, 0]}>
                  {categoryData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-40 text-gray-500 text-sm">No data yet</div>
          )}
        </div>
      </div>

      {/* Writer Stats */}
      <div className="glass-card p-5">
        <h3 className="font-semibold text-white mb-4">Writer Overview</h3>
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: "Approved Writers", value: stats?.writerStats?.approved || 0, color: "text-green-400" },
            { label: "Pending Approval", value: stats?.writerStats?.pending || 0, color: "text-yellow-400" },
            { label: "Verified Writers", value: stats?.writerStats?.verified || 0, color: "text-blue-400" },
          ].map(s => (
            <div key={s.label} className="text-center p-4 bg-white/5 rounded-xl">
              <p className={`text-3xl font-bold ${s.color}`}>{s.value}</p>
              <p className="text-xs text-gray-400 mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
