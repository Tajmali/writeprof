"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Star, Quote } from "lucide-react";

const testimonials = [
  {
    name: "Chioma A.",
    role: "PhD Student, University of Lagos",
    avatar: "CA",
    rating: 5,
    text: "I had a 3,000-word research chapter due in 4 hours and I was about to give up. WriteProf matched me with Dr. Sarah who delivered a flawless paper in 3.5 hours. It was better than anything I could have written with a full week. THANK GOD for this platform.",
    highlight: "Delivered in 3.5 hours",
    color: "from-brand-600 to-brand-400",
  },
  {
    name: "Marcus T.",
    role: "Marketing Director, Lagos Startup",
    avatar: "MT",
    rating: 5,
    text: "We needed 5 high-converting ad copies for a product launch the next morning. James delivered 7 copies in 2 hours — each one better than our previous agency's month-long work. We used WriteProf for every campaign now.",
    highlight: "7 copies in 2 hours",
    color: "from-violet-600 to-violet-400",
  },
  {
    name: "Adaeze O.",
    role: "Undergraduate, UNILAG",
    avatar: "AO",
    rating: 5,
    text: "Exams week is always madness. WriteProf has saved me so many times I've lost count. The writers actually understand Nigerian academic requirements — APA, citation styles, everything. And it's always original.",
    highlight: "Used 12+ times",
    color: "from-green-600 to-green-400",
  },
  {
    name: "Ibrahim K.",
    role: "Business Consultant, Abuja",
    avatar: "IK",
    rating: 5,
    text: "Had a client proposal due in 6 hours that I hadn't even started. The writer on WriteProf produced a 15-page business proposal that the client called 'the most professional document we've received in years.' Closed a $8M contract.",
    highlight: "$8M contract closed",
    color: "from-amber-600 to-amber-400",
  },
  {
    name: "Fatima B.",
    role: "Content Creator & Influencer",
    avatar: "FB",
    rating: 5,
    text: "I create content across 3 platforms but writing long-form blog posts was killing me. WriteProf's SEO writers produce better content than I ever could, and my organic traffic has gone up 340% in 3 months.",
    highlight: "340% traffic increase",
    color: "from-pink-600 to-pink-400",
  },
  {
    name: "Dr. Emeka N.",
    role: "Medical Professional, Port Harcourt",
    avatar: "EN",
    rating: 5,
    text: "As a doctor, I don't have time to write research papers. WriteProf's medical writers understand clinical terminology perfectly. Every paper comes citation-ready. This platform is elite.",
    highlight: "5 papers published",
    color: "from-teal-600 to-teal-400",
  },
];

export function Testimonials() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section className="py-24 lg:py-32 relative overflow-hidden" ref={ref}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 text-sm font-semibold mb-4">
            <Star className="w-3.5 h-3.5 fill-current" />
            Real Stories, Real Results
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white mb-4">
            They Were Stressed.
            <br />
            <span className="gradient-text">Then They Found WriteProf.</span>
          </h2>
          <p className="text-slate-400 text-lg max-w-xl mx-auto">
            Over 12,847 clients have used WriteProf to rescue their deadlines. Here's what they say.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 30 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              whileHover={{ y: -4, scale: 1.01 }}
              className="glass-card p-6 flex flex-col relative overflow-hidden hover:border-white/20 transition-all duration-300"
            >
              {/* Quote icon */}
              <Quote className="absolute top-4 right-4 w-8 h-8 text-white/5" />

              {/* Stars */}
              <div className="flex items-center gap-0.5 mb-4">
                {[...Array(t.rating)].map((_, j) => (
                  <Star key={j} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                ))}
              </div>

              {/* Review text */}
              <p className="text-slate-300 text-sm leading-relaxed flex-1 mb-6">
                &ldquo;{t.text}&rdquo;
              </p>

              {/* Highlight */}
              <div className={`inline-flex self-start items-center px-3 py-1 rounded-full bg-gradient-to-r ${t.color} bg-opacity-10 text-xs font-bold text-white mb-4`}
                   style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.12)" }}>
                ✨ {t.highlight}
              </div>

              {/* Author */}
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${t.color} flex items-center justify-center text-white font-bold text-sm flex-shrink-0`}>
                  {t.avatar}
                </div>
                <div>
                  <p className="text-white font-semibold text-sm">{t.name}</p>
                  <p className="text-slate-500 text-xs">{t.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Trust summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.8 }}
          className="mt-12 p-8 glass rounded-2xl text-center"
        >
          <div className="flex items-center justify-center gap-2 mb-2">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-6 h-6 fill-yellow-400 text-yellow-400" />
            ))}
          </div>
          <div className="text-4xl font-extrabold text-white mb-1">4.9 / 5</div>
          <p className="text-slate-400">Average rating from 12,847+ verified orders</p>
        </motion.div>
      </div>
    </section>
  );
}
