"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { FileText, Search, Zap, CheckCircle, ArrowRight } from "lucide-react";

const steps = [
  {
    icon: FileText,
    step: "01",
    title: "Submit Your Order",
    description:
      "Fill in your task details — title, description, deadline, word count, and academic level. Upload any reference materials. Takes less than 2 minutes.",
    dotColor: "bg-brand-500",
    iconBg: "#fde8e3",
    iconBorder: "#fbc5b8",
    iconColor: "#e04f2f",
    features: ["Upload files instantly", "Set exact deadline", "Choose urgency level"],
  },
  {
    icon: Search,
    step: "02",
    title: "Writer Gets Matched",
    description:
      "Our smart matching system immediately alerts available writers. For emergency orders, we assign the best available writer within minutes.",
    dotColor: "bg-violet-500",
    iconBg: "#ede9fe",
    iconBorder: "#ddd6fe",
    iconColor: "#7c3aed",
    features: ["AI-powered matching", "Instant writer alerts", "Skill-based assignment"],
  },
  {
    icon: Zap,
    step: "03",
    title: "Work Gets Done",
    description:
      "Your writer starts immediately. Watch real-time progress, chat with your writer, and receive updates as your deadline approaches.",
    dotColor: "bg-orange-500",
    iconBg: "#fff7ed",
    iconBorder: "#fed7aa",
    iconColor: "#ea580c",
    features: ["Real-time tracking", "Live chat with writer", "Progress updates"],
  },
  {
    icon: CheckCircle,
    step: "04",
    title: "Delivered & Approved",
    description:
      "Download your completed work. Request free revisions if needed. Release payment only when you're 100% satisfied.",
    dotColor: "bg-green-500",
    iconBg: "#f0fdf4",
    iconBorder: "#bbf7d0",
    iconColor: "#16a34a",
    features: ["Free revisions included", "Escrow-protected payment", "Satisfaction guaranteed"],
  },
];

export function HowItWorks() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="how-it-works" className="py-24 lg:py-32 relative bg-[#fff8f6]" ref={ref}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16 lg:mb-24"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-400 text-sm font-semibold mb-4">
            How It Works
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 mb-4">
            From Panic to{" "}
            <span className="gradient-text">Delivered</span>
            <br />
            in 4 Simple Steps
          </h2>
          <p className="text-slate-600 text-lg max-w-2xl mx-auto">
            We've perfected the emergency writing workflow so you spend zero time figuring things
            out and all your time breathing easy.
          </p>
        </motion.div>

        {/* Steps */}
        <div className="relative">
          {/* Connection line */}
          <div className="hidden lg:block absolute top-24 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-slate-200 to-transparent" />

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
            {steps.map((step, i) => (
              <motion.div
                key={step.step}
                initial={{ opacity: 0, y: 40 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: i * 0.15 }}
                className="relative group"
              >
                {/* Arrow between steps */}
                {i < steps.length - 1 && (
                  <div className="hidden lg:flex absolute -right-5 top-12 z-10 w-10 h-10 items-center justify-center">
                    <ArrowRight className="w-4 h-4 text-slate-300" />
                  </div>
                )}

                <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 h-full hover:border-brand-300 hover:shadow-md transition-all duration-300 group-hover:-translate-y-2">
                  {/* Step number & icon */}
                  <div className="flex items-start justify-between mb-6">
                    <div
                      className="w-14 h-14 rounded-2xl flex items-center justify-center"
                      style={{
                        background: step.iconBg,
                        border: `1.5px solid ${step.iconBorder}`,
                      }}
                    >
                      <step.icon className="w-7 h-7" style={{ color: step.iconColor }} />
                    </div>
                    <span className="text-5xl font-black text-slate-100 group-hover:text-slate-200 transition-all">
                      {step.step}
                    </span>
                  </div>

                  <h3 className="text-xl font-bold text-slate-900 mb-3">{step.title}</h3>
                  <p className="text-slate-500 text-sm leading-relaxed mb-4">{step.description}</p>

                  <ul className="space-y-2">
                    {step.features.map((f) => (
                      <li key={f} className="flex items-center gap-2 text-xs text-slate-400">
                        <div className={`w-1.5 h-1.5 rounded-full ${step.dotColor} flex-shrink-0`} />
                        {f}
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="text-center mt-12"
        >
          <a href="/signup" className="btn-primary inline-flex text-base px-8 py-4">
            <Zap className="w-5 h-5" />
            Start Your First Order — Free
            <ArrowRight className="w-5 h-5" />
          </a>
          <p className="text-slate-400 text-sm mt-3">No credit card required to sign up</p>
        </motion.div>
      </div>
    </section>
  );
}
