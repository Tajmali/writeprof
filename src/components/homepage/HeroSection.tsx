"use client";

import { motion, useInView } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import Link from "next/link";
import { Zap, Clock, Shield, Star, ArrowRight, CheckCircle } from "lucide-react";

const DEFAULT_STATS = [
  { value: 1240, label: "Orders Completed", suffix: "+" },
  { value: 120,  label: "Active Writers",   suffix: "+" },
  { value: 98,   label: "On-Time Delivery", suffix: "%" },
  { value: 4.9,  label: "Average Rating",   suffix: "/5", decimal: true },
];

const trustedBy = ["Harvard Students", "Fortune 500 Companies", "Marketing Agencies", "PhD Researchers"];

function AnimatedCounter({ value, suffix, decimal = false }: { value: number; suffix?: string; decimal?: boolean }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });

  useEffect(() => {
    if (!inView) return;
    const duration = 2000;
    const steps = 60;
    const increment = value / steps;
    let current = 0;
    const timer = setInterval(() => {
      current += increment;
      if (current >= value) {
        setCount(value);
        clearInterval(timer);
      } else {
        setCount(decimal ? Math.round(current * 10) / 10 : Math.floor(current));
      }
    }, duration / steps);
    return () => clearInterval(timer);
  }, [inView, value, decimal]);

  return (
    <span ref={ref}>
      {decimal ? count.toFixed(1) : count.toLocaleString()}
      {suffix}
    </span>
  );
}

function CountdownTimer() {
  const [time, setTime] = useState({ h: 0, m: 59, s: 47 });

  useEffect(() => {
    const timer = setInterval(() => {
      setTime((prev) => {
        let { h, m, s } = prev;
        s--;
        if (s < 0) { s = 59; m--; }
        if (m < 0) { m = 59; h--; }
        if (h < 0) return { h: 23, m: 59, s: 59 };
        return { h, m, s };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const pad = (n: number) => String(n).padStart(2, "0");

  return (
    <div className="flex items-center gap-3">
      {[
        { label: "hrs", value: time.h },
        { label: "min", value: time.m },
        { label: "sec", value: time.s },
      ].map((unit, i) => (
        <div key={unit.label} className="flex items-center gap-1">
          <div className="flex flex-col items-center">
            <motion.div
              key={unit.value}
              initial={{ y: -10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="bg-white/10 border border-white/20 rounded-lg px-3 py-2 min-w-[52px] text-center"
            >
              <span className="text-2xl font-bold text-white font-mono tabular-nums">{pad(unit.value)}</span>
            </motion.div>
            <span className="text-xs text-slate-500 mt-1">{unit.label}</span>
          </div>
          {i < 2 && <span className="text-2xl font-bold text-brand-400 mb-5">:</span>}
        </div>
      ))}
    </div>
  );
}

export function HeroSection() {
  const [stats, setStats] = useState(DEFAULT_STATS);
  const [clientCount, setClientCount] = useState(3850);

  useEffect(() => {
    fetch("/api/stats")
      .then((r) => r.json())
      .then((data) => {
        if (!data.success) return;
        const { ordersCompleted, totalClients, activeWriters, avgRating } = data.data;
        setStats([
          { value: ordersCompleted, label: "Orders Completed", suffix: "+" },
          { value: activeWriters,   label: "Active Writers",   suffix: "+" },
          { value: 98,              label: "On-Time Delivery", suffix: "%" },
          { value: avgRating,       label: "Average Rating",   suffix: "/5", decimal: true },
        ]);
        setClientCount(totalClients);
      })
      .catch(() => {}); // silently keep defaults
  }, []);

  return (
    <section className="relative pt-32 pb-20 lg:pt-40 lg:pb-32 overflow-hidden">
      {/* Radial glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-brand-600/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Left Column */}
          <div className="text-center lg:text-left">
            {/* Emergency badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emergency-500/10 border border-emergency-500/30 text-emergency-400 text-sm font-semibold mb-6"
            >
              <span className="w-2 h-2 bg-emergency-400 rounded-full animate-ping" />
              <span className="w-2 h-2 bg-emergency-400 rounded-full absolute" />
              Emergency Writing Available 24/7
              <ArrowRight className="w-3.5 h-3.5" />
            </motion.div>

            {/* Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.7 }}
              className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-extrabold text-white leading-[1.1] tracking-tight"
            >
              Your Deadline
              <br />
              <span className="bg-gradient-to-r from-brand-400 via-brand-300 to-blue-300 bg-clip-text text-transparent">
                Just Got Saved.
              </span>
            </motion.h1>

            {/* Subheadline */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
              className="mt-6 text-lg lg:text-xl text-slate-400 leading-relaxed max-w-xl mx-auto lg:mx-0"
            >
              Submit any writing task and our vetted professionals deliver in{" "}
              <strong className="text-brand-400">1 to 24 hours</strong>. Essays, research papers,
              copywriting, dissertations — handled with precision under pressure.
            </motion.p>

            {/* Feature checklist */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.45 }}
              className="flex flex-wrap gap-4 mt-6 justify-center lg:justify-start"
            >
              {["1-Hour Delivery", "100% Original", "Free Revisions", "Secure Payments"].map((f) => (
                <div key={f} className="flex items-center gap-1.5 text-sm text-slate-300">
                  <CheckCircle className="w-4 h-4 text-brand-400 flex-shrink-0" />
                  {f}
                </div>
              ))}
            </motion.div>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.55 }}
              className="flex flex-col sm:flex-row gap-4 mt-10 justify-center lg:justify-start"
            >
              <Link
                href="/signup"
                className="group relative inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-brand-600 to-brand-500 text-white font-bold text-lg rounded-2xl hover:shadow-glow-lg transition-all duration-300 hover:-translate-y-0.5 active:translate-y-0"
              >
                <Zap className="w-5 h-5 group-hover:animate-bounce-slow" />
                Submit an Order Now
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="#how-it-works"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 glass text-white font-semibold text-lg rounded-2xl hover:bg-white/10 transition-all duration-300 hover:-translate-y-0.5"
              >
                See How It Works
              </Link>
            </motion.div>

            {/* Trust row */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
              className="mt-8 flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start"
            >
              <div className="flex -space-x-2">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div
                    key={i}
                    className="w-9 h-9 rounded-full border-2 border-[#020817] overflow-hidden"
                    style={{ background: `hsl(${i * 40}, 60%, 50%)` }}
                  />
                ))}
              </div>
              <div className="text-center sm:text-left">
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  ))}
                  <span className="text-white font-semibold ml-1">4.9/5</span>
                </div>
                <p className="text-slate-500 text-sm">from {clientCount.toLocaleString()}+ verified clients</p>
              </div>
            </motion.div>
          </div>

          {/* Right Column — Live Card */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3, duration: 0.7 }}
            className="relative"
          >
            {/* Main card */}
            <div className="relative glass-card p-8 overflow-hidden">
              {/* Live indicator */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 bg-green-400 rounded-full animate-pulse" />
                  <span className="text-green-400 text-sm font-semibold">LIVE — Emergency Mode Active</span>
                </div>
                <span className="text-slate-500 text-xs">24/7 Support</span>
              </div>

              {/* Order status display */}
              <div className="space-y-4">
                {[
                  { title: "MBA Thesis Chapter 3", writer: "Dr. Sarah K.", status: "In Progress", time: "2h 30m", urgency: "high" },
                  { title: "Marketing Copy — 5 ads", writer: "James O.", status: "Completing", time: "45m", urgency: "critical" },
                  { title: "Research Paper 3000w", writer: "Prof. Amara", status: "Assigned", time: "6h 00m", urgency: "medium" },
                ].map((order, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 + i * 0.15 }}
                    className="flex items-center gap-4 p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/8 transition-all group cursor-pointer"
                  >
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0 ${
                      order.urgency === "critical" ? "bg-red-500/20 text-red-400" :
                      order.urgency === "high" ? "bg-orange-500/20 text-orange-400" :
                      "bg-brand-500/20 text-brand-400"
                    }`}>
                      {order.writer.slice(0, 2)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm font-medium truncate">{order.title}</p>
                      <p className="text-slate-500 text-xs">{order.writer}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div className={`text-xs font-semibold mb-0.5 ${
                        order.urgency === "critical" ? "text-red-400" :
                        order.urgency === "high" ? "text-orange-400" :
                        "text-brand-400"
                      }`}>
                        {order.status}
                      </div>
                      <div className="flex items-center gap-1 text-slate-500 text-xs">
                        <Clock className="w-3 h-3" />
                        {order.time}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Countdown */}
              <div className="mt-6 p-4 rounded-xl bg-brand-500/10 border border-brand-500/20">
                <p className="text-brand-400 text-xs font-semibold mb-3 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" />
                  NEXT AVAILABLE WRITER IN
                </p>
                <CountdownTimer />
              </div>

              {/* Decorative gradient */}
              <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-brand-500/10 rounded-full blur-2xl pointer-events-none" />
            </div>

            {/* Floating badges */}
            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -top-4 -right-4 glass rounded-xl px-3 py-2 flex items-center gap-2 shadow-xl"
            >
              <Shield className="w-4 h-4 text-brand-400" />
              <span className="text-white text-xs font-semibold">100% Secure</span>
            </motion.div>

            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
              className="absolute -bottom-4 -left-4 glass rounded-xl px-3 py-2 flex items-center gap-2 shadow-xl"
            >
              <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
              <span className="text-white text-xs font-semibold">4.9/5 Rating</span>
            </motion.div>
          </motion.div>
        </div>

        {/* Stats row */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="mt-20 grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-8"
        >
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="text-center p-6 glass rounded-2xl hover:border-brand-500/30 transition-all duration-300 group"
            >
              <div className="text-3xl lg:text-4xl font-extrabold text-white mb-1 group-hover:gradient-text transition-all">
                <AnimatedCounter value={stat.value} suffix={stat.suffix} decimal={stat.decimal} />
              </div>
              <div className="text-slate-500 text-sm">{stat.label}</div>
            </div>
          ))}
        </motion.div>

        {/* Trusted by */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="mt-12 text-center"
        >
          <p className="text-slate-600 text-sm mb-4">Trusted by clients at</p>
          <div className="flex flex-wrap items-center justify-center gap-6 lg:gap-12">
            {trustedBy.map((brand) => (
              <span key={brand} className="text-slate-500 text-sm font-semibold hover:text-slate-300 transition-colors">
                {brand}
              </span>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
