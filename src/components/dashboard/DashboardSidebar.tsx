"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Zap, LayoutDashboard, FileText, Plus, MessageSquare, CreditCard,
  Bell, Settings, LogOut, ChevronLeft, ChevronRight, Users, BarChart3,
  PenTool, Wallet, Star, Shield, Briefcase, BookOpen, X, Send, Trophy
} from "lucide-react";
import { useAuthStore, useUIStore } from "@/store";
import toast from "react-hot-toast";

const clientNavItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" },
  { icon: Plus, label: "New Order", href: "/dashboard/new-order", highlight: true },
  { icon: FileText, label: "My Orders", href: "/dashboard/orders" },
  { icon: MessageSquare, label: "Messages", href: "/dashboard/chat" },
  { icon: CreditCard, label: "Payments", href: "/dashboard/payments" },
  { icon: Bell, label: "Notifications", href: "/dashboard/notifications" },
  { icon: Settings, label: "Settings", href: "/dashboard/settings" },
];

const writerNavItems = [
  { icon: Briefcase, label: "Available Orders", href: "/writer-dashboard/orders" },
  { icon: Send, label: "My Proposals", href: "/writer-dashboard/proposals" },
  { icon: MessageSquare, label: "Chats", href: "/writer-dashboard/chat" },
  { icon: BarChart3, label: "Statistics", href: "/writer-dashboard/statistics" },
  { icon: Trophy, label: "Leaderboard", href: "/writer-dashboard/leaderboard" },
  { icon: Wallet, label: "Balance", href: "/writer-dashboard/earnings" },
  { icon: Bell, label: "Notifications", href: "/writer-dashboard/notifications" },
];

const adminNavItems = [
  { icon: LayoutDashboard, label: "Overview", href: "/admin" },
  { icon: Users, label: "Users", href: "/admin/users" },
  { icon: PenTool, label: "Writers", href: "/admin/writers" },
  { icon: FileText, label: "Orders", href: "/admin/orders" },
  { icon: BarChart3, label: "Analytics", href: "/admin/analytics" },
  { icon: CreditCard, label: "Payments", href: "/admin/payments" },
  { icon: Shield, label: "Disputes", href: "/admin/disputes" },
  { icon: BookOpen, label: "Blog", href: "/admin/blog" },
  { icon: Settings, label: "Settings", href: "/admin/settings" },
];

interface DashboardSidebarProps {
  role: "CLIENT" | "WRITER" | "ADMIN";
}

export function DashboardSidebar({ role }: DashboardSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const { sidebarOpen, toggleSidebar } = useUIStore();

  const navItems = role === "ADMIN" ? adminNavItems : role === "WRITER" ? writerNavItems : clientNavItems;

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      logout();
      router.push("/");
      toast.success("Logged out successfully");
    } catch {
      toast.error("Failed to logout");
    }
  };

  return (
    <>
      {/* Mobile overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-40 lg:hidden"
            onClick={toggleSidebar}
          />
        )}
      </AnimatePresence>

      <motion.aside
        initial={false}
        animate={{ width: sidebarOpen ? 256 : 72 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className={`
          relative flex flex-col bg-slate-950/80 border-r border-white/5
          ${sidebarOpen ? "" : ""}
          lg:relative fixed left-0 top-0 bottom-0 z-50 lg:z-auto
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
          transition-transform lg:transition-none
        `}
        style={{ minHeight: "100vh" }}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 p-4 h-16 border-b border-white/5">
          <Link href="/" className="flex items-center gap-2 flex-shrink-0">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-brand-600 to-brand-400 flex items-center justify-center flex-shrink-0">
              <Zap className="w-4 h-4 text-white" />
            </div>
          </Link>
          <AnimatePresence>
            {sidebarOpen && (
              <motion.span
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="text-lg font-bold text-white whitespace-nowrap overflow-hidden"
              >
                Write<span className="gradient-text">Prof</span>
              </motion.span>
            )}
          </AnimatePresence>
        </div>

        {/* Toggle button */}
        <button
          onClick={toggleSidebar}
          className="absolute -right-3 top-20 w-6 h-6 rounded-full bg-slate-800 border border-white/10 flex items-center justify-center text-slate-400 hover:text-white transition-colors z-10 hidden lg:flex"
        >
          {sidebarOpen ? <ChevronLeft className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
        </button>

        {/* Nav items */}
        <nav className="flex-1 py-4 overflow-y-auto overflow-x-hidden">
          <div className="space-y-1 px-2">
            {navItems.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`
                    flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group relative
                    ${isActive
                      ? "bg-brand-500/20 text-brand-400 border border-brand-500/30"
                      : (item as { highlight?: boolean }).highlight
                      ? "bg-brand-500/10 text-brand-300 hover:bg-brand-500/20 border border-brand-500/20"
                      : "text-slate-400 hover:text-white hover:bg-white/5"
                    }
                  `}
                >
                  <item.icon className={`w-5 h-5 flex-shrink-0 ${isActive ? "text-brand-400" : ""}`} />
                  <AnimatePresence>
                    {sidebarOpen && (
                      <motion.span
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        className="text-sm font-medium whitespace-nowrap overflow-hidden"
                      >
                        {item.label}
                      </motion.span>
                    )}
                  </AnimatePresence>

                  {/* Tooltip for collapsed */}
                  {!sidebarOpen && (
                    <div className="absolute left-full ml-2 px-2 py-1 bg-slate-800 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50">
                      {item.label}
                    </div>
                  )}
                </Link>
              );
            })}
          </div>
        </nav>

        {/* User section */}
        <div className="p-2 border-t border-white/5">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all w-full group"
          >
            <LogOut className="w-5 h-5 flex-shrink-0" />
            <AnimatePresence>
              {sidebarOpen && (
                <motion.span
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="text-sm font-medium"
                >
                  Sign Out
                </motion.span>
              )}
            </AnimatePresence>
          </button>

          {sidebarOpen && user && (
            <div className="flex items-center gap-3 px-3 py-3 mt-1 rounded-xl bg-white/5">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-600 to-brand-400 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                {user.name.slice(0, 2).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white text-xs font-medium truncate">{user.name}</p>
                <p className="text-slate-500 text-xs truncate">{user.email}</p>
              </div>
            </div>
          )}
        </div>
      </motion.aside>
    </>
  );
}
