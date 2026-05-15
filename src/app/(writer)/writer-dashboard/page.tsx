"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  Briefcase, DollarSign, Star, Clock, CheckCircle,
  ArrowRight, Zap, BarChart2
} from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { CountdownTimer } from "@/components/dashboard/CountdownTimer";
import { useAuthStore } from "@/store";
import { formatPrice, getTimeRemaining } from "@/lib/pricing";
import toast from "react-hot-toast";
import type { Order } from "@/types";

export default function WriterDashboardPage() {
  const { user } = useAuthStore();
  const qc = useQueryClient();
  const [isAvailable, setIsAvailable] = useState(
    user?.writerProfile?.status === "AVAILABLE"
  );

  const { data: availableOrders = [] } = useQuery<Order[]>({
    queryKey: ["available-orders"],
    queryFn: async () => {
      const res = await fetch("/api/orders?status=PENDING&limit=10");
      const data = await res.json();
      return data.data?.orders || [];
    },
    refetchInterval: 30000,
  });

  const { data: myOrders = [] } = useQuery<Order[]>({
    queryKey: ["my-orders"],
    queryFn: async () => {
      const res = await fetch("/api/orders?limit=10");
      const data = await res.json();
      return data.data?.orders || [];
    },
  });

  const toggleStatus = async () => {
    const newStatus = isAvailable ? "OFFLINE" : "AVAILABLE";
    try {
      await fetch("/api/writers/status", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      setIsAvailable(!isAvailable);
      toast.success(`You are now ${newStatus.toLowerCase()}`);
    } catch {
      toast.error("Failed to update status");
    }
  };

  const acceptOrder = async (orderId: string) => {
    try {
      const res = await fetch(`/api/orders/${orderId}/accept`, { method: "POST" });
      const data = await res.json();
      if (!data.success) throw new Error(data.error);
      toast.success("Order accepted! Get to work!");
      qc.invalidateQueries({ queryKey: ["available-orders"] });
      qc.invalidateQueries({ queryKey: ["my-orders"] });
    } catch (err: any) {
      toast.error(err.message || "Failed to accept order");
    }
  };

  const activeOrders = myOrders.filter((o: Order) => ["ASSIGNED", "IN_PROGRESS"].includes(o.status));

  const stats = [
    { label: "Completed Orders", value: user?.writerProfile?.completedOrders ?? 0, icon: CheckCircle, color: "text-green-400", bg: "bg-green-500/10" },
    { label: "Rating", value: `${(user?.writerProfile?.rating ?? 0).toFixed(1)}/5`, icon: Star, color: "text-yellow-400", bg: "bg-yellow-500/10" },
    { label: "On-Time Delivery", value: `${user?.writerProfile?.onTimeDelivery ?? 0}%`, icon: Clock, color: "text-brand-400", bg: "bg-brand-500/10" },
    { label: "Wallet Balance", value: formatPrice(user?.wallet?.balance ?? 0), icon: DollarSign, color: "text-emerald-400", bg: "bg-emerald-500/10" },
  ];

  return (
    <div className="p-6 lg:p-8 space-y-8 max-w-7xl mx-auto">
      {/* Header with status toggle */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-white">Writer Dashboard</h1>
          <p className="text-gray-400 mt-1">Welcome back, {user?.name?.split(" ")[0]}!</p>
        </div>
        <button
          onClick={toggleStatus}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border transition-all font-semibold text-sm ${
            isAvailable
              ? "bg-green-500/10 border-green-500/30 text-green-400 hover:bg-green-500/20"
              : "bg-white/5 border-white/10 text-gray-400 hover:bg-white/10"
          }`}
        >
          <div className={`w-2.5 h-2.5 rounded-full ${isAvailable ? "bg-green-400 animate-pulse" : "bg-gray-600"}`} />
          {isAvailable ? "Available" : "Offline"}
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="glass-card p-5"
          >
            <div className={`w-10 h-10 rounded-xl ${stat.bg} flex items-center justify-center mb-3`}>
              <stat.icon className={`w-5 h-5 ${stat.color}`} />
            </div>
            <div className="text-2xl font-bold text-white mb-0.5">{stat.value}</div>
            <div className="text-gray-500 text-xs">{stat.label}</div>
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Active Orders + Available Orders */}
        <div className="lg:col-span-2 space-y-6">
          {/* My Active Orders */}
          {activeOrders.length > 0 && (
            <div>
              <h2 className="text-white font-semibold text-lg mb-4 flex items-center gap-2">
                <Zap className="w-5 h-5 text-orange-400" />
                My Active Orders
              </h2>
              <div className="space-y-3">
                {activeOrders.map((order: Order) => {
                  const timeLeft = getTimeRemaining(order.deadline);
                  return (
                    <Link
                      key={order.id}
                      href={`/writer-dashboard/work/${order.id}`}
                      className="block glass-card p-5 hover:border-brand-500/30 transition-all group"
                    >
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div>
                          <p className="text-white font-medium group-hover:text-brand-300 transition-colors">
                            {order.title}
                          </p>
                          <p className="text-gray-500 text-xs mt-0.5">
                            #{order.orderNumber} · {order.wordCount.toLocaleString()} words · {order.category}
                          </p>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-white font-bold text-sm">{formatPrice(order.totalPrice * 0.8)}</p>
                          <p className="text-gray-500 text-xs">your earnings</p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <CountdownTimer deadline={order.deadline} compact />
                        <div className="w-32 h-1.5 rounded-full bg-white/10 overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all ${timeLeft.isUrgent ? "bg-red-400" : "bg-brand-500"}`}
                            style={{ width: `${Math.max(5, timeLeft.percentage)}%` }}
                          />
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}

          {/* Available Orders */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-white font-semibold text-lg">Available Orders</h2>
              {availableOrders.length > 0 && (
                <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-green-500/20 text-green-400">
                  {availableOrders.length} new
                </span>
              )}
            </div>

            {availableOrders.length === 0 ? (
              <div className="glass-card p-12 text-center">
                <Briefcase className="w-12 h-12 text-gray-700 mx-auto mb-3" />
                <p className="text-gray-400">No orders available right now</p>
                <p className="text-gray-600 text-sm mt-1">New orders will appear here automatically</p>
              </div>
            ) : (
              <div className="space-y-3">
                {availableOrders.map((order: Order) => (
                  <div key={order.id} className="glass-card p-5 hover:border-white/20 transition-all">
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          {order.isEmergency && (
                            <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-orange-500/20 text-orange-400 border border-orange-500/30">
                              ⚡ EMERGENCY
                            </span>
                          )}
                          <span className="px-2 py-0.5 rounded-full text-xs bg-blue-500/20 text-blue-400">{order.category}</span>
                        </div>
                        <p className="text-white font-medium truncate">{order.title}</p>
                        <p className="text-gray-500 text-xs mt-0.5">
                          {order.wordCount.toLocaleString()} words · {order.academicLevel.replace(/_/g, " ")}
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-white font-bold">{formatPrice(order.totalPrice * 0.8)}</p>
                        <p className="text-gray-500 text-xs">your earnings</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <CountdownTimer deadline={order.deadline} compact />
                      <button
                        onClick={() => acceptOrder(order.id)}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold transition-colors"
                      >
                        Accept Order <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-5">
          {/* Earnings */}
          <div className="glass-card p-5">
            <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
              <BarChart2 className="w-4 h-4 text-brand-400" /> Earnings
            </h3>
            <div className="space-y-3">
              <div>
                <p className="text-gray-500 text-xs mb-1">Available to withdraw</p>
                <p className="text-2xl font-bold text-white">{formatPrice(user?.wallet?.balance ?? 0)}</p>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="p-3 bg-white/5 rounded-lg text-center">
                  <p className="text-white font-semibold text-sm">{formatPrice(user?.wallet?.totalEarned ?? 0)}</p>
                  <p className="text-gray-600 text-xs">Total Earned</p>
                </div>
                <div className="p-3 bg-white/5 rounded-lg text-center">
                  <p className="text-white font-semibold text-sm">{activeOrders.length}</p>
                  <p className="text-gray-600 text-xs">Active Jobs</p>
                </div>
              </div>
              <Link href="/writer-dashboard/earnings" className="btn-primary w-full text-sm text-center block py-2.5">
                Request Withdrawal
              </Link>
            </div>
          </div>

          {/* Performance */}
          <div className="glass-card p-5">
            <h3 className="text-white font-semibold mb-4">Performance</h3>
            <div className="space-y-3">
              {[
                { label: "Rating", value: `${(user?.writerProfile?.rating ?? 0).toFixed(1)}/5.0`, pct: (user?.writerProfile?.rating ?? 0) / 5 * 100, color: "bg-yellow-400" },
                { label: "On-Time Delivery", value: `${user?.writerProfile?.onTimeDelivery ?? 0}%`, pct: user?.writerProfile?.onTimeDelivery ?? 0, color: "bg-green-400" },
                { label: "Performance Score", value: `${user?.writerProfile?.performanceScore ?? 0}%`, pct: user?.writerProfile?.performanceScore ?? 0, color: "bg-brand-400" },
              ].map((item) => (
                <div key={item.label}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-gray-400">{item.label}</span>
                    <span className="text-white font-medium">{item.value}</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
                    <div className={`h-full rounded-full ${item.color}`} style={{ width: `${item.pct}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div className="glass-card p-5">
            <h3 className="text-white font-semibold mb-3">Quick Links</h3>
            <div className="space-y-2">
              {[
                { href: "/writer-dashboard/work", label: "My Orders" },
                { href: "/writer-dashboard/ai-tools", label: "AI Writing Tools" },
                { href: "/writer-dashboard/earnings", label: "Earnings & Withdrawal" },
                { href: "/writer-dashboard/reviews", label: "My Reviews" },
                { href: "/writer-dashboard/settings", label: "Profile Settings" },
              ].map(link => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="flex items-center justify-between p-2.5 rounded-lg hover:bg-white/5 text-gray-400 hover:text-white transition-colors text-sm"
                >
                  {link.label}
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
