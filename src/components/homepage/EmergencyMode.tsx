"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Zap, Crown, Clock, Shield, ChevronRight, Star, Flame } from "lucide-react";
import Link from "next/link";

const emergencyFeatures = [
  { icon: Crown, title: "Top Priority Assignment", desc: "Your order jumps to the front of the queue instantly" },
  { icon: Zap, title: "Fastest Available Writer", desc: "Matched with our highest-rated speed writers" },
  { icon: Clock, title: "1-Hour Minimum Deadline", desc: "We handle the impossible when time is critical" },
  { icon: Shield, title: "VIP Support", desc: "Dedicated support agent monitors your order throughout" },
  { icon: Star, title: "Verified Elite Writers Only", desc: "Only our top 5% of writers handle emergency orders" },
];

export function EmergencyMode() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section className="py-24 lg:py-32 relative overflow-hidden" ref={ref}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={inView ? { opacity: 1, scale: 1 } : {}}
          transition={{ duration: 0.6 }}
          className="relative rounded-3xl overflow-hidden"
        >
          {/* Background */}
          <div className="absolute inset-0 bg-gradient-to-br from-orange-900/50 via-red-900/30 to-slate-900/80" />
          <div className="absolute inset-0 bg-emergency-gradient opacity-10" />
          <div className="absolute top-0 right-0 w-96 h-96 bg-emergency-500/20 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-red-500/15 rounded-full blur-3xl" />

          {/* Border */}
          <div className="absolute inset-0 rounded-3xl border border-emergency-500/30" />

          <div className="relative z-10 p-8 lg:p-16">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              {/* Left */}
              <div>
                {/* Badge */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={inView ? { opacity: 1, x: 0 } : {}}
                  transition={{ delay: 0.2 }}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emergency-500/20 border border-emergency-500/40 text-emergency-300 text-sm font-bold mb-6 emergency-pulse"
                >
                  <Flame className="w-4 h-4" />
                  EMERGENCY MODE — Premium Feature
                  <Flame className="w-4 h-4" />
                </motion.div>

                <motion.h2
                  initial={{ opacity: 0, y: 20 }}
                  animate={inView ? { opacity: 1, y: 0 } : {}}
                  transition={{ delay: 0.3 }}
                  className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white mb-4 leading-tight"
                >
                  Deadline in{" "}
                  <span className="gradient-text-emergency">60 Minutes?</span>
                  <br />
                  We've Got You.
                </motion.h2>

                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={inView ? { opacity: 1, y: 0 } : {}}
                  transition={{ delay: 0.4 }}
                  className="text-slate-300 text-lg mb-8 leading-relaxed"
                >
                  Emergency Mode activates our fastest response team. Your order gets priority over
                  everything else — assigned within minutes, not hours. This is for when you
                  absolutely cannot miss the deadline.
                </motion.p>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={inView ? { opacity: 1, y: 0 } : {}}
                  transition={{ delay: 0.5 }}
                >
                  <Link
                    href="/signup?mode=emergency"
                    className="group inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-emergency-500 to-red-600 text-white font-bold text-lg rounded-2xl hover:shadow-glow-emergency transition-all duration-300 hover:-translate-y-0.5 active:translate-y-0"
                  >
                    <Zap className="w-5 h-5 group-hover:animate-bounce-slow" />
                    Activate Emergency Mode
                    <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                  <p className="text-slate-500 text-sm mt-3">
                    $50 emergency fee · Assignment within 5 minutes
                  </p>
                </motion.div>
              </div>

              {/* Right — Features */}
              <div className="space-y-4">
                {emergencyFeatures.map((feat, i) => (
                  <motion.div
                    key={feat.title}
                    initial={{ opacity: 0, x: 30 }}
                    animate={inView ? { opacity: 1, x: 0 } : {}}
                    transition={{ delay: 0.3 + i * 0.1 }}
                    className="flex items-start gap-4 p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/8 hover:border-emergency-500/20 transition-all duration-200 group"
                  >
                    <div className="w-10 h-10 rounded-xl bg-emergency-500/20 border border-emergency-500/30 flex items-center justify-center flex-shrink-0 group-hover:bg-emergency-500/30 transition-all">
                      <feat.icon className="w-5 h-5 text-emergency-400" />
                    </div>
                    <div>
                      <h4 className="text-white font-semibold text-sm mb-0.5">{feat.title}</h4>
                      <p className="text-slate-500 text-xs">{feat.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
