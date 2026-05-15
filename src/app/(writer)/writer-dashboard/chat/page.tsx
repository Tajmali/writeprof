"use client";

import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { MessageSquare, Send, Search, ArrowLeft, Clock, FileText, Loader2 } from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";

interface Order {
  id: string; orderNumber: string; title: string; status: string;
  client: { id: string; name: string; avatar: string | null };
  _count: { messages: number };
}
interface Message {
  id: string; content: string; senderId: string;
  sender: { name: string; avatar: string | null };
  createdAt: string; isRead: boolean;
}

export default function WriterChatPage() {
  const queryClient = useQueryClient();
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [message, setMessage] = useState("");
  const [search, setSearch] = useState("");
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/api/auth/me").then(r => r.json()).then(d => { if (d.success) setCurrentUserId(d.data.user.id); });
  }, []);

  const { data: orders } = useQuery({
    queryKey: ["writer-chat-orders"],
    queryFn: async () => {
      const res = await fetch("/api/orders?status=ASSIGNED,IN_PROGRESS,UNDER_REVIEW,REVISION,COMPLETED&limit=50");
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      return json.data.orders as Order[];
    },
  });

  const { data: messages, isLoading: msgsLoading } = useQuery({
    queryKey: ["writer-chat-messages", selectedOrder?.id],
    queryFn: async () => {
      if (!selectedOrder) return [];
      const res = await fetch(`/api/chat?orderId=${selectedOrder.id}`);
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      return json.data.messages as Message[];
    },
    enabled: !!selectedOrder,
    refetchInterval: 5000,
  });

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMutation = useMutation({
    mutationFn: async (content: string) => {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId: selectedOrder!.id, content }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      return json.data;
    },
    onSuccess: () => {
      setMessage("");
      queryClient.invalidateQueries({ queryKey: ["writer-chat-messages", selectedOrder?.id] });
    },
    onError: () => toast.error("Failed to send message"),
  });

  const filteredOrders = orders?.filter(o =>
    !search ||
    o.title.toLowerCase().includes(search.toLowerCase()) ||
    o.client.name.toLowerCase().includes(search.toLowerCase())
  ) || [];

  const handleSend = () => {
    if (!message.trim() || !selectedOrder) return;
    sendMutation.mutate(message.trim());
  };

  return (
    <div className="flex h-[calc(100vh-4rem)] bg-[#0a0f1e]">
      {/* Sidebar */}
      <div className={`w-full sm:w-80 border-r border-white/10 flex flex-col ${selectedOrder ? "hidden sm:flex" : "flex"}`}>
        <div className="p-4 border-b border-white/10">
          <h2 className="font-bold text-white mb-3">Messages</h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search conversations..."
              className="input-field pl-9 w-full text-sm"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {filteredOrders.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-500 p-4 text-center">
              <MessageSquare className="w-8 h-8 mb-2" />
              <p className="text-sm">No conversations yet</p>
              <p className="text-xs mt-1">Accept orders to start chatting with clients</p>
            </div>
          ) : (
            filteredOrders.map(order => (
              <button
                key={order.id}
                onClick={() => setSelectedOrder(order)}
                className={`w-full p-4 border-b border-white/5 text-left hover:bg-white/5 transition-colors ${
                  selectedOrder?.id === order.id ? "bg-brand-500/10 border-l-2 border-l-brand-500" : ""
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-full bg-brand-500/20 flex items-center justify-center text-sm font-bold text-brand-400 shrink-0">
                    {order.client.name[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-white truncate">{order.client.name}</span>
                      {order._count.messages > 0 && (
                        <span className="w-5 h-5 rounded-full bg-brand-500 text-white text-xs flex items-center justify-center ml-2 shrink-0">
                          {order._count.messages > 9 ? "9+" : order._count.messages}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-400 truncate mt-0.5">{order.title}</p>
                    <div className="flex items-center gap-1 mt-1">
                      <span className={`px-1.5 py-0.5 rounded text-xs ${
                        order.status === "COMPLETED" ? "bg-green-500/20 text-green-400" :
                        order.status === "REVISION" ? "bg-orange-500/20 text-orange-400" :
                        "bg-brand-500/20 text-brand-400"
                      }`}>{order.status.replace("_", " ")}</span>
                    </div>
                  </div>
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className={`flex-1 flex flex-col ${!selectedOrder ? "hidden sm:flex" : "flex"}`}>
        {!selectedOrder ? (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-500">
            <MessageSquare className="w-16 h-16 mb-4 text-gray-700" />
            <h3 className="text-lg font-semibold text-gray-400 mb-2">Select a conversation</h3>
            <p className="text-sm text-gray-600">Choose an order from the left to start messaging</p>
          </div>
        ) : (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-white/10 flex items-center gap-3">
              <button onClick={() => setSelectedOrder(null)} className="sm:hidden p-2 rounded-lg hover:bg-white/10">
                <ArrowLeft className="w-5 h-5 text-gray-400" />
              </button>
              <div className="w-9 h-9 rounded-full bg-brand-500/20 flex items-center justify-center text-sm font-bold text-brand-400">
                {selectedOrder.client.name[0]}
              </div>
              <div className="flex-1">
                <p className="font-semibold text-white text-sm">{selectedOrder.client.name}</p>
                <p className="text-xs text-gray-400 truncate">{selectedOrder.title}</p>
              </div>
              <Link href={`/writer-dashboard/work/${selectedOrder.id}`}
                className="btn-secondary text-xs px-3 py-1.5 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5" /> View Order
              </Link>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {msgsLoading ? (
                <div className="flex items-center justify-center h-full">
                  <Loader2 className="w-6 h-6 text-brand-400 animate-spin" />
                </div>
              ) : messages?.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-gray-500">
                  <MessageSquare className="w-8 h-8 mb-2" />
                  <p className="text-sm">No messages yet. Say hello!</p>
                </div>
              ) : (
                messages?.map(msg => {
                  const isMe = msg.senderId === currentUserId;
                  return (
                    <motion.div
                      key={msg.id}
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex gap-2 ${isMe ? "flex-row-reverse" : ""}`}
                    >
                      <div className="w-7 h-7 rounded-full bg-brand-500/20 flex items-center justify-center text-xs font-bold text-brand-400 shrink-0">
                        {msg.sender.name[0]}
                      </div>
                      <div className={`max-w-xs lg:max-w-md ${isMe ? "items-end" : "items-start"} flex flex-col gap-1`}>
                        <div className={`px-4 py-2.5 rounded-2xl ${isMe ? "bg-brand-500 text-white rounded-tr-sm" : "bg-white/10 text-gray-200 rounded-tl-sm"}`}>
                          <p className="text-sm leading-relaxed">{msg.content}</p>
                        </div>
                        <div className={`flex items-center gap-1 text-xs text-gray-500 ${isMe ? "flex-row-reverse" : ""}`}>
                          <Clock className="w-3 h-3" />
                          {new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </div>
                      </div>
                    </motion.div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 border-t border-white/10">
              <div className="flex gap-2">
                <input
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && !e.shiftKey && handleSend()}
                  placeholder={`Message ${selectedOrder.client.name}...`}
                  className="input-field flex-1"
                />
                <button
                  onClick={handleSend}
                  disabled={sendMutation.isPending || !message.trim()}
                  className="btn-primary px-4 flex items-center gap-2"
                >
                  {sendMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-xs text-gray-600 mt-1.5 text-center">Press Enter to send · Be professional and helpful</p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
