"use client";

import { useState, useRef, useEffect } from "react";
import { Bell, Menu, Search, Moon, Sun, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useAuthStore, useUIStore, useNotificationStore } from "@/store";

export function DashboardHeader() {
  const { user } = useAuthStore();
  const { toggleSidebar, theme, toggleTheme } = useUIStore();
  const { notifications, unreadCount, markAllAsRead } = useNotificationStore();
  const [showNotifications, setShowNotifications] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotifications(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="h-16 border-b border-white/5 bg-slate-950/50 backdrop-blur-xl flex items-center px-4 lg:px-6 gap-4">
      {/* Mobile sidebar toggle */}
      <button
        onClick={toggleSidebar}
        className="lg:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-all"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Search */}
      <div className="flex-1 max-w-sm hidden sm:block">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search orders..."
            className="w-full bg-white/5 border border-white/10 rounded-lg pl-9 pr-4 py-2 text-sm text-slate-300 placeholder-slate-600 focus:outline-none focus:border-brand-500/50 focus:ring-1 focus:ring-brand-500/30 transition-all"
          />
        </div>
      </div>

      <div className="flex items-center gap-2 ml-auto">
        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-all"
        >
          {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>

        {/* Notifications */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-all"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-brand-400 rounded-full" />
            )}
          </button>

          <AnimatePresence>
            {showNotifications && (
              <motion.div
                initial={{ opacity: 0, y: 8, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.95 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 top-full mt-2 w-80 glass rounded-xl shadow-2xl overflow-hidden z-50"
              >
                <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
                  <h3 className="text-white font-semibold text-sm">Notifications</h3>
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllAsRead}
                      className="text-brand-400 text-xs hover:text-brand-300 transition-colors"
                    >
                      Mark all read
                    </button>
                  )}
                </div>
                <div className="max-h-72 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="px-4 py-8 text-center text-slate-500 text-sm">
                      No notifications yet
                    </div>
                  ) : (
                    notifications.slice(0, 10).map((notif) => (
                      <div
                        key={notif.id}
                        className={`px-4 py-3 border-b border-white/5 hover:bg-white/5 transition-colors ${
                          !notif.isRead ? "bg-brand-500/5" : ""
                        }`}
                      >
                        <p className="text-white text-xs font-medium">{notif.title}</p>
                        <p className="text-slate-500 text-xs mt-0.5 line-clamp-2">{notif.message}</p>
                        <p className="text-slate-700 text-xs mt-1">
                          {new Date(notif.createdAt).toLocaleTimeString()}
                        </p>
                      </div>
                    ))
                  )}
                </div>
                <div className="px-4 py-2 border-t border-white/10">
                  <Link
                    href="/dashboard/notifications"
                    className="text-brand-400 text-xs hover:text-brand-300 transition-colors"
                    onClick={() => setShowNotifications(false)}
                  >
                    View all notifications
                  </Link>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* User avatar */}
        {user && (
          <div className="flex items-center gap-2 pl-2 border-l border-white/10">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-600 to-brand-400 flex items-center justify-center text-white text-xs font-bold">
              {user.name.slice(0, 2).toUpperCase()}
            </div>
            <div className="hidden md:block">
              <p className="text-white text-xs font-medium leading-none">{user.name.split(" ")[0]}</p>
              <p className="text-slate-500 text-xs capitalize">{user.role.toLowerCase()}</p>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
