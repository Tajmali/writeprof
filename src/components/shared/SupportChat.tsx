"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X, Send, Bot, User, Loader2, Minimize2 } from "lucide-react";

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

const INITIAL_MESSAGE: Message = {
  role: "assistant",
  content: "Hi there! 👋 I'm Aria, WriteProf's AI support assistant. I can help you with orders, pricing, writer questions, payments, and more. What can I help you with today?",
  timestamp: new Date(),
};

const QUICK_REPLIES = [
  "How does pricing work?",
  "How fast can I get my order?",
  "How do I become a writer?",
  "Is my payment secure?",
];

export function SupportChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([INITIAL_MESSAGE]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [hasNewMessage, setHasNewMessage] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen && !isMinimized) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen, isMinimized]);

  useEffect(() => {
    if (isOpen && !isMinimized) {
      setHasNewMessage(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen, isMinimized]);

  const sendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;

    const userMessage: Message = { role: "user", content: text.trim(), timestamp: new Date() };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/support/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: updatedMessages.map((m) => ({ role: m.role, content: m.content })),
        }),
      });

      const data = await res.json();
      const reply = data.reply || "Sorry, I'm having trouble right now. Please email oriaventures@gmail.com";

      const assistantMessage: Message = {
        role: "assistant",
        content: reply,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);

      if (isMinimized) setHasNewMessage(true);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Sorry, something went wrong. Please email us at oriaventures@gmail.com and we'll help you right away! 🙏",
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  const formatTime = (date: Date) =>
    date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  return (
    <>
      {/* Floating Button */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
        <AnimatePresence>
          {isOpen && !isMinimized && (
            <motion.div
              key="chat-window"
              initial={{ opacity: 0, scale: 0.85, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.85, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="w-[360px] sm:w-[380px] rounded-2xl overflow-hidden shadow-2xl border border-white/10"
              style={{ background: "#0f172a" }}
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-brand-700 to-brand-500 px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center">
                      <Bot className="w-5 h-5 text-white" />
                    </div>
                    <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-400 rounded-full border-2 border-brand-700" />
                  </div>
                  <div>
                    <p className="text-white font-semibold text-sm leading-tight">Aria</p>
                    <p className="text-white/70 text-xs">WriteProf AI Support · Online</p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setIsMinimized(true)}
                    className="p-1.5 rounded-lg hover:bg-white/20 transition-colors text-white/80 hover:text-white"
                    aria-label="Minimize"
                  >
                    <Minimize2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="p-1.5 rounded-lg hover:bg-white/20 transition-colors text-white/80 hover:text-white"
                    aria-label="Close"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Messages */}
              <div className="h-80 overflow-y-auto px-4 py-4 space-y-4 scrollbar-thin scrollbar-thumb-white/10">
                {messages.map((msg, i) => (
                  <div key={i} className={`flex gap-2.5 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}>
                    {/* Avatar */}
                    <div className={`w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center text-white text-xs font-bold
                      ${msg.role === "assistant" ? "bg-gradient-to-br from-brand-600 to-brand-400" : "bg-gradient-to-br from-violet-600 to-violet-400"}`}>
                      {msg.role === "assistant" ? <Bot className="w-3.5 h-3.5" /> : <User className="w-3.5 h-3.5" />}
                    </div>
                    {/* Bubble */}
                    <div className={`max-w-[78%] ${msg.role === "user" ? "items-end" : "items-start"} flex flex-col gap-1`}>
                      <div className={`px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed
                        ${msg.role === "assistant"
                          ? "bg-slate-800 text-slate-200 rounded-tl-sm"
                          : "bg-gradient-to-r from-brand-600 to-brand-500 text-white rounded-tr-sm"}`}>
                        {msg.content}
                      </div>
                      <span className="text-slate-600 text-[10px] px-1">{formatTime(msg.timestamp)}</span>
                    </div>
                  </div>
                ))}

                {/* Typing indicator */}
                {isLoading && (
                  <div className="flex gap-2.5">
                    <div className="w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center bg-gradient-to-br from-brand-600 to-brand-400">
                      <Bot className="w-3.5 h-3.5 text-white" />
                    </div>
                    <div className="bg-slate-800 rounded-2xl rounded-tl-sm px-4 py-3 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                      <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                      <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Quick Replies — show only on first message */}
              {messages.length === 1 && (
                <div className="px-4 pb-2 flex flex-wrap gap-2">
                  {QUICK_REPLIES.map((q) => (
                    <button
                      key={q}
                      onClick={() => sendMessage(q)}
                      className="text-xs px-3 py-1.5 rounded-full border border-brand-500/40 text-brand-400 hover:bg-brand-500/10 transition-colors"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              )}

              {/* Input */}
              <div className="px-3 py-3 border-t border-white/5">
                <div className="flex items-center gap-2 bg-slate-800 rounded-xl px-3 py-2">
                  <input
                    ref={inputRef}
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Type a message..."
                    className="flex-1 bg-transparent text-slate-200 text-sm outline-none placeholder:text-slate-500"
                    disabled={isLoading}
                  />
                  <button
                    onClick={() => sendMessage(input)}
                    disabled={!input.trim() || isLoading}
                    className="w-8 h-8 rounded-lg bg-brand-600 hover:bg-brand-500 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center transition-colors flex-shrink-0"
                  >
                    {isLoading ? (
                      <Loader2 className="w-4 h-4 text-white animate-spin" />
                    ) : (
                      <Send className="w-3.5 h-3.5 text-white" />
                    )}
                  </button>
                </div>
                <p className="text-center text-slate-600 text-[10px] mt-2">Powered by WriteProf AI · oriaventures@gmail.com</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Minimized bar */}
        <AnimatePresence>
          {isOpen && isMinimized && (
            <motion.button
              key="minimized"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              onClick={() => setIsMinimized(false)}
              className="flex items-center gap-3 bg-gradient-to-r from-brand-700 to-brand-500 text-white px-4 py-3 rounded-2xl shadow-xl border border-white/10 hover:shadow-brand-500/20 transition-all"
            >
              <Bot className="w-4 h-4" />
              <span className="text-sm font-semibold">Aria — Support</span>
              {hasNewMessage && (
                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              )}
            </motion.button>
          )}
        </AnimatePresence>

        {/* Main toggle button */}
        <motion.button
          onClick={() => {
            if (isOpen && isMinimized) {
              setIsMinimized(false);
            } else {
              setIsOpen((v) => !v);
              setIsMinimized(false);
            }
            setHasNewMessage(false);
          }}
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.95 }}
          className="relative w-14 h-14 rounded-full bg-gradient-to-br from-brand-600 to-brand-400 shadow-lg shadow-brand-500/30 flex items-center justify-center text-white transition-all hover:shadow-brand-500/50"
          aria-label="Open support chat"
        >
          <AnimatePresence mode="wait">
            {isOpen && !isMinimized ? (
              <motion.div key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.15 }}>
                <X className="w-6 h-6" />
              </motion.div>
            ) : (
              <motion.div key="open" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.15 }}>
                <MessageCircle className="w-6 h-6" />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Pulse ring */}
          {!isOpen && (
            <span className="absolute inset-0 rounded-full bg-brand-500 animate-ping opacity-20" />
          )}

          {/* Unread dot */}
          {hasNewMessage && (
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-[#020817] animate-pulse" />
          )}
        </motion.button>
      </div>
    </>
  );
}
