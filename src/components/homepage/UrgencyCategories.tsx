"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { BookOpen, Briefcase, PenTool, FlaskConical, Globe, Megaphone, FileText, GraduationCap } from "lucide-react";
import Link from "next/link";

const categories = [
  { icon: GraduationCap, label: "Academic Writing", count: 3421, color: "from-brand-600 to-brand-400", urgency: "1–24 hrs", description: "Essays, theses, dissertations, coursework" },
  { icon: Briefcase, label: "Business Writing", count: 1847, color: "from-violet-600 to-violet-400", urgency: "2–24 hrs", description: "Reports, proposals, business plans, memos" },
  { icon: Megaphone, label: "Copywriting", count: 2103, color: "from-pink-600 to-pink-400", urgency: "1–12 hrs", description: "Ad copy, landing pages, product descriptions" },
  { icon: Globe, label: "Blog & SEO Content", count: 1562, color: "from-green-600 to-green-400", urgency: "3–24 hrs", description: "Blog posts, articles, SEO-optimized content" },
  { icon: FlaskConical, label: "Research Papers", count: 987, color: "from-cyan-600 to-cyan-400", urgency: "6–24 hrs", description: "Scientific papers, literature reviews, analyses" },
  { icon: PenTool, label: "Creative Writing", count: 743, color: "from-amber-600 to-amber-400", urgency: "2–24 hrs", description: "Stories, scripts, poetry, creative essays" },
  { icon: FileText, label: "Proofreading & Editing", count: 2891, color: "from-teal-600 to-teal-400", urgency: "1–12 hrs", description: "Grammar, style, structure, APA/MLA formatting" },
  { icon: BookOpen, label: "Technical Writing", count: 634, color: "from-red-600 to-red-400", urgency: "4–24 hrs", description: "Manuals, documentation, technical reports" },
];

export function UrgencyCategories() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="categories" className="py-24 lg:py-32 relative" ref={ref}>
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/[0.01] to-transparent pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-400 text-sm font-semibold mb-4">
            Writing Categories
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white mb-4">
            Every Type of Writing,
            <br />
            <span className="bg-gradient-to-r from-violet-400 to-brand-400 bg-clip-text text-transparent">
              Delivered on Demand
            </span>
          </h2>
          <p className="text-slate-400 text-lg max-w-xl mx-auto">
            From academic essays to marketing copy — our writers cover every niche with
            expert-level precision.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
          {categories.map((cat, i) => (
            <motion.div
              key={cat.label}
              initial={{ opacity: 0, y: 30, scale: 0.95 }}
              animate={inView ? { opacity: 1, y: 0, scale: 1 } : {}}
              transition={{ duration: 0.5, delay: i * 0.07 }}
              whileHover={{ y: -6, scale: 1.02 }}
            >
              <Link
                href={`/signup?category=${encodeURIComponent(cat.label)}`}
                className="block h-full glass-card p-6 cursor-pointer hover:border-white/20 transition-all duration-300 group"
              >
                {/* Icon */}
                <div
                  className={`w-12 h-12 rounded-xl bg-gradient-to-br ${cat.color} p-0.5 mb-4 group-hover:shadow-lg transition-all duration-300`}
                >
                  <div className="w-full h-full bg-slate-900 rounded-xl flex items-center justify-center">
                    <cat.icon className="w-5 h-5 text-white" />
                  </div>
                </div>

                <h3 className="text-white font-semibold text-base mb-1 group-hover:text-brand-300 transition-colors">
                  {cat.label}
                </h3>
                <p className="text-slate-500 text-xs mb-3 leading-relaxed">{cat.description}</p>

                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-600">{cat.count.toLocaleString()} orders</span>
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full bg-gradient-to-r ${cat.color} bg-opacity-10`}
                    style={{ background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.6)", border: "1px solid rgba(255,255,255,0.1)" }}>
                    {cat.urgency}
                  </span>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
