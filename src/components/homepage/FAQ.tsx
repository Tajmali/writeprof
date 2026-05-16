"use client";

import { motion, useInView, AnimatePresence } from "framer-motion";
import { useRef, useState } from "react";
import { Plus, Minus } from "lucide-react";

const faqs = [
  { q: "How quickly can you deliver my order?", a: "Our fastest delivery is 1 hour for emergency orders. Standard deadlines range from 6 to 24 hours depending on complexity and word count. We match you with writers who can meet your exact deadline." },
  { q: "Is the content 100% original?", a: "Absolutely. Every submission passes through Turnitin and Copyscape before delivery. We guarantee 0% plagiarism on every order, or you receive a full refund." },
  { q: "What if I'm not satisfied with the work?", a: "You can request unlimited revisions until you're happy. Payment is held in escrow and only released when you approve the work. If we fail to meet your expectations, we issue a full refund." },
  { q: "How are writers verified?", a: "Every writer undergoes a 7-step vetting process including identity verification, academic credential check, writing test, English proficiency assessment, background check, and a probationary period. Only 8% of applicants are accepted." },
  { q: "Is my information kept confidential?", a: "Yes. We use bank-grade encryption and never share your personal information, order details, or communication with any third party. Your privacy is protected by our iron-clad NDA policy." },
  { q: "What payment methods do you accept?", a: "We accept all major cards (Visa, Mastercard), bank transfers, and mobile money through Paystack — Nigeria's most trusted payment gateway. All transactions are encrypted and secure." },
  { q: "Can I chat with my writer?", a: "Yes! Once a writer is assigned to your order, a direct chat channel opens instantly. You can share additional instructions, clarify requirements, and track progress in real-time." },
  { q: "What happens if my writer misses the deadline?", a: "In the rare event of a missed deadline, you receive a full refund immediately — no questions asked. We've maintained a 98% on-time delivery rate across 12,847+ orders." },
  { q: "Do you offer academic writing services?", a: "Yes. We handle essays, research papers, dissertations, case studies, lab reports, and more. All academic work follows proper citation styles (APA, MLA, Chicago, Harvard) as required." },
  { q: "How does the Emergency Mode work?", a: "Emergency Mode prioritizes your order above all others. You're matched with a top-rated writer in under 5 minutes, and they start immediately. This is available for deadlines as short as 1 hour. A $50 emergency activation fee applies." },
];

export function FAQ() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section id="faq" className="py-24 lg:py-32 relative" ref={ref}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-400 text-sm font-semibold mb-4">
            Frequently Asked Questions
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white mb-4">
            Still Have{" "}
            <span className="gradient-text">Questions?</span>
          </h2>
          <p className="text-slate-400 text-lg">
            Everything you need to know about WriteProf. Can't find the answer?{" "}
            <a href="mailto:oriaventures@gmail.com" className="text-brand-400 hover:underline">
              Contact our team.
            </a>
          </p>
        </motion.div>

        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: i * 0.05 }}
            >
              <button
                onClick={() => setOpen(open === i ? null : i)}
                className="w-full flex items-center justify-between gap-4 p-5 glass rounded-xl hover:border-white/20 transition-all duration-200 text-left group"
              >
                <span className="text-white font-medium text-sm lg:text-base group-hover:text-brand-300 transition-colors">
                  {faq.q}
                </span>
                <div className={`flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center transition-all duration-200 ${
                  open === i ? "bg-brand-500/20 text-brand-400" : "bg-white/5 text-slate-500"
                }`}>
                  {open === i ? <Minus className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                </div>
              </button>

              <AnimatePresence>
                {open === i && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25 }}
                    className="overflow-hidden"
                  >
                    <div className="px-5 pb-5 pt-2">
                      <p className="text-slate-400 text-sm leading-relaxed">{faq.a}</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
