"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  AlertTriangle, Search, Scale, CheckCircle, XCircle,
  MessageSquare, Clock, User, PenTool, Loader2, FileText
} from "lucide-react";
import toast from "react-hot-toast";
import Link from "next/link";
import { formatPrice } from "@/lib/pricing";

interface DisputedOrder {
  id: string; orderNumber: string; title: string; category: string;
  totalPrice: number; deadline: string; createdAt: string;
  client: { id: string; name: string; email: string };
  writer: { user: { id: string; name: string; email: string } } | null;
  _count: { messages: number; submissions: number };
}

export default function AdminDisputesPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [resolving, setResolving] = useState<string | null>(null);
  const [resolution, setResolution] = useState<"client" | "writer" | "">("");
  const [notes, setNotes] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["admin-disputes", search],
    queryFn: async () => {
      const params = new URLSearchParams({ status: "DISPUTED", limit: "50", ...(search && { search }) });
      const res = await fetch(`/api/admin/orders?${params}`);
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      return json.data.orders as DisputedOrder[];
    },
  });

  const resolveMutation = useMutation({
    mutationFn: async ({ orderId, resolution, notes }: { orderId: string; resolution: string; notes: string }) => {
      const res = await fetch(`/api/admin/disputes/${orderId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resolution, notes }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error || "Failed to resolve dispute");
      return json.data;
    },
    onSuccess: () => {
      toast.success("Dispute resolved successfully!");
      queryClient.invalidateQueries({ queryKey: ["admin-disputes"] });
      setResolving(null);
      setResolution("");
      setNotes("");
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const orders = data || [];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <Scale className="w-6 h-6 text-brand-400" /> Dispute Resolution
        </h1>
        <p className="text-gray-400 mt-1">{orders.length} active dispute{orders.length !== 1 ? "s" : ""}</p>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search disputes..."
          className="input-field pl-10 w-full"
        />
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-8 h-8 text-brand-400 animate-spin" />
        </div>
      ) : orders.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <Scale className="w-12 h-12 text-gray-600 mx-auto mb-4" />
          <h3 className="font-semibold text-white mb-2">No Active Disputes</h3>
          <p className="text-sm text-gray-400">All disputes have been resolved. Great job!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order, i) => (
            <motion.div
              key={order.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="glass-card p-5 border border-red-500/20 bg-red-500/5"
            >
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <AlertTriangle className="w-4 h-4 text-red-400" />
                    <span className="text-xs font-mono text-gray-500">{order.orderNumber}</span>
                    <span className="px-1.5 py-0.5 rounded text-xs bg-red-500/20 text-red-400">DISPUTED</span>
                  </div>
                  <h3 className="font-semibold text-white">{order.title}</h3>
                  <p className="text-sm text-gray-400 mt-0.5">{order.category}</p>

                  <div className="flex flex-wrap gap-4 mt-3">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-blue-400" />
                      <div>
                        <p className="text-xs text-gray-500">Client</p>
                        <p className="text-sm text-white">{order.client.name}</p>
                      </div>
                    </div>
                    {order.writer && (
                      <div className="flex items-center gap-2">
                        <PenTool className="w-4 h-4 text-brand-400" />
                        <div>
                          <p className="text-xs text-gray-500">Writer</p>
                          <p className="text-sm text-white">{order.writer.user.name}</p>
                        </div>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-gray-400" />
                      <div>
                        <p className="text-xs text-gray-500">Submitted</p>
                        <p className="text-sm text-white">{new Date(order.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Amount at stake</p>
                      <p className="text-sm font-bold text-white">{formatPrice(order.totalPrice)}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 mt-3">
                    <span className="text-xs text-gray-500">{order._count.messages} messages</span>
                    <span className="text-xs text-gray-500">{order._count.submissions} submissions</span>
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <Link href={`/admin/orders/${order.id}`}
                    className="btn-secondary text-xs px-3 py-1.5 flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5" /> View Order
                  </Link>
                  <button
                    onClick={() => setResolving(resolving === order.id ? null : order.id)}
                    className="btn-primary text-xs px-3 py-1.5 flex items-center gap-1.5"
                  >
                    <Scale className="w-3.5 h-3.5" /> Resolve
                  </button>
                </div>
              </div>

              {/* Resolution Panel */}
              {resolving === order.id && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="mt-4 pt-4 border-t border-white/10 space-y-3"
                >
                  <h4 className="text-sm font-semibold text-white">Resolve Dispute</h4>
                  <p className="text-xs text-gray-400">Review the order details, submissions, and chat before making a decision.</p>

                  <div className="flex gap-3">
                    <button
                      onClick={() => setResolution("client")}
                      className={`flex-1 p-3 rounded-xl border text-sm font-medium transition-all ${
                        resolution === "client"
                          ? "border-blue-500/50 bg-blue-500/10 text-blue-400"
                          : "border-white/10 text-gray-400 hover:border-white/20"
                      }`}
                    >
                      <User className="w-4 h-4 mb-1 mx-auto" />
                      Favor Client
                      <p className="text-xs font-normal mt-0.5 text-gray-500">Refund to client</p>
                    </button>
                    <button
                      onClick={() => setResolution("writer")}
                      className={`flex-1 p-3 rounded-xl border text-sm font-medium transition-all ${
                        resolution === "writer"
                          ? "border-brand-500/50 bg-brand-500/10 text-brand-400"
                          : "border-white/10 text-gray-400 hover:border-white/20"
                      }`}
                    >
                      <PenTool className="w-4 h-4 mb-1 mx-auto" />
                      Favor Writer
                      <p className="text-xs font-normal mt-0.5 text-gray-500">Release to writer</p>
                    </button>
                  </div>

                  <textarea
                    value={notes}
                    onChange={e => setNotes(e.target.value)}
                    placeholder="Add resolution notes (will be sent to both parties)..."
                    rows={3}
                    className="input-field w-full resize-none text-sm"
                  />

                  <div className="flex gap-2">
                    <button
                      onClick={() => resolveMutation.mutate({ orderId: order.id, resolution, notes })}
                      disabled={!resolution || resolveMutation.isPending}
                      className="btn-primary flex-1 flex items-center justify-center gap-2"
                    >
                      {resolveMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                      Confirm Resolution
                    </button>
                    <button onClick={() => { setResolving(null); setResolution(""); }}
                      className="btn-secondary px-4">Cancel</button>
                  </div>
                </motion.div>
              )}
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
