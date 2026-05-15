"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import {
  PenTool, Search, Star, CheckCircle, XCircle, ShieldCheck,
  Ban, MoreVertical, Loader2, Clock, TrendingUp, AlertCircle
} from "lucide-react";
import toast from "react-hot-toast";

interface Writer {
  id: string;
  isApproved: boolean;
  isVerified: boolean;
  status: string;
  averageRating: number;
  totalReviews: number;
  completedOrders: number;
  joinedAt: string;
  specialization: string | null;
  user: {
    id: string; name: string; email: string; avatar: string | null;
    isActive: boolean; isBanned: boolean; createdAt: string;
  };
}

export default function AdminWritersPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [pendingOnly, setPendingOnly] = useState(false);
  const [page, setPage] = useState(1);
  const [openMenu, setOpenMenu] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["admin-writers", page, search, pendingOnly],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: page.toString(), limit: "20",
        ...(search && { search }),
        ...(pendingOnly && { pending: "true" }),
      });
      const res = await fetch(`/api/admin/writers?${params}`);
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      return json;
    },
  });

  const actionMutation = useMutation({
    mutationFn: async ({ writerId, action }: { writerId: string; action: string }) => {
      const res = await fetch("/api/admin/writers", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ writerId, action }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      return json.data;
    },
    onSuccess: (_, vars) => {
      const messages: Record<string, string> = {
        approve: "Writer approved! They've been notified.",
        reject: "Writer application rejected.",
        verify: "Writer verified successfully.",
        suspend: "Writer suspended.",
      };
      toast.success(messages[vars.action] || "Action completed");
      queryClient.invalidateQueries({ queryKey: ["admin-writers"] });
      setOpenMenu(null);
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const writers: Writer[] = data?.data?.writers || [];
  const pagination = data?.pagination;
  const pendingCount = pendingOnly ? pagination?.total : null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <PenTool className="w-6 h-6 text-brand-400" /> Writer Management
          </h1>
          <p className="text-gray-400 mt-1">{pagination?.total || 0} writers registered</p>
        </div>
        <button
          onClick={() => { setPendingOnly(!pendingOnly); setPage(1); }}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all border ${
            pendingOnly
              ? "bg-orange-500/20 border-orange-500/40 text-orange-400"
              : "glass border-white/20 text-gray-400 hover:text-white"
          }`}
        >
          <AlertCircle className="w-4 h-4" />
          {pendingOnly ? "Show All" : "Pending Approval"}
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          value={search}
          onChange={e => { setSearch(e.target.value); setPage(1); }}
          placeholder="Search writers by name or email..."
          className="input-field pl-10 w-full"
        />
      </div>

      {/* Writer Cards */}
      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-8 h-8 text-brand-400 animate-spin" />
        </div>
      ) : writers.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <PenTool className="w-12 h-12 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400">No writers found</p>
        </div>
      ) : (
        <div className="space-y-3">
          {writers.map((writer, i) => (
            <motion.div
              key={writer.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className={`glass-card p-4 sm:p-5 ${!writer.isApproved ? "border-orange-500/20" : ""}`}
            >
              <div className="flex items-start gap-4">
                {/* Avatar */}
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center text-white font-bold text-lg shrink-0">
                  {writer.user.name[0]}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between flex-wrap gap-2">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold text-white">{writer.user.name}</h3>
                        {writer.isVerified && (
                          <span className="flex items-center gap-1 px-1.5 py-0.5 rounded text-xs bg-blue-500/20 text-blue-400">
                            <ShieldCheck className="w-3 h-3" /> Verified
                          </span>
                        )}
                        {!writer.isApproved && (
                          <span className="px-1.5 py-0.5 rounded text-xs bg-orange-500/20 text-orange-400 animate-pulse">
                            Pending Approval
                          </span>
                        )}
                        {writer.user.isBanned && (
                          <span className="px-1.5 py-0.5 rounded text-xs bg-red-500/20 text-red-400">Banned</span>
                        )}
                      </div>
                      <p className="text-sm text-gray-400 mt-0.5">{writer.user.email}</p>
                      {writer.specialization && (
                        <p className="text-xs text-brand-400 mt-0.5">{writer.specialization}</p>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      {!writer.isApproved && (
                        <>
                          <button
                            onClick={() => actionMutation.mutate({ writerId: writer.id, action: "approve" })}
                            disabled={actionMutation.isPending}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-500/20 text-green-400 hover:bg-green-500/30 text-xs font-medium transition-all"
                          >
                            <CheckCircle className="w-3.5 h-3.5" /> Approve
                          </button>
                          <button
                            onClick={() => actionMutation.mutate({ writerId: writer.id, action: "reject" })}
                            disabled={actionMutation.isPending}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 text-xs font-medium transition-all"
                          >
                            <XCircle className="w-3.5 h-3.5" /> Reject
                          </button>
                        </>
                      )}

                      <div className="relative">
                        <button
                          onClick={() => setOpenMenu(openMenu === writer.id ? null : writer.id)}
                          className="p-1.5 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </button>
                        <AnimatePresence>
                          {openMenu === writer.id && (
                            <motion.div
                              initial={{ opacity: 0, scale: 0.95, y: -5 }}
                              animate={{ opacity: 1, scale: 1, y: 0 }}
                              exit={{ opacity: 0, scale: 0.95 }}
                              className="absolute right-0 mt-1 w-48 glass-card border border-white/20 shadow-xl z-20 py-1"
                            >
                              {!writer.isVerified && (
                                <button
                                  onClick={() => actionMutation.mutate({ writerId: writer.id, action: "verify" })}
                                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-blue-400 hover:bg-white/5"
                                >
                                  <ShieldCheck className="w-4 h-4" /> Verify Writer
                                </button>
                              )}
                              {writer.isApproved && (
                                <button
                                  onClick={() => actionMutation.mutate({ writerId: writer.id, action: "suspend" })}
                                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-400 hover:bg-white/5"
                                >
                                  <Ban className="w-4 h-4" /> Suspend Writer
                                </button>
                              )}
                              {!writer.isApproved && (
                                <button
                                  onClick={() => actionMutation.mutate({ writerId: writer.id, action: "approve" })}
                                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-green-400 hover:bg-white/5"
                                >
                                  <CheckCircle className="w-4 h-4" /> Approve
                                </button>
                              )}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>
                  </div>

                  {/* Stats Row */}
                  <div className="flex items-center gap-4 mt-3 flex-wrap">
                    <div className="flex items-center gap-1">
                      <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
                      <span className="text-sm font-medium text-white">{writer.averageRating.toFixed(1)}</span>
                      <span className="text-xs text-gray-500">({writer.totalReviews})</span>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-gray-400">
                      <CheckCircle className="w-3.5 h-3.5 text-green-400" />
                      {writer.completedOrders} completed
                    </div>
                    <div className="flex items-center gap-1 text-xs text-gray-400">
                      <span className={`w-2 h-2 rounded-full ${
                        writer.status === "AVAILABLE" ? "bg-green-400" :
                        writer.status === "BUSY" ? "bg-yellow-400" : "bg-gray-400"
                      }`} />
                      {writer.status}
                    </div>
                    <div className="flex items-center gap-1 text-xs text-gray-400">
                      <Clock className="w-3.5 h-3.5" />
                      Joined {new Date(writer.joinedAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-400">Page {page} of {pagination.totalPages}</p>
          <div className="flex gap-2">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
              className="btn-secondary text-sm px-3 py-1.5 disabled:opacity-50">← Prev</button>
            <button onClick={() => setPage(p => Math.min(pagination.totalPages, p + 1))} disabled={page === pagination.totalPages}
              className="btn-secondary text-sm px-3 py-1.5 disabled:opacity-50">Next →</button>
          </div>
        </div>
      )}
    </div>
  );
}
