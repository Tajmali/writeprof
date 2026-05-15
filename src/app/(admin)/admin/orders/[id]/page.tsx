"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  ArrowLeft, FileText, User, PenTool, Clock, DollarSign,
  ChevronDown, Download, MessageSquare, AlertTriangle, CheckCircle,
  XCircle, RefreshCw, Send, Loader2, Eye, Shield, Zap,
  Calendar, Hash, BookOpen, Award, Star, Package
} from "lucide-react";
import { CountdownTimer } from "@/components/dashboard/CountdownTimer";
import { formatPrice } from "@/lib/pricing";
import { use } from "react";

interface OrderFile {
  id: string;
  name: string;
  url: string;
  size: number;
  mimeType: string;
  uploadedAt: string;
}

interface Submission {
  id: string;
  content: string | null;
  fileUrl: string | null;
  fileName: string | null;
  notes: string | null;
  submittedAt: string;
  isRevision: boolean;
  version: number;
}

interface Message {
  id: string;
  content: string;
  fileUrl: string | null;
  fileName: string | null;
  isRead: boolean;
  createdAt: string;
  sender: { id: string; name: string; avatar: string | null };
}

interface Order {
  id: string;
  orderNumber: string;
  title: string;
  description: string;
  instructions: string | null;
  category: string;
  academicLevel: string;
  wordCount: number;
  urgency: string;
  deadline: string;
  status: string;
  isEmergency: boolean;
  basePrice: number;
  urgencyPrice: number;
  emergencyFee: number;
  totalPrice: number;
  currency: string;
  revisionCount: number;
  maxRevisions: number;
  createdAt: string;
  completedAt: string | null;
  assignedAt: string | null;
  client: { id: string; name: string; email: string; avatar: string | null };
  writer: { id: string; userId: string; user: { id: string; name: string; email: string; avatar: string | null }; rating: number; completedOrders: number } | null;
  attachments: OrderFile[];
  submissions: Submission[];
  messages: Message[];
  payment: {
    id: string;
    amount: number;
    status: string;
    paystackRef: string | null;
    escrowAmount: number;
    commissionAmount: number;
    writerAmount: number;
    paidAt: string | null;
    releasedAt: string | null;
  } | null;
}

interface AvailableWriter {
  id: string;
  userId: string;
  rating: number;
  completedOrders: number;
  specialization: string | null;
  currentOrdersCount: number;
  user: { name: string; email: string; avatar: string | null };
}

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  PENDING: { label: "Pending", color: "text-yellow-400 bg-yellow-500/20 border-yellow-500/30", icon: Clock },
  ASSIGNED: { label: "Assigned", color: "text-brand-400 bg-brand-500/20 border-brand-500/30", icon: PenTool },
  IN_PROGRESS: { label: "In Progress", color: "text-blue-400 bg-blue-500/20 border-blue-500/30", icon: RefreshCw },
  UNDER_REVIEW: { label: "Under Review", color: "text-purple-400 bg-purple-500/20 border-purple-500/30", icon: Eye },
  REVISION_REQUESTED: { label: "Revision Requested", color: "text-orange-400 bg-orange-500/20 border-orange-500/30", icon: RefreshCw },
  COMPLETED: { label: "Completed", color: "text-green-400 bg-green-500/20 border-green-500/30", icon: CheckCircle },
  CANCELLED: { label: "Cancelled", color: "text-red-400 bg-red-500/20 border-red-500/30", icon: XCircle },
  DISPUTED: { label: "Disputed", color: "text-red-400 bg-red-500/20 border-red-500/30", icon: AlertTriangle },
};

const PAYMENT_STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  PENDING: { label: "Pending", color: "text-yellow-400 bg-yellow-500/20" },
  PAID: { label: "Paid", color: "text-blue-400 bg-blue-500/20" },
  ESCROW: { label: "In Escrow", color: "text-green-400 bg-green-500/20" },
  RELEASED: { label: "Released", color: "text-brand-400 bg-brand-500/20" },
  REFUNDED: { label: "Refunded", color: "text-orange-400 bg-orange-500/20" },
  FAILED: { label: "Failed", color: "text-red-400 bg-red-500/20" },
};

type Tab = "overview" | "submissions" | "messages" | "payment";

export default function AdminOrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const qc = useQueryClient();
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState("");
  const [adminNote, setAdminNote] = useState("");
  const [selectedWriter, setSelectedWriter] = useState("");
  const [writerSearch, setWriterSearch] = useState("");

  const { data, isLoading, error } = useQuery({
    queryKey: ["admin-order", id],
    queryFn: async () => {
      const res = await fetch(`/api/orders/${id}`);
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      return json.data.order as Order;
    },
  });

  const { data: writersData } = useQuery({
    queryKey: ["admin-available-writers", writerSearch],
    queryFn: async () => {
      const params = new URLSearchParams({ status: "APPROVED", limit: "20" });
      if (writerSearch) params.set("search", writerSearch);
      const res = await fetch(`/api/admin/writers?${params}`);
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      return json.data?.writers as AvailableWriter[];
    },
    enabled: showAssignModal,
  });

  const updateMutation = useMutation({
    mutationFn: async (body: Record<string, unknown>) => {
      const res = await fetch(`/api/admin/orders/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      return json;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-order", id] });
      setShowAssignModal(false);
      setShowStatusModal(false);
      setAdminNote("");
      setSelectedWriter("");
      setSelectedStatus("");
    },
  });

  const releasePaymentMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/admin/orders/${id}/release-payment`, {
        method: "POST",
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      return json;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-order", id] }),
  });

  const order = data;

  if (isLoading) return (
    <div className="flex items-center justify-center h-64">
      <Loader2 className="w-8 h-8 text-brand-400 animate-spin" />
    </div>
  );

  if (error || !order) return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
      <div className="glass-card p-8 text-center">
        <AlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-4" />
        <p className="text-white font-semibold">Order not found</p>
        <Link href="/admin/orders" className="btn-secondary mt-4 inline-block">Back to Orders</Link>
      </div>
    </div>
  );

  const statusCfg = STATUS_CONFIG[order.status] || STATUS_CONFIG.PENDING;
  const StatusIcon = statusCfg.icon;
  const paymentCfg = order.payment ? (PAYMENT_STATUS_CONFIG[order.payment.status] || PAYMENT_STATUS_CONFIG.PENDING) : null;

  const activeStatuses = Object.keys(STATUS_CONFIG).filter(s => s !== order.status);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          <Link href="/admin/orders" className="p-2 rounded-xl glass hover:bg-white/10 text-gray-400 hover:text-white transition-colors mt-0.5">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-mono text-gray-400">{order.orderNumber}</span>
              {order.isEmergency && (
                <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-orange-500/20 text-orange-400 border border-orange-500/30">
                  <Zap className="w-3 h-3" /> Emergency
                </span>
              )}
              <span className={`flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${statusCfg.color}`}>
                <StatusIcon className="w-3 h-3" />
                {statusCfg.label}
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-white mt-1">{order.title}</h1>
            <p className="text-gray-400 text-sm mt-0.5">{order.category} · {order.academicLevel.replace(/_/g, " ")} · {order.wordCount.toLocaleString()} words</p>
          </div>
        </div>

        {/* Admin Actions */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setShowStatusModal(true)}
            className="btn-secondary text-sm flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" /> Change Status
          </button>
          {!order.writer && order.status === "PENDING" && (
            <button
              onClick={() => setShowAssignModal(true)}
              className="btn-primary text-sm flex items-center gap-2"
            >
              <PenTool className="w-4 h-4" /> Assign Writer
            </button>
          )}
          {order.writer && order.status !== "COMPLETED" && order.status !== "CANCELLED" && (
            <button
              onClick={() => setShowAssignModal(true)}
              className="btn-secondary text-sm flex items-center gap-2"
            >
              <PenTool className="w-4 h-4" /> Reassign
            </button>
          )}
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { icon: DollarSign, label: "Total Price", value: formatPrice(order.totalPrice), color: "text-green-400" },
          { icon: Clock, label: "Deadline", value: new Date(order.deadline).toLocaleDateString(), color: "text-yellow-400" },
          { icon: Package, label: "Submissions", value: order.submissions.length.toString(), color: "text-blue-400" },
          { icon: MessageSquare, label: "Messages", value: order.messages.length.toString(), color: "text-brand-400" },
        ].map((stat) => (
          <div key={stat.label} className="glass-card p-4">
            <div className="flex items-center gap-2 mb-1">
              <stat.icon className={`w-4 h-4 ${stat.color}`} />
              <span className="text-xs text-gray-400">{stat.label}</span>
            </div>
            <p className="text-lg font-bold text-white">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Countdown for active orders */}
      {["PENDING", "ASSIGNED", "IN_PROGRESS", "REVISION_REQUESTED"].includes(order.status) && (
        <div className="glass-card p-4">
          <p className="text-xs text-gray-400 mb-2 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" /> Time Remaining
          </p>
          <CountdownTimer deadline={order.deadline} />
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 p-1 glass rounded-xl w-fit">
        {(["overview", "submissions", "messages", "payment"] as Tab[]).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all capitalize ${
              activeTab === tab ? "bg-brand-500 text-white" : "text-gray-400 hover:text-white"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.15 }}
        >
          {activeTab === "overview" && (
            <div className="grid lg:grid-cols-3 gap-6">
              {/* Main Info */}
              <div className="lg:col-span-2 space-y-6">
                {/* Description */}
                <div className="glass-card p-6">
                  <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider mb-3 flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-brand-400" /> Description
                  </h3>
                  <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-wrap">{order.description}</p>
                  {order.instructions && (
                    <>
                      <div className="border-t border-white/10 my-4" />
                      <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Special Instructions</h4>
                      <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-wrap">{order.instructions}</p>
                    </>
                  )}
                </div>

                {/* Order Details Grid */}
                <div className="glass-card p-6">
                  <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider mb-4 flex items-center gap-2">
                    <Hash className="w-4 h-4 text-brand-400" /> Order Details
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    {[
                      { label: "Category", value: order.category },
                      { label: "Academic Level", value: order.academicLevel.replace(/_/g, " ") },
                      { label: "Word Count", value: `${order.wordCount.toLocaleString()} words` },
                      { label: "Urgency", value: order.urgency.replace(/_/g, " ") },
                      { label: "Revisions", value: `${order.revisionCount} / ${order.maxRevisions}` },
                      { label: "Created", value: new Date(order.createdAt).toLocaleDateString() },
                      { label: "Deadline", value: new Date(order.deadline).toLocaleString() },
                      { label: "Assigned", value: order.assignedAt ? new Date(order.assignedAt).toLocaleDateString() : "—" },
                    ].map(item => (
                      <div key={item.label}>
                        <p className="text-xs text-gray-500 mb-0.5">{item.label}</p>
                        <p className="text-sm font-medium text-white capitalize">{item.value}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Attachments */}
                {order.attachments.length > 0 && (
                  <div className="glass-card p-6">
                    <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider mb-4 flex items-center gap-2">
                      <FileText className="w-4 h-4 text-brand-400" /> Client Attachments ({order.attachments.length})
                    </h3>
                    <div className="space-y-2">
                      {order.attachments.map(file => (
                        <a
                          key={file.id}
                          href={file.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-3 p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors group"
                        >
                          <div className="w-8 h-8 rounded-lg bg-brand-500/20 flex items-center justify-center">
                            <FileText className="w-4 h-4 text-brand-400" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-white truncate">{file.name}</p>
                            <p className="text-xs text-gray-500">{(file.size / 1024).toFixed(1)} KB</p>
                          </div>
                          <Download className="w-4 h-4 text-gray-400 group-hover:text-brand-400 transition-colors" />
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Sidebar */}
              <div className="space-y-4">
                {/* Client Card */}
                <div className="glass-card p-5">
                  <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                    <User className="w-3.5 h-3.5" /> Client
                  </h3>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-500 to-brand-600 flex items-center justify-center text-white font-semibold text-sm">
                      {order.client.avatar ? (
                        <img src={order.client.avatar} alt={order.client.name} className="w-10 h-10 rounded-full object-cover" />
                      ) : order.client.name[0]}
                    </div>
                    <div>
                      <p className="font-semibold text-white text-sm">{order.client.name}</p>
                      <p className="text-xs text-gray-400">{order.client.email}</p>
                    </div>
                  </div>
                  <Link
                    href={`/admin/users?search=${order.client.email}`}
                    className="mt-3 block text-center text-xs text-brand-400 hover:text-brand-300 transition-colors"
                  >
                    View Client Profile →
                  </Link>
                </div>

                {/* Writer Card */}
                <div className="glass-card p-5">
                  <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                    <PenTool className="w-3.5 h-3.5" /> Writer
                  </h3>
                  {order.writer ? (
                    <>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center text-white font-semibold text-sm">
                          {order.writer.user.avatar ? (
                            <img src={order.writer.user.avatar} alt={order.writer.user.name} className="w-10 h-10 rounded-full object-cover" />
                          ) : order.writer.user.name[0]}
                        </div>
                        <div>
                          <p className="font-semibold text-white text-sm">{order.writer.user.name}</p>
                          <p className="text-xs text-gray-400">{order.writer.user.email}</p>
                        </div>
                      </div>
                      <div className="flex gap-3 mt-3">
                        <div className="flex-1 text-center p-2 rounded-lg bg-white/5">
                          <div className="flex items-center justify-center gap-1">
                            <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                            <span className="text-sm font-bold text-white">{order.writer.rating.toFixed(1)}</span>
                          </div>
                          <p className="text-xs text-gray-500">Rating</p>
                        </div>
                        <div className="flex-1 text-center p-2 rounded-lg bg-white/5">
                          <p className="text-sm font-bold text-white">{order.writer.completedOrders}</p>
                          <p className="text-xs text-gray-500">Completed</p>
                        </div>
                      </div>
                      <button
                        onClick={() => setShowAssignModal(true)}
                        className="mt-3 w-full btn-secondary text-xs py-1.5"
                      >
                        Reassign Writer
                      </button>
                    </>
                  ) : (
                    <div className="text-center py-4">
                      <PenTool className="w-8 h-8 text-gray-600 mx-auto mb-2" />
                      <p className="text-sm text-gray-500 mb-3">No writer assigned yet</p>
                      <button onClick={() => setShowAssignModal(true)} className="btn-primary text-xs py-1.5 px-4">
                        Assign Writer
                      </button>
                    </div>
                  )}
                </div>

                {/* Price Breakdown */}
                <div className="glass-card p-5">
                  <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                    <DollarSign className="w-3.5 h-3.5" /> Price Breakdown
                  </h3>
                  <div className="space-y-2">
                    {[
                      { label: "Base Price", value: order.basePrice },
                      { label: "Urgency Fee", value: order.urgencyPrice },
                      ...(order.emergencyFee > 0 ? [{ label: "Emergency Fee", value: order.emergencyFee }] : []),
                    ].map(item => (
                      <div key={item.label} className="flex justify-between text-sm">
                        <span className="text-gray-400">{item.label}</span>
                        <span className="text-white">{formatPrice(item.value)}</span>
                      </div>
                    ))}
                    <div className="border-t border-white/10 pt-2 flex justify-between font-bold">
                      <span className="text-white">Total</span>
                      <span className="text-brand-400">{formatPrice(order.totalPrice)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "submissions" && (
            <div className="space-y-4">
              {order.submissions.length === 0 ? (
                <div className="glass-card p-12 text-center">
                  <Package className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                  <p className="text-gray-400">No submissions yet</p>
                </div>
              ) : (
                order.submissions.map((sub, i) => (
                  <motion.div
                    key={sub.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="glass-card p-6"
                  >
                    <div className="flex items-start justify-between gap-4 mb-4">
                      <div className="flex items-center gap-2">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                          sub.isRevision ? "bg-orange-500/20 text-orange-400" : "bg-brand-500/20 text-brand-400"
                        }`}>
                          v{sub.version}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-white">
                            {sub.isRevision ? "Revision Submission" : "Initial Submission"}
                          </p>
                          <p className="text-xs text-gray-400">{new Date(sub.submittedAt).toLocaleString()}</p>
                        </div>
                      </div>
                      {sub.fileUrl && (
                        <a
                          href={sub.fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-brand-500/20 text-brand-400 hover:bg-brand-500/30 transition-colors text-sm"
                        >
                          <Download className="w-4 h-4" />
                          {sub.fileName || "Download"}
                        </a>
                      )}
                    </div>
                    {sub.notes && (
                      <div className="p-3 rounded-xl bg-white/5 text-sm text-gray-300">
                        <p className="text-xs text-gray-500 mb-1 uppercase tracking-wider">Writer Notes</p>
                        {sub.notes}
                      </div>
                    )}
                    {sub.content && (
                      <div className="mt-3 p-3 rounded-xl bg-white/5 text-sm text-gray-300 max-h-48 overflow-y-auto">
                        <p className="text-xs text-gray-500 mb-1 uppercase tracking-wider">Content Preview</p>
                        <pre className="whitespace-pre-wrap font-sans">{sub.content.slice(0, 500)}{sub.content.length > 500 ? "..." : ""}</pre>
                      </div>
                    )}
                  </motion.div>
                ))
              )}
            </div>
          )}

          {activeTab === "messages" && (
            <div className="glass-card overflow-hidden">
              <div className="p-4 border-b border-white/10">
                <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-brand-400" />
                  Order Chat ({order.messages.length} messages)
                </h3>
              </div>
              <div className="h-[480px] overflow-y-auto p-4 space-y-4">
                {order.messages.length === 0 ? (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-gray-500">No messages in this order</p>
                  </div>
                ) : (
                  order.messages.map((msg) => {
                    const isClient = msg.sender.id === order.client.id;
                    const isWriter = order.writer && msg.sender.id === order.writer.userId;
                    return (
                      <div key={msg.id} className={`flex gap-3 ${isClient ? "" : "flex-row-reverse"}`}>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                          isClient ? "bg-blue-500/30 text-blue-400" :
                          isWriter ? "bg-brand-500/30 text-brand-400" :
                          "bg-gray-500/30 text-gray-400"
                        }`}>
                          {msg.sender.name[0]}
                        </div>
                        <div className={`max-w-[70%] ${isClient ? "" : "items-end"} flex flex-col gap-1`}>
                          <span className={`text-xs text-gray-500 ${isClient ? "" : "text-right"}`}>
                            {msg.sender.name} · {new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                          </span>
                          <div className={`p-3 rounded-2xl text-sm ${
                            isClient
                              ? "bg-white/10 text-gray-200 rounded-tl-sm"
                              : "bg-brand-500/30 text-white rounded-tr-sm"
                          }`}>
                            {msg.content}
                            {msg.fileUrl && (
                              <a href={msg.fileUrl} target="_blank" rel="noopener noreferrer"
                                className="flex items-center gap-1.5 mt-2 text-brand-400 hover:text-brand-300 text-xs">
                                <Download className="w-3 h-3" /> {msg.fileName || "Attachment"}
                              </a>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {activeTab === "payment" && (
            <div className="grid lg:grid-cols-2 gap-6">
              <div className="glass-card p-6">
                <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider mb-4 flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-brand-400" /> Payment Info
                </h3>
                {order.payment ? (
                  <>
                    <div className="mb-4">
                      <span className={`px-3 py-1 rounded-full text-sm font-semibold ${paymentCfg?.color || ""}`}>
                        {paymentCfg?.label || order.payment.status}
                      </span>
                    </div>
                    <div className="space-y-3">
                      {[
                        { label: "Total Amount", value: formatPrice(order.payment.amount), bold: true },
                        { label: "Escrow Amount", value: formatPrice(order.payment.escrowAmount) },
                        { label: "Platform Commission", value: formatPrice(order.payment.commissionAmount) },
                        { label: "Writer Payout", value: formatPrice(order.payment.writerAmount), highlight: true },
                        { label: "Paystack Ref", value: order.payment.paystackRef || "—" },
                        { label: "Paid At", value: order.payment.paidAt ? new Date(order.payment.paidAt).toLocaleString() : "Not paid" },
                        { label: "Released At", value: order.payment.releasedAt ? new Date(order.payment.releasedAt).toLocaleString() : "Not released" },
                      ].map(item => (
                        <div key={item.label} className="flex justify-between items-center py-2 border-b border-white/5">
                          <span className="text-sm text-gray-400">{item.label}</span>
                          <span className={`text-sm ${item.bold ? "font-bold text-white" : item.highlight ? "font-semibold text-brand-400" : "text-white"}`}>
                            {item.value}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Release Payment Action */}
                    {order.payment.status === "ESCROW" && order.status === "COMPLETED" && (
                      <div className="mt-6 p-4 rounded-xl bg-green-500/10 border border-green-500/20">
                        <p className="text-sm text-green-400 mb-3 flex items-center gap-2">
                          <CheckCircle className="w-4 h-4" />
                          Order completed — payment can be released to the writer
                        </p>
                        <button
                          onClick={() => releasePaymentMutation.mutate()}
                          disabled={releasePaymentMutation.isPending}
                          className="btn-primary text-sm w-full"
                        >
                          {releasePaymentMutation.isPending ? (
                            <span className="flex items-center justify-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> Releasing...</span>
                          ) : "Release Payment to Writer"}
                        </button>
                      </div>
                    )}

                    {/* Refund Action */}
                    {["ESCROW", "PAID"].includes(order.payment.status) && order.status === "CANCELLED" && (
                      <div className="mt-6 p-4 rounded-xl bg-orange-500/10 border border-orange-500/20">
                        <p className="text-sm text-orange-400 mb-3 flex items-center gap-2">
                          <AlertTriangle className="w-4 h-4" />
                          Order cancelled — consider refunding the client
                        </p>
                        <button
                          onClick={() => updateMutation.mutate({ action: "refund" })}
                          disabled={updateMutation.isPending}
                          className="w-full py-2 rounded-xl text-sm font-medium bg-orange-500/20 text-orange-400 hover:bg-orange-500/30 transition-colors"
                        >
                          Process Refund
                        </button>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-center py-8">
                    <DollarSign className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                    <p className="text-gray-400">No payment record found</p>
                    <p className="text-xs text-gray-500 mt-1">Payment is created when the client pays for the order</p>
                  </div>
                )}
              </div>

              <div className="glass-card p-6">
                <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider mb-4 flex items-center gap-2">
                  <Shield className="w-4 h-4 text-brand-400" /> Admin Actions
                </h3>
                <div className="space-y-3">
                  <button
                    onClick={() => { setSelectedStatus("DISPUTED"); setShowStatusModal(true); }}
                    className="w-full flex items-center gap-3 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 transition-colors text-sm font-medium"
                  >
                    <AlertTriangle className="w-4 h-4" /> Mark as Disputed
                  </button>
                  <button
                    onClick={() => { setSelectedStatus("CANCELLED"); setShowStatusModal(true); }}
                    className="w-full flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10 text-gray-300 hover:bg-white/10 transition-colors text-sm font-medium"
                  >
                    <XCircle className="w-4 h-4" /> Cancel Order
                  </button>
                  <button
                    onClick={() => { setSelectedStatus("COMPLETED"); setShowStatusModal(true); }}
                    className="w-full flex items-center gap-3 p-3 rounded-xl bg-green-500/10 border border-green-500/20 text-green-400 hover:bg-green-500/20 transition-colors text-sm font-medium"
                  >
                    <CheckCircle className="w-4 h-4" /> Force Complete
                  </button>
                  <Link
                    href={`/admin/disputes?order=${order.id}`}
                    className="w-full flex items-center gap-3 p-3 rounded-xl bg-brand-500/10 border border-brand-500/20 text-brand-400 hover:bg-brand-500/20 transition-colors text-sm font-medium"
                  >
                    <Shield className="w-4 h-4" /> Go to Dispute Resolution
                  </Link>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Assign Writer Modal */}
      <AnimatePresence>
        {showAssignModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowAssignModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              className="w-full max-w-lg glass-card p-6"
            >
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <PenTool className="w-5 h-5 text-brand-400" /> Assign Writer
              </h3>

              <input
                value={writerSearch}
                onChange={e => setWriterSearch(e.target.value)}
                placeholder="Search writers..."
                className="input-field w-full mb-4"
              />

              <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                {writersData && writersData.length > 0 ? writersData.map(w => (
                  <button
                    key={w.id}
                    onClick={() => setSelectedWriter(w.id)}
                    className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all text-left ${
                      selectedWriter === w.id
                        ? "border-brand-500 bg-brand-500/20"
                        : "border-white/10 bg-white/5 hover:bg-white/10"
                    }`}
                  >
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-500 to-brand-500 flex items-center justify-center text-white text-sm font-bold shrink-0">
                      {w.user.avatar ? (
                        <img src={w.user.avatar} alt={w.user.name} className="w-9 h-9 rounded-full object-cover" />
                      ) : w.user.name[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-white text-sm">{w.user.name}</p>
                      <p className="text-xs text-gray-400 truncate">{w.specialization || "General"}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="flex items-center gap-1 justify-end">
                        <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                        <span className="text-xs font-medium text-white">{w.rating.toFixed(1)}</span>
                      </div>
                      <p className="text-xs text-gray-400">{w.currentOrdersCount} active</p>
                    </div>
                  </button>
                )) : (
                  <div className="text-center py-8 text-gray-500">
                    {writersData ? "No writers found" : <Loader2 className="w-6 h-6 animate-spin mx-auto text-brand-400" />}
                  </div>
                )}
              </div>

              <div className="flex gap-3 mt-4 pt-4 border-t border-white/10">
                <button onClick={() => setShowAssignModal(false)} className="flex-1 btn-secondary">Cancel</button>
                <button
                  onClick={() => updateMutation.mutate({ writerId: selectedWriter, status: "ASSIGNED" })}
                  disabled={!selectedWriter || updateMutation.isPending}
                  className="flex-1 btn-primary disabled:opacity-50"
                >
                  {updateMutation.isPending ? (
                    <span className="flex items-center justify-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> Assigning...</span>
                  ) : "Assign Writer"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Change Status Modal */}
      <AnimatePresence>
        {showStatusModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowStatusModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              className="w-full max-w-md glass-card p-6"
            >
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <RefreshCw className="w-5 h-5 text-brand-400" /> Change Order Status
              </h3>
              <p className="text-sm text-gray-400 mb-4">
                Current status: <span className={`font-semibold ${statusCfg.color.split(" ")[0]}`}>{statusCfg.label}</span>
              </p>

              <div className="grid grid-cols-2 gap-2 mb-4">
                {activeStatuses.map(s => {
                  const cfg = STATUS_CONFIG[s];
                  const Icon = cfg.icon;
                  return (
                    <button
                      key={s}
                      onClick={() => setSelectedStatus(s)}
                      className={`flex items-center gap-2 p-3 rounded-xl border text-sm transition-all ${
                        selectedStatus === s
                          ? `border-current ${cfg.color}`
                          : "border-white/10 text-gray-400 hover:text-white hover:border-white/30"
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      {cfg.label}
                    </button>
                  );
                })}
              </div>

              <textarea
                value={adminNote}
                onChange={e => setAdminNote(e.target.value)}
                placeholder="Admin note (optional)..."
                rows={3}
                className="input-field w-full mb-4 resize-none"
              />

              <div className="flex gap-3">
                <button onClick={() => setShowStatusModal(false)} className="flex-1 btn-secondary">Cancel</button>
                <button
                  onClick={() => updateMutation.mutate({ status: selectedStatus, adminNote })}
                  disabled={!selectedStatus || updateMutation.isPending}
                  className="flex-1 btn-primary disabled:opacity-50"
                >
                  {updateMutation.isPending ? (
                    <span className="flex items-center justify-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> Updating...</span>
                  ) : "Update Status"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
