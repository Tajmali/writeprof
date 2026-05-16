"use client";

import { motion } from "framer-motion";
import { BarChart3, TrendingUp, Star, Clock, CheckCircle, FileText } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts";

const earningsData = [
  { month: "Nov", earnings: 42000 },
  { month: "Dec", earnings: 68000 },
  { month: "Jan", earnings: 55000 },
  { month: "Feb", earnings: 91000 },
  { month: "Mar", earnings: 78000 },
  { month: "Apr", earnings: 112000 },
];

const ordersData = [
  { month: "Nov", orders: 8 },
  { month: "Dec", orders: 14 },
  { month: "Jan", orders: 11 },
  { month: "Feb", orders: 19 },
  { month: "Mar", orders: 16 },
  { month: "Apr", orders: 23 },
];

const stats = [
  { label: "Total Orders", value: "91", icon: FileText, color: "from-brand-600 to-brand-400" },
  { label: "Completion Rate", value: "97%", icon: CheckCircle, color: "from-green-600 to-green-400" },
  { label: "Avg. Rating", value: "4.9", icon: Star, color: "from-yellow-600 to-yellow-400" },
  { label: "Avg. Delivery", value: "4.2h", icon: Clock, color: "from-violet-600 to-violet-400" },
];

export default function StatisticsPage() {
  return (
    <div className="p-6 max-w-5xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white mb-1">Statistics</h1>
          <p className="text-slate-400 text-sm">Your performance overview and earnings breakdown.</p>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className="glass-card p-5"
            >
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${s.color} flex items-center justify-center mb-3`}>
                <s.icon className="w-5 h-5 text-white" />
              </div>
              <p className={`text-2xl font-extrabold bg-gradient-to-r ${s.color} bg-clip-text text-transparent`}>
                {s.value}
              </p>
              <p className="text-slate-400 text-xs mt-1">{s.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Charts */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Earnings chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="glass-card p-6"
          >
            <div className="flex items-center gap-2 mb-6">
              <TrendingUp className="w-4 h-4 text-brand-400" />
              <h3 className="text-white font-semibold text-sm">Monthly Earnings ($)</h3>
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={earningsData} barSize={24}>
                <XAxis dataKey="month" tick={{ fill: "#64748b", fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "#64748b", fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
                <Tooltip
                  contentStyle={{ background: "#1e293b", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, color: "#e2e8f0" }}
                  formatter={(v: number) => [`$${v.toLocaleString()}`, "Earnings"]}
                />
                <Bar dataKey="earnings" fill="url(#brandGrad)" radius={[6, 6, 0, 0]} />
                <defs>
                  <linearGradient id="brandGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#0ea5e9" />
                    <stop offset="100%" stopColor="#0369a1" />
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Orders chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="glass-card p-6"
          >
            <div className="flex items-center gap-2 mb-6">
              <BarChart3 className="w-4 h-4 text-violet-400" />
              <h3 className="text-white font-semibold text-sm">Orders Completed</h3>
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={ordersData}>
                <XAxis dataKey="month" tick={{ fill: "#64748b", fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "#64748b", fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ background: "#1e293b", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, color: "#e2e8f0" }}
                  formatter={(v: number) => [v, "Orders"]}
                />
                <Line dataKey="orders" stroke="#a855f7" strokeWidth={2.5} dot={{ fill: "#a855f7", r: 4 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}

