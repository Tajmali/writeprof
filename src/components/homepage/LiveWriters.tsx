"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Star, CheckCircle, Clock } from "lucide-react";

const writers = [
  { name: "Dr. Sarah K.", avatar: "SK", specialty: "Academic Writing & Research", rating: 4.9, orders: 847, onTime: 99, level: "PhD", status: "available", tags: ["Essays", "Dissertations", "Research Papers"] },
  { name: "James O.", avatar: "JO", specialty: "Copywriting & Marketing", rating: 4.8, orders: 1203, onTime: 97, level: "Professional", status: "available", tags: ["Ads", "Landing Pages", "Email Copy"] },
  { name: "Prof. Amara", avatar: "PA", specialty: "Literature & Creative Writing", rating: 5.0, orders: 432, onTime: 100, level: "PhD", status: "available", tags: ["Essays", "Creative Writing", "Poetry"] },
  { name: "Michael C.", avatar: "MC", specialty: "Business & Technical Writing", rating: 4.7, orders: 621, onTime: 96, level: "Masters", status: "busy", tags: ["Reports", "Proposals", "Technical Docs"] },
  { name: "Dr. Olivia R.", avatar: "OR", specialty: "Science & Medical Writing", rating: 4.9, orders: 389, onTime: 98, level: "PhD", status: "available", tags: ["Research", "Case Studies", "Lab Reports"] },
  { name: "Tunde A.", avatar: "TA", specialty: "SEO & Blog Content", rating: 4.8, orders: 1567, onTime: 98, level: "Professional", status: "available", tags: ["Blog Posts", "SEO Articles", "Web Content"] },
];

export function LiveWriters() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  const availableCount = writers.filter((w) => w.status === "available").length;

  return (
    <section id="writers" className="py-24 lg:py-32 relative" ref={ref}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-green-500/10 border border-green-500/20 text-green-400 text-sm font-semibold mb-4">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            {availableCount} Writers Available Right Now
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white mb-4">
            Expert Writers,{" "}
            <span className="gradient-text">Ready to Help</span>
          </h2>
          <p className="text-slate-400 text-lg max-w-xl mx-auto">
            Every writer on WriteProf is vetted, verified, and rated by real clients. No bots, no outsourcing.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
          {writers.map((writer, i) => (
            <motion.div
              key={writer.name}
              initial={{ opacity: 0, y: 30 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              whileHover={{ y: -4 }}
              className="glass-card p-6 hover:border-white/20 transition-all duration-300 group"
            >
              {/* Writer header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-brand-600 to-brand-400 flex items-center justify-center text-white font-bold text-sm">
                      {writer.avatar}
                    </div>
                    <div className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-slate-900 ${
                      writer.status === "available" ? "bg-green-400" : "bg-amber-400"
                    }`} />
                  </div>
                  <div>
                    <h3 className="text-white font-semibold text-sm flex items-center gap-1.5">
                      {writer.name}
                      <CheckCircle className="w-3.5 h-3.5 text-brand-400" />
                    </h3>
                    <p className="text-slate-500 text-xs">{writer.specialty}</p>
                  </div>
                </div>
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                  writer.status === "available"
                    ? "bg-green-500/10 text-green-400 border border-green-500/20"
                    : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                }`}>
                  {writer.status === "available" ? "Available" : "Busy"}
                </span>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-3 mb-4">
                <div className="text-center p-2.5 bg-white/5 rounded-lg">
                  <div className="flex items-center justify-center gap-0.5 text-yellow-400 mb-0.5">
                    <Star className="w-3 h-3 fill-current" />
                    <span className="text-white text-sm font-bold">{writer.rating}</span>
                  </div>
                  <p className="text-slate-600 text-xs">Rating</p>
                </div>
                <div className="text-center p-2.5 bg-white/5 rounded-lg">
                  <p className="text-white text-sm font-bold">{writer.orders}</p>
                  <p className="text-slate-600 text-xs">Orders</p>
                </div>
                <div className="text-center p-2.5 bg-white/5 rounded-lg">
                  <div className="flex items-center justify-center gap-0.5">
                    <Clock className="w-3 h-3 text-brand-400" />
                    <span className="text-white text-sm font-bold">{writer.onTime}%</span>
                  </div>
                  <p className="text-slate-600 text-xs">On-time</p>
                </div>
              </div>

              {/* Level & Tags */}
              <div className="flex flex-wrap gap-1.5">
                <span className="badge-blue text-xs">{writer.level}</span>
                {writer.tags.slice(0, 2).map((tag) => (
                  <span key={tag} className="text-xs px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-slate-400">
                    {tag}
                  </span>
                ))}
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ delay: 0.8 }}
          className="text-center mt-10"
        >
          <p className="text-slate-500 text-sm">
            <span className="text-white font-semibold">847+</span> vetted writers across all categories
            {" "}·{" "}
            <span className="text-green-400 font-semibold">All verified & background-checked</span>
          </p>
        </motion.div>
      </div>
    </section>
  );
}
