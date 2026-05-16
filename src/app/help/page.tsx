"use client";

import { useState } from "react";
import { Navbar } from "@/components/shared/Navbar";
import { Footer } from "@/components/shared/Footer";
import { HelpCircle, ChevronDown, BookOpen, CreditCard, Clock, Users, RefreshCw, MessageCircle, Mail } from "lucide-react";

const faqs = [
  {
    category: "Placing Orders",
    icon: Clock,
    color: "text-red-400",
    bg: "bg-red-500/10 border-red-500/20",
    questions: [
      {
        q: "How do I place an order?",
        a: "Sign in to your client dashboard, click 'New Order', fill in your task details (topic, word count, deadline, instructions), and complete payment. Your order goes live immediately and writers start bidding within minutes.",
      },
      {
        q: "What deadlines are available?",
        a: "WriteProf is built for rush orders. You can choose from 1 hour, 3 hours, 6 hours, 12 hours, or 24 hours. The tighter your deadline, the higher the urgency surcharge — but writers start on your order immediately.",
      },
      {
        q: "Can I provide instructions and files?",
        a: "Yes. When placing your order you can add detailed instructions, formatting requirements, and upload reference files. The more detail you provide, the better the result.",
      },
      {
        q: "What types of writing do you handle?",
        a: "Essays, research papers, dissertations, business proposals, blog posts, SEO articles, case studies, reports, copywriting, email campaigns, and more. If it's written content with a deadline, we handle it.",
      },
    ],
  },
  {
    category: "Payments & Pricing",
    icon: CreditCard,
    color: "text-green-400",
    bg: "bg-green-500/10 border-green-500/20",
    questions: [
      {
        q: "How is pricing calculated?",
        a: "Pricing is based on word count and urgency. Base rate is $15 per page (275 words). Urgency multipliers apply: 1hr (×5.0), 3hr (×3.5), 6hr (×2.5), 12hr (×1.75), 24hr (×1.0). An emergency flag adds a flat $50.",
      },
      {
        q: "Is my payment secure?",
        a: "Yes. Payments are processed via Paystack and held in escrow. Your money is only released to the writer after you approve the completed work. If no writer delivers, you get a full refund.",
      },
      {
        q: "When is the writer paid?",
        a: "Writers receive 80% of the order value once you approve the delivered work. WriteProf retains 20% as a platform fee.",
      },
      {
        q: "Do you offer any discounts?",
        a: "We run promotional offers occasionally. Follow us on social media or check the homepage for active deals. Returning clients may also receive loyalty bonuses.",
      },
    ],
  },
  {
    category: "Writers & Quality",
    icon: Users,
    color: "text-brand-400",
    bg: "bg-brand-500/10 border-brand-500/20",
    questions: [
      {
        q: "Who are the writers?",
        a: "All writers are manually vetted professionals — PhD holders, Masters graduates, and published authors. They go through a strict application and approval process before accessing any orders.",
      },
      {
        q: "Can I choose my writer?",
        a: "Writers bid on your order and you can review their profiles, ratings, and completed order count before accepting a proposal. You're always in control of who works on your task.",
      },
      {
        q: "Is the work plagiarism-free?",
        a: "Yes. All writers are required to deliver 100% original content. We have a zero-tolerance policy for plagiarism. If plagiarised content is delivered, you are entitled to a full refund.",
      },
      {
        q: "What if I'm not happy with the result?",
        a: "Request a free revision. Writers are required to revise work that doesn't match your original instructions. Submit your revision request within 3 days of delivery. If the issue still can't be resolved, contact our support team.",
      },
    ],
  },
  {
    category: "Revisions & Refunds",
    icon: RefreshCw,
    color: "text-yellow-400",
    bg: "bg-yellow-500/10 border-yellow-500/20",
    questions: [
      {
        q: "How many revisions do I get?",
        a: "You can request revisions within the scope of your original instructions. There is no hard limit on the number of revision requests, as long as they relate to the original brief.",
      },
      {
        q: "When can I get a full refund?",
        a: "You're guaranteed a full refund if the writer fails to deliver by the deadline, if no writer accepts your order, or if the work is entirely off-topic. See our full Refund Policy for details.",
      },
      {
        q: "How long does a refund take?",
        a: "Once approved, refunds are processed within 3–5 business days back to your original payment method.",
      },
    ],
  },
  {
    category: "For Writers",
    icon: BookOpen,
    color: "text-purple-400",
    bg: "bg-purple-500/10 border-purple-500/20",
    questions: [
      {
        q: "How do I become a writer?",
        a: "Click 'Get Started Free' and sign up as a Writer. Your application is reviewed by our admin team within 24–48 hours. Once approved, your dashboard unlocks and you can start bidding on orders.",
      },
      {
        q: "How do writer earnings work?",
        a: "You earn 80% of the order value. Funds are released to your wallet when the client approves your work. You can withdraw your balance at any time.",
      },
      {
        q: "What kind of orders will I get?",
        a: "All orders are rush orders with 1–24 hour deadlines. Clients need work done fast. The tighter the deadline, the higher the payout — 1-hour orders pay up to 5× the base rate.",
      },
    ],
  },
];

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-white/8 rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-4 text-left hover:bg-white/5 transition-colors"
      >
        <span className="text-white font-medium text-sm pr-4">{q}</span>
        <ChevronDown className={`w-4 h-4 text-slate-500 flex-shrink-0 transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="px-4 pb-4">
          <p className="text-slate-400 text-sm leading-relaxed">{a}</p>
        </div>
      )}
    </div>
  );
}

export default function HelpPage() {
  return (
    <div className="min-h-screen bg-[#020817]">
      <Navbar />
      <main className="pt-32 pb-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* Header */}
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-400 text-sm font-semibold mb-4">
              <HelpCircle className="w-3.5 h-3.5" />
              Help Center
            </div>
            <h1 className="text-4xl lg:text-5xl font-extrabold text-white mb-4">
              How can we <span className="gradient-text">help you?</span>
            </h1>
            <p className="text-slate-400 text-lg max-w-xl mx-auto">
              Find answers to the most common questions about WriteProf.
            </p>
          </div>

          {/* FAQ sections */}
          <div className="space-y-10">
            {faqs.map((section) => {
              const Icon = section.icon;
              return (
                <div key={section.category}>
                  <div className="flex items-center gap-3 mb-4">
                    <div className={`w-9 h-9 rounded-xl border flex items-center justify-center ${section.bg}`}>
                      <Icon className={`w-4 h-4 ${section.color}`} />
                    </div>
                    <h2 className="text-white font-bold text-lg">{section.category}</h2>
                  </div>
                  <div className="space-y-2">
                    {section.questions.map((faq) => (
                      <FAQItem key={faq.q} q={faq.q} a={faq.a} />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Still need help */}
          <div className="mt-14 glass-card p-8 text-center">
            <MessageCircle className="w-10 h-10 text-brand-400 mx-auto mb-3" />
            <h2 className="text-white text-xl font-bold mb-2">Still have questions?</h2>
            <p className="text-slate-400 text-sm mb-6">
              Chat with Aria (our AI support, bottom-right corner) or email us directly — we respond fast.
            </p>
            <a
              href="mailto:oriaventures@gmail.com"
              className="btn-primary inline-flex px-8 py-3"
            >
              <Mail className="w-4 h-4" />
              Email Support
            </a>
          </div>

        </div>
      </main>
      <Footer />
    </div>
  );
}

