"use client";

import { motion, useInView } from "framer-motion";
import { useRef, useState } from "react";
import { CheckCircle, Zap, Clock, Crown } from "lucide-react";
import Link from "next/link";
import { URGENCY_OPTIONS, calculatePrice, formatPrice } from "@/lib/pricing";
import type { UrgencyLevel, AcademicLevel } from "@/types";

const plans = [
  {
    name: "Standard",
    urgency: "TWENTY_FOUR_HOURS" as UrgencyLevel,
    level: "UNDERGRADUATE" as AcademicLevel,
    icon: Clock,
    color: "from-slate-600 to-slate-400",
    badge: null,
    popular: false,
    features: [
      "24-hour delivery window",
      "Undergraduate-level quality",
      "3 free revisions",
      "Plagiarism-free guarantee",
      "Chat with writer",
      "Secure escrow payment",
    ],
  },
  {
    name: "Express",
    urgency: "SIX_HOURS" as UrgencyLevel,
    level: "MASTERS" as AcademicLevel,
    icon: Zap,
    color: "from-brand-600 to-brand-400",
    badge: "MOST POPULAR",
    popular: true,
    features: [
      "6-hour delivery",
      "Masters-level quality",
      "5 free revisions",
      "Plagiarism & grammar check",
      "Priority writer matching",
      "Real-time progress updates",
      "Dedicated support",
    ],
  },
  {
    name: "Emergency",
    urgency: "ONE_HOUR" as UrgencyLevel,
    level: "PHD" as AcademicLevel,
    icon: Crown,
    color: "from-emergency-500 to-red-600",
    badge: "FASTEST",
    popular: false,
    features: [
      "1-hour delivery",
      "PhD-level quality",
      "Unlimited revisions",
      "Elite writer assigned",
      "Emergency Mode activated",
      "VIP support 24/7",
      "Money-back guarantee",
    ],
  },
];

export function PricingPreview() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });
  const [wordCount, setWordCount] = useState(1000);

  return (
    <section id="pricing" className="py-24 lg:py-32 relative" ref={ref}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-400 text-sm font-semibold mb-4">
            Transparent Pricing
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white mb-4">
            Pay for Speed,
            <br />
            <span className="gradient-text">Get Quality Always</span>
          </h2>
          <p className="text-slate-400 text-lg max-w-xl mx-auto mb-8">
            Pricing scales with urgency. The faster you need it, the more we prioritize your order.
            Base quality is always premium.
          </p>

          {/* Word count slider */}
          <div className="max-w-sm mx-auto">
            <label className="text-slate-400 text-sm mb-2 block">
              Word Count: <span className="text-white font-semibold">{wordCount.toLocaleString()} words</span>
            </label>
            <input
              type="range"
              min="100"
              max="10000"
              step="100"
              value={wordCount}
              onChange={(e) => setWordCount(Number(e.target.value))}
              className="w-full accent-brand-500"
            />
            <div className="flex justify-between text-xs text-slate-600 mt-1">
              <span>100</span>
              <span>10,000</span>
            </div>
          </div>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
          {plans.map((plan, i) => {
            const pricing = calculatePrice({
              wordCount,
              urgency: plan.urgency,
              academicLevel: plan.level,
              isEmergency: plan.name === "Emergency",
            });

            return (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 30 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: i * 0.15 }}
                className={`relative glass-card p-8 flex flex-col ${
                  plan.popular
                    ? "border-brand-500/50 shadow-glow-sm ring-1 ring-brand-500/30"
                    : ""
                }`}
              >
                {plan.badge && (
                  <div className={`absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-xs font-bold text-white bg-gradient-to-r ${plan.color}`}>
                    {plan.badge}
                  </div>
                )}

                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${plan.color} flex items-center justify-center mb-6`}>
                  <plan.icon className="w-6 h-6 text-white" />
                </div>

                <h3 className="text-white text-xl font-bold mb-1">{plan.name}</h3>
                <p className="text-slate-500 text-sm mb-6">
                  {URGENCY_OPTIONS.find((o) => o.value === plan.urgency)?.label} delivery · {plan.level.replace("_", " ")} quality
                </p>

                <div className="mb-6">
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-extrabold text-white">
                      {formatPrice(pricing.totalPrice)}
                    </span>
                    <span className="text-slate-500 text-sm">/ {wordCount.toLocaleString()}w</span>
                  </div>
                  {pricing.urgencyPrice > 0 && (
                    <p className="text-slate-600 text-xs mt-1">
                      Includes {formatPrice(pricing.urgencyPrice)} urgency premium
                    </p>
                  )}
                  {pricing.emergencyFee > 0 && (
                    <p className="text-emergency-400 text-xs mt-1">
                      + {formatPrice(pricing.emergencyFee)} emergency activation fee
                    </p>
                  )}
                </div>

                <ul className="space-y-3 mb-8 flex-1">
                  {plan.features.map((feat) => (
                    <li key={feat} className="flex items-center gap-2.5 text-sm text-slate-300">
                      <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
                      {feat}
                    </li>
                  ))}
                </ul>

                <Link
                  href="/signup"
                  className={`w-full text-center py-3 rounded-xl font-semibold text-sm transition-all duration-200 active:scale-95 ${
                    plan.popular
                      ? "bg-gradient-to-r from-brand-600 to-brand-500 text-white hover:shadow-glow-md"
                      : plan.name === "Emergency"
                      ? "bg-gradient-to-r from-emergency-500 to-red-600 text-white hover:shadow-lg"
                      : "bg-white/10 text-white border border-white/20 hover:bg-white/20"
                  }`}
                >
                  Get Started →
                </Link>
              </motion.div>
            );
          })}
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ delay: 0.8 }}
          className="text-center text-slate-600 text-sm mt-8"
        >
          All prices in US Dollars (USD) · Secure payment via Paystack · No hidden fees
        </motion.p>
      </div>
    </section>
  );
}
