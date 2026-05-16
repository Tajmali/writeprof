"use client";

import { motion } from "framer-motion";
import { Bell, CheckCircle, FileText, Wallet, Star, Info } from "lucide-react";

const notifications = [
  {
    id: "1",
    type: "order",
    title: "New order available!",
    message: "A 2,500-word research paper on Renewable Energy — deadline in 6 hours.",
    time: "2 min ago",
    read: false,
    icon: FileText,
    color: "text-brand-400",
    bg: "bg-brand-500/10",
  },
  {
    id: "2",
    type: "payment",
    title: "Payment released 💰",
    message: "₦14,400 has been added to your wallet for completing Order #ORD-00821.",
    time: "1 hour ago",
    read: false,
    icon: Wallet,
    color: "text-green-400",
    bg: "bg-green-500/10",
  },
  {
    id: "3",
    type: "review",
    title: "New 5-star review!",
    message: "A client left you a 5-star review: \"Exceptional work, delivered ahead of schedule!\"",
    time: "3 hours ago",
    read: false,
    icon: Star,
    color: "text-yellow-400",
    bg: "bg-yellow-500/10",
  },
  {
    id: "4",
    type: "order",
    title: "Your proposal was accepted",
    message: "The client accepted your proposal for the Digital Marketing blog post. Start working now!",
    time: "5 hours ago",
    read: true,
    icon: CheckCircle,
    color: "text-violet-400",
    bg: "bg-violet-500/10",
  },
  {
    id: "5",
    type: "info",
    title: "Profile approved ✅",
    message: "Your writer profile has been reviewed and approved by our team. You can now bid on orders.",
    time: "2 days ago",
    read: true,
    icon: Info,
    color: "text-slate-400",
    bg: "bg-slate-500/10",
  },
];

export default function NotificationsPage() {
  const unread = notifications.filter((n) => !n.read).length;

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white mb-1">Notifications</h1>
            <p className="text-slate-400 text-sm">
              {unread > 0 ? `You have ${unread} unread notification${unread > 1 ? "s" : ""}` : "You're all caught up!"}
            </p>
          </div>
          {unread > 0 && (
            <button className="text-xs text-brand-400 hover:text-brand-300 font-medium transition-colors">
              Mark all as read
            </button>
          )}
        </div>

        {/* Notifications */}
        <div className="space-y-3">
          {notifications.map((n, i) => (
            <motion.div
              key={n.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07 }}
              className={`glass-card p-4 flex items-start gap-4 transition-all ${!n.read ? "border border-white/10" : "opacity-60"}`}
            >
              {/* Icon */}
              <div className={`w-10 h-10 rounded-xl ${n.bg} flex items-center justify-center flex-shrink-0 mt-0.5`}>
                <n.icon className={`w-5 h-5 ${n.color}`} />
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <p className={`text-sm font-semibold ${!n.read ? "text-white" : "text-slate-400"}`}>{n.title}</p>
                  <span className="text-slate-600 text-xs flex-shrink-0">{n.time}</span>
                </div>
                <p className="text-slate-400 text-xs mt-1 leading-relaxed">{n.message}</p>
              </div>

              {/* Unread dot */}
              {!n.read && (
                <div className="w-2 h-2 rounded-full bg-brand-400 flex-shrink-0 mt-2" />
              )}
            </motion.div>
          ))}
        </div>

        {notifications.length === 0 && (
          <div className="text-center py-20">
            <Bell className="w-12 h-12 text-slate-600 mx-auto mb-4" />
            <p className="text-slate-400 font-medium">No notifications yet</p>
            <p className="text-slate-600 text-sm mt-1">We'll let you know when something happens.</p>
          </div>
        )}
      </motion.div>
    </div>
  );
}
