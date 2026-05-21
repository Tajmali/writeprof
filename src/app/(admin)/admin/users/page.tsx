"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users, Search, Filter, Shield, Ban, CheckCircle, Eye,
  Mail, Calendar, ShoppingBag, MoreVertical, Loader2, UserCheck, UserX, Trash2, AlertTriangle
} from "lucide-react";
import toast from "react-hot-toast";

interface User {
  id: string; name: string; email: string; avatar: string | null;
  role: string; emailVerified: boolean; isActive: boolean; isBanned: boolean;
  createdAt: string; referralCode: string;
  _count: { clientOrders: number };
}

const ROLE_COLORS: Record<string, string> = {
  CLIENT: "bg-blue-500/20 text-blue-400",
  WRITER: "bg-green-500/20 text-green-400",
  ADMIN: "bg-purple-500/20 text-purple-400",
};

export default function AdminUsersPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [page, setPage] = useState(1);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<User | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["admin-users", page, search, roleFilter],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: page.toString(), limit: "20",
        ...(search && { search }),
        ...(roleFilter && { role: roleFilter }),
      });
      const res = await fetch(`/api/admin/users?${params}`);
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      return json;
    },
  });

  const actionMutation = useMutation({
    mutationFn: async ({ userId, action }: { userId: string; action: string }) => {
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, action }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      return json.data;
    },
    onSuccess: (_, vars) => {
      toast.success(`User ${vars.action}ed successfully`);
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      setOpenMenu(null);
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const deleteMutation = useMutation({
    mutationFn: async (userId: string) => {
      const res = await fetch(`/api/admin/users?userId=${userId}`, { method: "DELETE" });
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      return json.data;
    },
    onSuccess: (data) => {
      toast.success(data.message || "User deleted");
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      setDeleteTarget(null);
    },
    onError: (err: Error) => {
      toast.error(err.message);
      setDeleteTarget(null);
    },
  });

  const users: User[] = data?.data?.users || [];
  const pagination = data?.pagination;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Users className="w-6 h-6 text-brand-400" /> User Management
          </h1>
          <p className="text-gray-400 mt-1">
            {pagination?.total || 0} total users
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search users by name or email..."
            className="input-field pl-10 w-full"
          />
        </div>
        <select
          value={roleFilter}
          onChange={e => { setRoleFilter(e.target.value); setPage(1); }}
          className="input-field sm:w-48"
        >
          <option value="">All Roles</option>
          <option value="CLIENT">Clients</option>
          <option value="WRITER">Writers</option>
          <option value="ADMIN">Admins</option>
        </select>
      </div>

      {/* Table */}
      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                {["User", "Role", "Status", "Orders", "Joined", "Actions"].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="text-center py-12">
                    <Loader2 className="w-8 h-8 text-brand-400 animate-spin mx-auto" />
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-gray-500">No users found</td>
                </tr>
              ) : (
                users.map((user, i) => (
                  <motion.tr
                    key={user.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.03 }}
                    className="hover:bg-white/3 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-brand-500/20 flex items-center justify-center text-xs font-bold text-brand-400">
                          {user.name[0]}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-white">{user.name}</p>
                          <p className="text-xs text-gray-400">{user.email}</p>
                        </div>
                        {user.emailVerified && (
                          <CheckCircle className="w-3.5 h-3.5 text-green-400 shrink-0" title="Email verified" />
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${ROLE_COLORS[user.role] || ""}`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {user.isBanned ? (
                        <span className="px-2 py-0.5 rounded-full text-xs bg-red-500/20 text-red-400">Banned</span>
                      ) : user.isActive ? (
                        <span className="px-2 py-0.5 rounded-full text-xs bg-green-500/20 text-green-400">Active</span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-xs bg-gray-500/20 text-gray-400">Inactive</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm text-white">{user._count.clientOrders}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs text-gray-400">{new Date(user.createdAt).toLocaleDateString()}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="relative">
                        <button
                          onClick={() => setOpenMenu(openMenu === user.id ? null : user.id)}
                          className="p-1.5 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </button>
                        <AnimatePresence>
                          {openMenu === user.id && (
                            <motion.div
                              initial={{ opacity: 0, scale: 0.95, y: -5 }}
                              animate={{ opacity: 1, scale: 1, y: 0 }}
                              exit={{ opacity: 0, scale: 0.95 }}
                              className="absolute right-0 mt-1 w-48 glass-card border border-white/20 shadow-xl z-20 py-1"
                            >
                              {!user.emailVerified && (
                                <ActionItem
                                  icon={CheckCircle}
                                  label="Verify Email"
                                  onClick={() => actionMutation.mutate({ userId: user.id, action: "verify" })}
                                  color="text-green-400"
                                />
                              )}
                              {user.isActive ? (
                                <ActionItem icon={UserX} label="Deactivate" onClick={() => actionMutation.mutate({ userId: user.id, action: "deactivate" })} color="text-yellow-400" />
                              ) : (
                                <ActionItem icon={UserCheck} label="Activate" onClick={() => actionMutation.mutate({ userId: user.id, action: "activate" })} color="text-green-400" />
                              )}
                              {user.isBanned ? (
                                <ActionItem icon={CheckCircle} label="Unban User" onClick={() => actionMutation.mutate({ userId: user.id, action: "unban" })} color="text-green-400" />
                              ) : (
                                <ActionItem icon={Ban} label="Ban User" onClick={() => actionMutation.mutate({ userId: user.id, action: "ban" })} color="text-red-400" />
                              )}
                              {user.role !== "ADMIN" && (
                                <>
                                  <div className="border-t border-white/10 my-1" />
                                  <ActionItem
                                    icon={Trash2}
                                    label="Delete Profile"
                                    onClick={() => { setDeleteTarget(user); setOpenMenu(null); }}
                                    color="text-red-500"
                                  />
                                </>
                              )}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination && pagination.totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-white/10">
            <p className="text-sm text-gray-400">
              Showing {(page - 1) * 20 + 1}–{Math.min(page * 20, pagination.total)} of {pagination.total}
            </p>
            <div className="flex gap-2">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                className="btn-secondary text-sm px-3 py-1.5 disabled:opacity-50">← Prev</button>
              <button onClick={() => setPage(p => Math.min(pagination.totalPages, p + 1))} disabled={page === pagination.totalPages}
                className="btn-secondary text-sm px-3 py-1.5 disabled:opacity-50">Next →</button>
            </div>
          </div>
        )}
      </div>

      {/* Delete confirmation dialog */}
      <AnimatePresence>
        {deleteTarget && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={(e) => e.target === e.currentTarget && setDeleteTarget(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-slate-900 border border-red-500/30 rounded-2xl w-full max-w-md shadow-2xl p-6"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-red-500/20 flex items-center justify-center flex-shrink-0">
                  <AlertTriangle className="w-5 h-5 text-red-400" />
                </div>
                <div>
                  <h3 className="text-white font-bold">Delete Profile</h3>
                  <p className="text-slate-400 text-sm">This action cannot be undone</p>
                </div>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-xl p-4 mb-5">
                <p className="text-white font-semibold text-sm">{deleteTarget.name}</p>
                <p className="text-slate-400 text-xs mt-0.5">{deleteTarget.email} · {deleteTarget.role}</p>
              </div>

              <p className="text-slate-400 text-sm mb-6">
                Permanently deletes this account and all associated data (sessions, wallet, profile).
                <strong className="text-white"> Users with existing orders cannot be deleted</strong> — ban or deactivate them instead.
              </p>

              <div className="flex gap-3">
                <button
                  onClick={() => setDeleteTarget(null)}
                  className="btn-secondary flex-1 py-2.5 text-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={() => deleteMutation.mutate(deleteTarget.id)}
                  disabled={deleteMutation.isPending}
                  className="flex-1 py-2.5 text-sm font-semibold rounded-xl bg-red-500/20 border border-red-500/40 text-red-400 hover:bg-red-500/30 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {deleteMutation.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Trash2 className="w-4 h-4" />
                  )}
                  {deleteMutation.isPending ? "Deleting..." : "Yes, Delete"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ActionItem({ icon: Icon, label, onClick, color }: {
  icon: React.ElementType; label: string; onClick: () => void; color: string;
}) {
  return (
    <button onClick={onClick} className={`w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-white/5 transition-colors ${color}`}>
      <Icon className="w-4 h-4" />
      {label}
    </button>
  );
}
