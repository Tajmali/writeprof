"use client";

import { useState, useRef, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Send, Paperclip, Search, ArrowLeft, Loader2, MessageSquare } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/store";
import type { Message, Order } from "@/types";

function ChatContent() {
  const searchParams = useSearchParams();
  const { user } = useAuthStore();
  const qc = useQueryClient();
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(searchParams.get("orderId"));
  const [orderSearch, setOrderSearch] = useState("");
  const [message, setMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const { data: orders = [] } = useQuery<Order[]>({
    queryKey: ["chat-orders"],
    queryFn: async () => {
      const res = await fetch("/api/orders?limit=50");
      const data = await res.json();
      return data.data?.orders || [];
    },
  });

  const { data: messages = [], isLoading: messagesLoading } = useQuery<Message[]>({
    queryKey: ["messages", selectedOrderId],
    queryFn: async () => {
      const res = await fetch(`/api/chat?orderId=${selectedOrderId}`);
      const data = await res.json();
      return data.data?.messages || [];
    },
    enabled: !!selectedOrderId,
    refetchInterval: 5000,
  });

  const sendMutation = useMutation({
    mutationFn: async (content: string) => {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId: selectedOrderId, content }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error);
      return data.data.message;
    },
    onSuccess: () => {
      setMessage("");
      qc.invalidateQueries({ queryKey: ["messages", selectedOrderId] });
    },
  });

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 128)}px`;
    }
  }, [message]);

  const activeOrders = orders.filter((o: Order) =>
    !["DRAFT", "CANCELLED"].includes(o.status) &&
    (orderSearch === "" || o.title.toLowerCase().includes(orderSearch.toLowerCase()) ||
     o.orderNumber.toLowerCase().includes(orderSearch.toLowerCase()))
  );

  const selectedOrder = orders.find((o: Order) => o.id === selectedOrderId);

  const handleSend = () => {
    if (!message.trim() || !selectedOrderId || sendMutation.isPending) return;
    sendMutation.mutate(message.trim());
  };

  return (
    <div className="flex h-full overflow-hidden">
      {/* Order list sidebar */}
      <div className={`w-72 flex-shrink-0 border-r border-white/5 flex flex-col bg-slate-950/30 ${selectedOrderId ? "hidden lg:flex" : "flex"}`}>
        <div className="p-4 border-b border-white/5">
          <h2 className="text-white font-semibold mb-3">Messages</h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              value={orderSearch}
              onChange={e => setOrderSearch(e.target.value)}
              placeholder="Search orders..."
              className="input-field pl-9 py-2 text-sm w-full"
            />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {activeOrders.length === 0 ? (
            <div className="p-6 text-center text-gray-500 text-sm">No active orders found</div>
          ) : activeOrders.map((order: Order) => (
            <button
              key={order.id}
              onClick={() => setSelectedOrderId(order.id)}
              className={`w-full text-left p-4 border-b border-white/5 hover:bg-white/5 transition-colors ${
                selectedOrderId === order.id ? "bg-brand-500/10 border-l-2 border-l-brand-500" : ""
              }`}
            >
              <p className="text-white text-sm font-medium truncate">{order.title}</p>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-gray-500 text-xs">#{order.orderNumber}</span>
                <span className="text-xs text-gray-600">·</span>
                <span className={`text-xs ${
                  order.status === "IN_PROGRESS" ? "text-blue-400" :
                  order.status === "ASSIGNED" ? "text-brand-400" :
                  "text-gray-500"
                }`}>{order.status.replace(/_/g, " ")}</span>
              </div>
              {order.writer && (
                <p className="text-xs text-gray-500 mt-0.5">Writer: {order.writer.user.name}</p>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Chat area */}
      <div className={`flex-1 flex flex-col min-w-0 ${!selectedOrderId ? "hidden lg:flex" : "flex"}`}>
        {!selectedOrderId ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4">
                <MessageSquare className="w-8 h-8 text-gray-600" />
              </div>
              <p className="text-gray-400 font-medium">Select an order to view messages</p>
              <p className="text-gray-600 text-sm mt-1">Your conversations will appear here</p>
            </div>
          </div>
        ) : (
          <>
            {/* Chat header */}
            <div className="p-4 border-b border-white/5 flex items-center gap-3 bg-slate-950/30">
              <button
                onClick={() => setSelectedOrderId(null)}
                className="lg:hidden p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/10"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              <div className="flex-1 min-w-0">
                <p className="text-white font-medium text-sm truncate">{selectedOrder?.title}</p>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <span>#{selectedOrder?.orderNumber}</span>
                  {selectedOrder?.writer && (
                    <>
                      <span>·</span>
                      <span className="text-brand-400">{selectedOrder.writer.user.name}</span>
                    </>
                  )}
                </div>
              </div>
              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                selectedOrder?.status === "IN_PROGRESS" ? "bg-blue-500/20 text-blue-400" :
                selectedOrder?.status === "ASSIGNED" ? "bg-brand-500/20 text-brand-400" :
                "bg-white/10 text-gray-400"
              }`}>{selectedOrder?.status.replace(/_/g, " ")}</span>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messagesLoading ? (
                <div className="flex justify-center pt-8">
                  <Loader2 className="w-6 h-6 text-brand-400 animate-spin" />
                </div>
              ) : messages.length === 0 ? (
                <div className="text-center pt-8">
                  <MessageSquare className="w-10 h-10 text-gray-700 mx-auto mb-2" />
                  <p className="text-gray-500 text-sm">No messages yet. Start the conversation!</p>
                </div>
              ) : (
                messages.map((msg: Message) => {
                  const isMe = msg.senderId === user?.id;
                  return (
                    <motion.div
                      key={msg.id}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex ${isMe ? "justify-end" : "justify-start"} gap-2`}
                    >
                      {!isMe && (
                        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-brand-500 to-brand-600 flex items-center justify-center text-white text-xs font-bold shrink-0 mt-auto">
                          {msg.sender?.name?.[0] || "?"}
                        </div>
                      )}
                      <div className={`max-w-xs lg:max-w-md ${isMe ? "items-end" : "items-start"} flex flex-col gap-1`}>
                        {!isMe && (
                          <p className="text-gray-500 text-xs ml-1">{msg.sender?.name}</p>
                        )}
                        <div className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                          isMe
                            ? "bg-brand-600 text-white rounded-tr-sm"
                            : "bg-white/10 text-gray-200 rounded-tl-sm"
                        }`}>
                          {msg.content}
                          {msg.fileUrl && (
                            <a href={msg.fileUrl} target="_blank" rel="noopener noreferrer"
                              className="flex items-center gap-1.5 mt-2 text-xs underline opacity-80 hover:opacity-100">
                              📎 {msg.fileName || "Attachment"}
                            </a>
                          )}
                        </div>
                        <p className={`text-gray-600 text-xs ${isMe ? "text-right mr-1" : "ml-1"}`}>
                          {new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </p>
                      </div>
                    </motion.div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 border-t border-white/5 bg-slate-950/30">
              <div className="flex items-end gap-2">
                <button className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 transition-colors text-gray-400 hover:text-white shrink-0">
                  <Paperclip className="w-4 h-4" />
                </button>
                <textarea
                  ref={textareaRef}
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                  placeholder="Type your message..."
                  rows={1}
                  className="flex-1 input-field resize-none min-h-[44px] py-2.5 text-sm"
                />
                <button
                  onClick={handleSend}
                  disabled={!message.trim() || sendMutation.isPending}
                  className="p-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 transition-colors text-white shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {sendMutation.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                </button>
              </div>
              <p className="text-gray-700 text-xs mt-1.5 text-center">Enter to send · Shift+Enter for new line</p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default function ChatPage() {
  return (
    <div className="h-full flex flex-col">
      <Suspense fallback={
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-brand-400 animate-spin" />
        </div>
      }>
        <ChatContent />
      </Suspense>
    </div>
  );
}
