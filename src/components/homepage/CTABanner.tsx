"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import Link from "next/link";
import { Zap, ArrowRight } from "lucide-react";

export function CTABanner() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section className="py-16 lg:py-24 relative" ref={ref}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={inView ? { opacity: 1, scale: 1 } : {}}
          transition={{ duration: 0.6 }}
          className="relative rounded-3xl overflow-hidden p-12 lg:p-20 text-center"
        >
          {/* Background */}
          <div className="absolute inset-0 bg-gradient-to-br from-brand-900 via-brand-800 to-navy-900" />
          <div className="absolute inset-0 bg-hero-gradient opacity-30" />
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-brand-400/20 rounded-full blur-3xl" />
          <div className="absolute inset-0 border border-brand-500/20 rounded-3xl" />

          {/* Grid pattern */}
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
              backgroundSize: "32px 32px",
            }}
          />

          <div className="relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 text-white text-sm font-semibold mb-6"
            >
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              Writers are online and ready
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.3 }}
              className="text-3xl sm:text-4xl lg:text-6xl font-extrabold text-white mb-6 leading-tight"
            >
              Don't Let a Deadline
              <br />
              <span className="text-brand-300">Define Your Fate.</span>
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.4 }}
              className="text-brand-200 text-lg lg:text-xl max-w-2xl mx-auto mb-10"
            >
              Submit your order in 2 minutes. A professional writer starts immediately. Your work
              is delivered on time, every time — guaranteed.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.5 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4"
            >
              <Link
                href="/signup"
                className="group inline-flex items-center gap-2 px-10 py-5 bg-white text-brand-700 font-extrabold text-lg rounded-2xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 active:translate-y-0"
              >
                <Zap className="w-5 h-5 group-hover:text-brand-500 transition-colors" />
                Start Now — It's Free
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="/login"
                className="inline-flex items-center gap-2 px-8 py-5 text-white font-semibold text-lg border border-white/30 rounded-2xl hover:bg-white/10 transition-all duration-300"
              >
                Sign In
              </Link>
            </motion.div>

            <motion.p
              initial={{ opacity: 0 }}
              animate={inView ? { opacity: 1 } : {}}
              transition={{ delay: 0.7 }}
              className="text-brand-300/60 text-sm mt-6"
            >
              No credit card required · Cancel anytime · 30-day money-back guarantee
            </motion.p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
