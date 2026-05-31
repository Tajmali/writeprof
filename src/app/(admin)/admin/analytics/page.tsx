"use client";

import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  TrendingUp, Users, DollarSign, FileText, PenTool,
  ArrowUp, ArrowDown, BarChart2, Activity, Loader2,
  BookOpen, Eye, Image
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
  changes: {
    revenue: { pct: string; up: boolean };
    users:   { pct: string; up: boolean };
    orders:  { pct: string; up: boolean };
  };
  content: {
    totalBlogPosts: number;
    totalBlogViews: number;
    topBlogPosts: { title: string; slug: string; views: number; category: string }[];
    totalSamples: number;
    totalSampleViews: number;
    topSamples: { title: string; slug: string; views: number; subject: string }[];
  };
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

  const ch = stats?.changes;
  const kpis = [
    { label: "Total Revenue",    value: formatPrice(stats?.totalRevenue || 0),               icon: DollarSign, color: "text-green-400",  bg: "bg-green-500/10",  change: ch?.revenue.pct ? `${ch.revenue.pct}%` : null, up: ch?.revenue.up ?? true },
    { label: "Platform Earnings",value: formatPrice(stats?.totalPlatformEarnings || 0),       icon: TrendingUp, color: "text-brand-400",  bg: "bg-brand-500/10",  change: null, up: true },
    { label: "Total Users",      value: (stats?.totalUsers || 0).toLocaleString(),            icon: Users,      color: "text-purple-400", bg: "bg-purple-500/10", change: ch?.users.pct ? `${ch.users.pct}%` : null, up: ch?.users.up ?? true },
    { label: "Total Orders",     value: (stats?.totalOrders || 0).toLocaleString(),           icon: FileText,   color: "text-blue-400",   bg: "bg-blue-500/10",   change: ch?.orders.pct ? `${ch.orders.pct}%` : null, up: ch?.orders.up ?? true },
    { label: "Active Writers",   value: (stats?.writerStats?.approved || 0).toString(),       icon: PenTool,    color: "text-teal-400",   bg: "bg-teal-500/10",   change: null, up: true },
    { label: "Pending Orders",   value: (stats?.pendingOrders || 0).toString(),               icon: Activity,   color: "text-yellow-400", bg: "bg-yellow-500/10", change: null, up: false },
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
              {kpi.change ? (
                <span className={`text-xs flex items-center gap-0.5 ${kpi.up ? "text-green-400" : "text-red-400"}`}>
                  {kpi.up ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
                  {kpi.change} <span className="text-gray-600">7d</span>
                </span>
              ) : <span />}
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

      {/* ── Content Visibility ── */}
      <div>
        <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <Eye className="w-5 h-5 text-brand-400" /> Content Visibility
          <span className="text-xs text-gray-500 font-normal ml-1">— real view counts, no estimates</span>
        </h2>

        {/* Content summary cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {[
            { label: "Blog Posts Published", value: stats?.content?.totalBlogPosts || 0, icon: BookOpen, color: "text-blue-400", bg: "bg-blue-500/10" },
            { label: "Total Blog Views",     value: (stats?.content?.totalBlogViews || 0).toLocaleString(), icon: Eye, color: "text-green-400", bg: "bg-green-500/10" },
            { label: "Samples Published",    value: stats?.content?.totalSamples || 0, icon: Image, color: "text-purple-400", bg: "bg-purple-500/10" },
            { label: "Total Sample Views",   value: (stats?.content?.totalSampleViews || 0).toLocaleString(), icon: Eye, color: "text-teal-400", bg: "bg-teal-500/10" },
          ].map((c, i) => (
            <motion.div key={c.label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              className={`glass-card p-4 ${c.bg} border border-white/5`}>
              <c.icon className={`w-5 h-5 ${c.color} mb-2`} />
              <p className={`text-2xl font-bold ${c.color}`}>{c.value}</p>
              <p className="text-xs text-gray-400 mt-0.5">{c.label}</p>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Blog Posts */}
          <div className="glass-card p-5">
            <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-blue-400" /> Top Blog Posts by Views
            </h3>
            {(stats?.content?.topBlogPosts?.length ?? 0) > 0 ? (
              <div className="space-y-2">
                {stats!.content.topBlogPosts.map((post, i) => (
                  <div key={post.slug} className="flex items-center gap-3 py-2 border-b border-white/5 last:border-0">
                    <span className="text-gray-600 text-xs w-5 text-right">{i + 1}</span>
                    <div className="flex-1 min-w-0">
                      <a href={`/blog/${post.slug}`} target="_blank" rel="noreferrer"
                        className="text-sm text-white hover:text-brand-400 transition-colors truncate block">
                        {post.title}
                      </a>
                      <span className="text-xs text-gray-500">{post.category}</span>
                    </div>
                    <div className="flex items-center gap-1 text-green-400 text-sm font-semibold flex-shrink-0">
                      <Eye className="w-3 h-3" /> {post.views}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-10 text-gray-500 text-sm">
                <Eye className="w-8 h-8 mx-auto mb-2 opacity-30" />
                No views recorded yet — views track from first visit after deployment
              </div>
            )}
          </div>

          {/* Top Samples */}
          <div className="glass-card p-5">
            <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
              <Image className="w-4 h-4 text-purple-400" /> Top Samples by Views
            </h3>
            {(stats?.content?.topSamples?.length ?? 0) > 0 ? (
              <div className="space-y-2">
                {stats!.content.topSamples.map((s, i) => (
                  <div key={s.slug} className="flex items-center gap-3 py-2 border-b border-white/5 last:border-0">
                    <span className="text-gray-600 text-xs w-5 text-right">{i + 1}</span>
                    <div className="flex-1 min-w-0">
                      <a href={`/samples/${s.slug}`} target="_blank" rel="noreferrer"
                        className="text-sm text-white hover:text-brand-400 transition-colors truncate block">
                        {s.title}
                      </a>
                      <span className="text-xs text-gray-500">{s.subject}</span>
                    </div>
                    <div className="flex items-center gap-1 text-teal-400 text-sm font-semibold flex-shrink-0">
                      <Eye className="w-3 h-3" /> {s.views}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-10 text-gray-500 text-sm">
                <Eye className="w-8 h-8 mx-auto mb-2 opacity-30" />
                No sample views yet
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
