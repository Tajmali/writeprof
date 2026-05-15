"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { CheckCircle, Clock, Star } from "lucide-react";

const recentOrders = [
  { title: "MBA Dissertation — Chapter 4", category: "Academic", words: 8000, time: "18 hrs", rating: 5, status: "Completed", timeAgo: "2 min ago" },
  { title: "Product Launch Press Release", category: "Copywriting", words: 800, time: "2 hrs", rating: 5, status: "Completed", timeAgo: "7 min ago" },
  { title: "Clinical Case Study — Cardiology", category: "Medical", words: 3500, time: "6 hrs", rating: 5, status: "Completed", timeAgo: "15 min ago" },
  { title: "Homepage Copy + 3 Landing Pages", category: "Copywriting", words: 2200, time: "5 hrs", rating: 5, status: "Completed", timeAgo: "23 min ago" },
  { title: "Literature Review — AI Ethics", category: "Academic", words: 5000, time: "12 hrs", rating: 5, status: "Completed", timeAgo: "31 min ago" },
  { title: "Grant Proposal — NGO Foundation", category: "Business", words: 4000, time: "10 hrs", rating: 4, status: "Completed", timeAgo: "45 min ago" },
];

export function RecentOrders() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section className="py-24 lg:py-32 relative" ref={ref}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-green-500/10 border border-green-500/20 text-green-400 text-sm font-semibold mb-4">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            Live Completions
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white mb-4">
            Orders Completed{" "}
            <span className="gradient-text">Right Now</span>
          </h2>
          <p className="text-slate-400 text-lg max-w-xl mx-auto">
            Real orders being completed as you read this. Every 90 seconds, a new client gets their work delivered.
          </p>
        </motion.div>

        <div className="space-y-3">
          {recentOrders.map((order, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -20 }}
              animate={inView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.4, delay: i * 0.1 }}
              whileHover={{ x: 4 }}
              className="flex items-center gap-4 lg:gap-6 p-4 lg:p-5 glass rounded-xl hover:border-white/20 transition-all duration-200 group cursor-default"
            >
              {/* Status indicator */}
              <div className="w-9 h-9 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center flex-shrink-0">
                <CheckCircle className="w-4 h-4 text-green-400" />
              </div>

              {/* Order info */}
              <div className="flex-1 min-w-0">
                <p className="text-white font-medium text-sm truncate group-hover:text-brand-300 transition-colors">
                  {order.title}
                </p>
                <div className="flex items-center gap-3 mt-0.5">
                  <span className="text-slate-500 text-xs">{order.category}</span>
                  <span className="text-slate-600 text-xs">·</span>
                  <span className="text-slate-500 text-xs">{order.words.toLocaleString()} words</span>
                </div>
              </div>

              {/* Metadata */}
              <div className="hidden sm:flex items-center gap-4 flex-shrink-0">
                <div className="flex items-center gap-1 text-slate-500 text-xs">
                  <Clock className="w-3 h-3" />
                  {order.time}
                </div>
                <div className="flex items-center gap-0.5">
                  {[...Array(order.rating)].map((_, j) => (
                    <Star key={j} className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
              </div>

              {/* Time ago */}
              <div className="flex-shrink-0">
                <span className="text-xs text-slate-600">{order.timeAgo}</span>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ delay: 0.8 }}
          className="text-center mt-8"
        >
          <p className="text-slate-600 text-sm">
            <span className="text-green-400 font-semibold">12,847+</span> total orders completed ·{" "}
            <span className="text-white font-semibold">98%</span> delivered on time
          </p>
        </motion.div>
      </div>
    </section>
  );
}
