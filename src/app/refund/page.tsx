import { Metadata } from "next";
import { Navbar } from "@/components/shared/Navbar";
import { Footer } from "@/components/shared/Footer";
import { RefreshCw, CheckCircle, XCircle, AlertCircle } from "lucide-react";

export const metadata: Metadata = {
  title: "Refund Policy",
  description: "WriteProf guarantees a full refund if your writer misses the deadline or delivers entirely off-topic work. Read our transparent refund and dispute policy.",
  alternates: { canonical: "https://writeprof.com/refund" },
  openGraph: {
    title: "Refund Policy — WriteProf",
    description: "Full refund if the writer misses your deadline. Transparent refund and dispute policy.",
    url: "https://writeprof.com/refund",
  },
  robots: { index: true, follow: false },
};

export default function RefundPage() {
  return (
    <div className="min-h-screen bg-[#020817]">
      <Navbar />
      <main className="pt-32 pb-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-green-500/10 border border-green-500/20 flex items-center justify-center">
              <RefreshCw className="w-5 h-5 text-green-400" />
            </div>
            <span className="text-green-400 text-sm font-semibold uppercase tracking-widest">Refund Policy</span>
          </div>
          <h1 className="text-4xl font-extrabold text-white mb-2">Refund Policy</h1>
          <p className="text-slate-500 text-sm mb-4">Last updated: January 1, 2026</p>
          <p className="text-slate-400 leading-relaxed mb-12">
            We stand behind the quality of work delivered on WriteProf. Here's exactly when and how you can get a refund.
          </p>

          {/* Guaranteed refund situations */}
          <div className="glass-card p-6 mb-6 border border-green-500/20">
            <div className="flex items-center gap-2 mb-4">
              <CheckCircle className="w-5 h-5 text-green-400" />
              <h2 className="text-white text-lg font-bold">Full Refund — Guaranteed</h2>
            </div>
            <p className="text-slate-400 text-sm mb-4">You are entitled to a full refund in the following situations:</p>
            <ul className="space-y-3">
              {[
                "The writer fails to deliver your order before the deadline",
                "No writer accepts your order within a reasonable time and it expires",
                "The delivered work is entirely off-topic or does not match your instructions at all",
                "You cancel your order before a writer has been assigned",
                "Duplicate payment was charged due to a technical error",
              ].map((item) => (
                <li key={item} className="flex items-start gap-3 text-slate-400 text-sm leading-relaxed">
                  <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* Partial refund */}
          <div className="glass-card p-6 mb-6 border border-yellow-500/20">
            <div className="flex items-center gap-2 mb-4">
              <AlertCircle className="w-5 h-5 text-yellow-400" />
              <h2 className="text-white text-lg font-bold">Partial Refund — Case by Case</h2>
            </div>
            <p className="text-slate-400 text-sm mb-4">A partial refund may be issued when:</p>
            <ul className="space-y-3">
              {[
                "Work is delivered late but you still choose to use it",
                "The delivered work partially meets your requirements after revisions",
                "You cancel the order after the writer has already started work",
              ].map((item) => (
                <li key={item} className="flex items-start gap-3 text-slate-400 text-sm leading-relaxed">
                  <AlertCircle className="w-4 h-4 text-yellow-400 mt-0.5 flex-shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* No refund */}
          <div className="glass-card p-6 mb-10 border border-red-500/20">
            <div className="flex items-center gap-2 mb-4">
              <XCircle className="w-5 h-5 text-red-400" />
              <h2 className="text-white text-lg font-bold">No Refund</h2>
            </div>
            <p className="text-slate-400 text-sm mb-4">Refunds will not be issued when:</p>
            <ul className="space-y-3">
              {[
                "You have already approved the completed order and released payment",
                "The order was completed correctly but you changed your mind about the topic",
                "You provided incorrect or incomplete instructions and the writer followed them accurately",
                "The refund request is made more than 7 days after order completion",
                "The work was used or published before raising a dispute",
              ].map((item) => (
                <li key={item} className="flex items-start gap-3 text-slate-400 text-sm leading-relaxed">
                  <XCircle className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-8">
            <section>
              <h2 className="text-white text-xl font-bold mb-3">How to Request a Refund</h2>
              <p className="text-slate-400 leading-relaxed mb-4">
                To request a refund, contact us within <strong className="text-white">7 days</strong> of the order completion date:
              </p>
              <div className="glass-card p-5 space-y-3">
                <div className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-brand-500/20 text-brand-400 font-bold text-xs flex items-center justify-center flex-shrink-0 mt-0.5">1</span>
                  <p className="text-slate-400 text-sm leading-relaxed">Email <a href="mailto:oriaventures@gmail.com" className="text-brand-400 hover:text-brand-300">oriaventures@gmail.com</a> with your order number and reason for the refund request</p>
                </div>
                <div className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-brand-500/20 text-brand-400 font-bold text-xs flex items-center justify-center flex-shrink-0 mt-0.5">2</span>
                  <p className="text-slate-400 text-sm leading-relaxed">Our team will review your request within <strong className="text-white">24–48 hours</strong></p>
                </div>
                <div className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-brand-500/20 text-brand-400 font-bold text-xs flex items-center justify-center flex-shrink-0 mt-0.5">3</span>
                  <p className="text-slate-400 text-sm leading-relaxed">If approved, your refund is processed within <strong className="text-white">3–5 business days</strong> to your original payment method</p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-white text-xl font-bold mb-3">Revision Policy</h2>
              <p className="text-slate-400 leading-relaxed">
                Before requesting a refund, we encourage you to use our free revision system. Writers are required to revise work that doesn't match the original instructions. Revision requests should be submitted within <strong className="text-white">3 days</strong> of delivery. Most quality issues can be resolved through revisions without the need for a refund.
              </p>
            </section>

            <section>
              <h2 className="text-white text-xl font-bold mb-3">Questions?</h2>
              <p className="text-slate-400 leading-relaxed">
                If you have any questions about our refund policy or want to dispute an order outcome, reach out at{" "}
                <a href="mailto:oriaventures@gmail.com" className="text-brand-400 hover:text-brand-300">oriaventures@gmail.com</a>. We typically respond within a few hours.
              </p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
