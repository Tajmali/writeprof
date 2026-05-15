"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  Bell, CheckCheck, Loader2, AlertCircle, MessageSquare,
  DollarSign, Star, Info, Zap, Filter
} from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import Link from "next/link";

interface Notification {
  id: string; type: string; title: string; message: string;
  isRead: boolean; createdAt: string; orderId: string | null;
}

const TYPE_CONFIG: Record<string, { icon: React.ElementType; color: string; bg: string }> = {
  ORDER_ASSIGNED: { icon: Bell, color: "text-brand-400", bg: "bg-brand-500/20" },
  ORDER_SUBMITTED: { icon: Bell, color: "text-blue-400", bg: "bg-blue-500/20" },
  ORDER_COMPLETED: { icon: Bell, color: "text-green-400", bg: "bg-green-500/20" },
  ORDER_REVISION: { icon: AlertCircle, color: "text-orange-400", bg: "bg-orange-500/20" },
  ORDER_DISPUTE: { icon: AlertCircle, color: "text-red-400", bg: "bg-red-500/20" },
  PAYMENT_RECEIVED: { icon: DollarSign, color: "text-green-400", bg: "bg-green-500/20" },
  PAYMENT_RELEASED: { icon: DollarSign, color: "text-brand-400", bg: "bg-brand-500/20" },
  NEW_MESSAGE: { icon: MessageSquare, color: "text-blue-400", bg: "bg-blue-500/20" },
  SYSTEM: { icon: Info, color: "text-purple-400", bg: "bg-purple-500/20" },
  EMERGENCY: { icon: Zap, color: "text-orange-400", bg: "bg-orange-500/20" },
};

export default function NotificationsPage() {
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState<"all" | "unread">("all");

  const { data, isLoading } = useQuery({
    queryKey: ["notifications", filter],
    queryFn: async () => {
      const params = new URLSearchParams({ limit: "50", ...(filter === "unread" && { unread: "true" }) });
      const res = await fetch(`/api/notifications?${params}`);
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      return json.data;
    },
  });

  const markAllMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "markAll" }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      return json.data;
    },
    onSuccess: () => {
      toast.success("All notifications marked as read");
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });

  const markReadMutation = useMutation({
    mutationFn: async (notificationId: string) => {
      const res = await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notificationId }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      return json.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });

  const notifications: Notification[] = data?.notifications || [];
  const unreadCount: number = data?.unreadCount || 0;

  const groupedNotifications = notifications.reduce((groups, notif) => {
    const date = new Date(notif.createdAt).toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" });
    if (!groups[date]) groups[date] = [];
    groups[date].push(notif);
    return groups;
  }, {} as Record<string, Notification[]>);

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const mins = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    if (mins < 1) return "Just now";
    if (mins < 60) return `${mins}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Bell className="w-6 h-6 text-brand-400" /> Notifications
          </h1>
          <p className="text-gray-400 mt-1">{unreadCount > 0 ? `${unreadCount} unread` : "All caught up!"}</p>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={() => markAllMutation.mutate()}
            disabled={markAllMutation.isPending}
            className="btn-secondary text-sm flex items-center gap-2"
          >
            <CheckCheck className="w-4 h-4" />
            Mark All Read
          </button>
        )}
      </div>

      {/* Filter */}
      <div className="flex gap-2">
        {[
          { id: "all", label: "All" },
          { id: "unread", label: "Unread" },
        ].map(f => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id as typeof filter)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              filter === f.id ? "bg-brand-500 text-white" : "glass text-gray-400 hover:text-white border border-white/10"
            }`}
          >
            {f.label}
            {f.id === "unread" && unreadCount > 0 && (
              <span className="ml-1.5 bg-white/20 px-1.5 py-0.5 rounded-full text-xs">{unreadCount}</span>
            )}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-8 h-8 text-brand-400 animate-spin" />
        </div>
      ) : notifications.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <Bell className="w-12 h-12 text-gray-600 mx-auto mb-4" />
          <h3 className="font-semibold text-white mb-2">No notifications</h3>
          <p className="text-sm text-gray-400">
            {filter === "unread" ? "You're all caught up!" : "Notifications will appear here"}
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedNotifications).map(([date, notifs]) => (
            <div key={date}>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">{date}</p>
              <div className="space-y-2">
                {notifs.map((notif, i) => {
                  const config = TYPE_CONFIG[notif.type] || TYPE_CONFIG.SYSTEM;
                  const IconComp = config.icon;
                  return (
                    <motion.div
                      key={notif.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.03 }}
                      onClick={() => !notif.isRead && markReadMutation.mutate(notif.id)}
                      className={`glass-card p-4 cursor-pointer transition-all hover:border-white/20 ${
                        !notif.isRead ? "border-l-2 border-l-brand-500 bg-brand-500/5" : ""
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`w-9 h-9 rounded-xl ${config.bg} flex items-center justify-center shrink-0`}>
                          <IconComp className={`w-4 h-4 ${config.color}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <p className={`text-sm font-semibold ${notif.isRead ? "text-gray-300" : "text-white"}`}>
                              {notif.title}
                            </p>
                            <div className="flex items-center gap-2 shrink-0">
                              <span className="text-xs text-gray-500">{formatTime(notif.createdAt)}</span>
                              {!notif.isRead && <div className="w-2 h-2 rounded-full bg-brand-500 shrink-0" />}
                            </div>
                          </div>
                          <p className="text-sm text-gray-400 mt-0.5 leading-relaxed">{notif.message}</p>
                          {notif.orderId && (
                            <Link
                              href={`/dashboard/orders/${notif.orderId}`}
                              onClick={e => e.stopPropagation()}
                              className="text-xs text-brand-400 hover:text-brand-300 mt-1.5 inline-block"
                            >
                              View order →
                            </Link>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
