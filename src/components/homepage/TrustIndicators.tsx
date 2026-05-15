"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Shield, Lock, RefreshCw, Award, Clock, Users } from "lucide-react";

const indicators = [
  { icon: Shield, title: "100% Original Content", desc: "Every paper passes Copyscape and Turnitin. Zero plagiarism guaranteed or full refund.", color: "text-brand-400" },
  { icon: Lock, title: "Secure Escrow Payments", desc: "Payment held safely until you approve the work. Full Paystack encryption on every transaction.", color: "text-green-400" },
  { icon: RefreshCw, title: "Unlimited Revisions", desc: "Not satisfied? Request revisions until you're happy. Emergency orders get revision priority.", color: "text-violet-400" },
  { icon: Award, title: "Verified Expert Writers", desc: "Every writer passes our 7-step vetting process. PhD holders, published authors, industry professionals.", color: "text-yellow-400" },
  { icon: Clock, title: "Deadline Guarantee", desc: "If we miss your deadline, you get a full refund. We've never missed one in 3 years.", color: "text-orange-400" },
  { icon: Users, title: "24/7 Human Support", desc: "Real humans respond within minutes. No bots, no templates, no script-reading agents.", color: "text-pink-400" },
];

export function TrustIndicators() {
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
            <Shield className="w-3.5 h-3.5" />
            Why Clients Trust Us
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white mb-4">
            Every Guarantee,{" "}
            <span className="gradient-text">Backed in Writing</span>
          </h2>
          <p className="text-slate-400 text-lg max-w-xl mx-auto">
            We're not just another writing platform. We've built WriteProf around the promises
            that matter most when you're under pressure.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {indicators.map((item, i) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              whileHover={{ y: -4 }}
              className="flex gap-4 p-6 glass rounded-2xl hover:border-white/20 transition-all duration-300 group"
            >
              <div className={`w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center flex-shrink-0 group-hover:bg-white/10 transition-all ${item.color}`}>
                <item.icon className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-white font-semibold mb-1">{item.title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{item.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
