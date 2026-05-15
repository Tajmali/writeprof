"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  Plus, FileText, Clock, CheckCircle, DollarSign, Bell, TrendingUp,
  Zap, AlertCircle, ArrowRight, Calendar, Star, ChevronRight, LayoutDashboard
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useAuthStore } from "@/store";
import { CountdownTimer } from "./CountdownTimer";
import { getTimeRemaining, formatPrice } from "@/lib/pricing";
import type { Order } from "@/types";

async function fetchOrders(): Promise<{ orders: Order[]; total: number }> {
  const res = await fetch("/api/orders?limit=10");
  const data = await res.json();
  return { orders: data.data?.orders || [], total: data.pagination?.total || 0 };
}

async function fetchStats() {
  const res = await fetch("/api/dashboard/stats");
  const data = await res.json();
  return data.data || {};
}

const statusColors: Record<string, string> = {
  PENDING: "badge-orange",
  ASSIGNED: "badge-blue",
  IN_PROGRESS: "badge-blue",
  UNDER_REVIEW: "badge-purple",
  REVISION_REQUESTED: "badge-orange",
  COMPLETED: "badge-green",
  CANCELLED: "badge-red",
  DISPUTED: "badge-red",
};

const statusLabels: Record<string, string> = {
  PENDING: "Pending",
  ASSIGNED: "Writer Assigned",
  IN_PROGRESS: "In Progress",
  UNDER_REVIEW: "Under Review",
  REVISION_REQUESTED: "Revision",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
  DISPUTED: "Disputed",
};

export function ClientDashboard() {
  const { user } = useAuthStore();
  const { data: ordersData, isLoading: ordersLoading } = useQuery({ queryKey: ["orders"], queryFn: fetchOrders });

  const orders = ordersData?.orders || [];
  const activeOrders = orders.filter((o) => !["COMPLETED", "CANCELLED"].includes(o.status));
  const completedOrders = orders.filter((o) => o.status === "COMPLETED");

  const stats = [
    { label: "Total Orders", value: ordersData?.total || 0, icon: FileText, color: "text-brand-400", bg: "bg-brand-500/10" },
    { label: "Active Orders", value: activeOrders.length, icon: Clock, color: "text-orange-400", bg: "bg-orange-500/10" },
    { label: "Completed", value: completedOrders.length, icon: CheckCircle, color: "text-green-400", bg: "bg-green-500/10" },
    { label: "Wallet Balance", value: formatPrice(user?.wallet?.balance || 0), icon: DollarSign, color: "text-brand-400", bg: "bg-brand-500/10", isPrice: true },
  ];

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
          {/* Welcome */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
            <h1 className="text-2xl lg:text-3xl font-bold text-white">
              Welcome back, {user?.name?.split(" ")[0]}! 👋
            </h1>
            <p className="text-slate-400 mt-1">
              {activeOrders.length > 0
                ? `You have ${activeOrders.length} active order${activeOrders.length > 1 ? "s" : ""} in progress.`
                : "Ready to submit a new order?"}
            </p>
          </motion.div>

          {/* Emergency Mode Banner */}
          {activeOrders.some((o) => o.isEmergency) && (
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mb-6 p-4 rounded-xl bg-emergency-500/10 border border-emergency-500/30 flex items-center gap-4"
            >
              <Zap className="w-6 h-6 text-emergency-400 flex-shrink-0 animate-bounce-slow" />
              <div className="flex-1">
                <p className="text-emergency-300 font-semibold text-sm">Emergency Order Active</p>
                <p className="text-emergency-500 text-xs">Your emergency order is being prioritized by our top writers.</p>
              </div>
            </motion.div>
          )}

          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {stats.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="glass-card p-5"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className={`w-10 h-10 rounded-xl ${stat.bg} flex items-center justify-center`}>
                    <stat.icon className={`w-5 h-5 ${stat.color}`} />
                  </div>
                  <TrendingUp className="w-4 h-4 text-slate-700" />
                </div>
                <div className="text-2xl font-bold text-white mb-0.5">{stat.value}</div>
                <div className="text-slate-500 text-xs">{stat.label}</div>
              </motion.div>
            ))}
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Active Orders */}
            <div className="lg:col-span-2">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-white font-semibold text-lg">Active Orders</h2>
                <Link href="/dashboard/orders" className="text-brand-400 text-sm hover:text-brand-300 flex items-center gap-1">
                  View all <ChevronRight className="w-4 h-4" />
                </Link>
              </div>

              {ordersLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-24 glass rounded-xl shimmer" />
                  ))}
                </div>
              ) : activeOrders.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="glass-card p-12 text-center"
                >
                  <FileText className="w-12 h-12 text-slate-700 mx-auto mb-3" />
                  <p className="text-slate-400 font-medium mb-1">No active orders</p>
                  <p className="text-slate-600 text-sm mb-4">Submit your first order to get started</p>
                  <Link href="/dashboard/new-order" className="btn-primary text-sm">
                    <Plus className="w-4 h-4" /> New Order
                  </Link>
                </motion.div>
              ) : (
                <div className="space-y-3">
                  {activeOrders.slice(0, 5).map((order, i) => {
                    const timeLeft = getTimeRemaining(order.deadline);
                    return (
                      <motion.div
                        key={order.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.1 }}
                      >
                        <Link
                          href={`/dashboard/orders/${order.id}`}
                          className="block glass-card p-4 hover:border-brand-500/30 transition-all duration-200 group"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <span className={`badge ${statusColors[order.status]}`}>
                                  {statusLabels[order.status]}
                                </span>
                                {order.isEmergency && (
                                  <span className="badge bg-emergency-500/20 text-emergency-400 border-emergency-500/30">
                                    EMERGENCY
                                  </span>
                                )}
                              </div>
                              <p className="text-white font-medium text-sm truncate group-hover:text-brand-300 transition-colors">
                                {order.title}
                              </p>
                              <p className="text-slate-500 text-xs mt-0.5">
                                #{order.orderNumber} · {order.wordCount.toLocaleString()} words · {order.category}
                              </p>
                            </div>
                            <div className="text-right flex-shrink-0">
                              <div className={`text-sm font-semibold ${timeLeft.isUrgent ? "text-orange-400" : "text-slate-400"}`}>
                                {timeLeft.label}
                              </div>
                              <p className="text-slate-600 text-xs">remaining</p>
                            </div>
                          </div>

                          {/* Progress bar */}
                          <div className="mt-3 urgency-bar">
                            <div
                              className={`urgency-bar-fill ${
                                timeLeft.isUrgent ? "bg-orange-400" : "bg-brand-500"
                              }`}
                              style={{ width: `${timeLeft.percentage}%` }}
                            />
                          </div>
                        </Link>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Quick Actions & Quick Stats */}
            <div className="space-y-6">
              {/* Quick Actions */}
              <div>
                <h2 className="text-white font-semibold text-lg mb-4">Quick Actions</h2>
                <div className="space-y-3">
                  <Link href="/dashboard/new-order" className="flex items-center gap-3 p-4 glass rounded-xl hover:border-brand-500/30 transition-all group">
                    <div className="w-10 h-10 rounded-xl bg-brand-500/20 flex items-center justify-center group-hover:bg-brand-500/30 transition-all">
                      <Plus className="w-5 h-5 text-brand-400" />
                    </div>
                    <div>
                      <p className="text-white text-sm font-medium">New Order</p>
                      <p className="text-slate-500 text-xs">Submit a writing task</p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-600 ml-auto group-hover:text-brand-400 group-hover:translate-x-1 transition-all" />
                  </Link>

                  <Link href="/dashboard/new-order?mode=emergency" className="flex items-center gap-3 p-4 glass rounded-xl hover:border-emergency-500/30 transition-all group border-emergency-500/10">
                    <div className="w-10 h-10 rounded-xl bg-emergency-500/20 flex items-center justify-center group-hover:bg-emergency-500/30 transition-all">
                      <Zap className="w-5 h-5 text-emergency-400" />
                    </div>
                    <div>
                      <p className="text-white text-sm font-medium">Emergency Order</p>
                      <p className="text-slate-500 text-xs">1-hour delivery</p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-600 ml-auto group-hover:text-emergency-400 group-hover:translate-x-1 transition-all" />
                  </Link>

                  <Link href="/dashboard/chat" className="flex items-center gap-3 p-4 glass rounded-xl hover:border-white/20 transition-all group">
                    <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center group-hover:bg-white/10 transition-all">
                      <Bell className="w-5 h-5 text-slate-400" />
                    </div>
                    <div>
                      <p className="text-white text-sm font-medium">Messages</p>
                      <p className="text-slate-500 text-xs">Chat with writers</p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-600 ml-auto group-hover:text-white group-hover:translate-x-1 transition-all" />
                  </Link>
                </div>
              </div>

              {/* Wallet */}
              <div className="glass-card p-5">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-white font-semibold text-sm">Wallet</h3>
                  <Link href="/dashboard/payments" className="text-brand-400 text-xs hover:text-brand-300">
                    View history
                  </Link>
                </div>
                <div className="text-2xl font-bold text-white mb-1">
                  {formatPrice(user?.wallet?.balance || 0)}
                </div>
                <p className="text-slate-500 text-xs mb-3">Available balance</p>
                <div className="grid grid-cols-2 gap-2 text-center">
                  <div className="p-2 bg-white/5 rounded-lg">
                    <p className="text-white text-sm font-semibold">{formatPrice(user?.wallet?.totalSpent || 0)}</p>
                    <p className="text-slate-600 text-xs">Total Spent</p>
                  </div>
                  <div className="p-2 bg-white/5 rounded-lg">
                    <p className="text-green-400 text-sm font-semibold">0</p>
                    <p className="text-slate-600 text-xs">Refunds</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
    </div>
  );
}
