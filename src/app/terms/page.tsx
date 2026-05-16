import { Metadata } from "next";
import { Navbar } from "@/components/shared/Navbar";
import { Footer } from "@/components/shared/Footer";
import { FileText } from "lucide-react";

export const metadata: Metadata = {
  title: "Terms of Service — WriteProf",
  description: "Terms and conditions for using the WriteProf emergency writing marketplace.",
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[#020817]">
      <Navbar />
      <main className="pt-32 pb-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center">
              <FileText className="w-5 h-5 text-brand-400" />
            </div>
            <span className="text-brand-400 text-sm font-semibold uppercase tracking-widest">Legal</span>
          </div>
          <h1 className="text-4xl font-extrabold text-white mb-2">Terms of Service</h1>
          <p className="text-slate-500 text-sm mb-12">Last updated: January 1, 2026</p>

          <div className="space-y-10">

            <section>
              <h2 className="text-white text-xl font-bold mb-3">1. Acceptance of Terms</h2>
              <p className="text-slate-400 leading-relaxed">
                By creating an account or using WriteProf ("the Platform"), you agree to be bound by these Terms of Service. If you do not agree, you may not use the Platform. These terms apply to all users — clients, writers, and visitors.
              </p>
            </section>

            <section>
              <h2 className="text-white text-xl font-bold mb-3">2. What WriteProf Is</h2>
              <p className="text-slate-400 leading-relaxed">
                WriteProf is an emergency writing marketplace. We connect clients who need urgent written content with vetted professional writers. All orders on the Platform are rush orders with deadlines of 1 to 24 hours. WriteProf acts as an intermediary — we are not the author of any content produced through the Platform.
              </p>
            </section>

            <section>
              <h2 className="text-white text-xl font-bold mb-3">3. Eligibility</h2>
              <p className="text-slate-400 leading-relaxed">
                You must be at least 18 years old to use WriteProf. By registering, you confirm that all information you provide is accurate and that you have the legal authority to enter into this agreement.
              </p>
            </section>

            <section>
              <h2 className="text-white text-xl font-bold mb-3">4. Client Responsibilities</h2>
              <ul className="text-slate-400 space-y-2 list-disc list-inside leading-relaxed">
                <li>Provide clear, complete, and accurate order instructions</li>
                <li>Fund your order before it is assigned to a writer</li>
                <li>Review delivered work promptly and request revisions within the allowed window</li>
                <li>Not misuse, redistribute, or resell content in ways that violate applicable law</li>
                <li>Not submit work as your own in academic contexts where this violates institutional policy</li>
              </ul>
            </section>

            <section>
              <h2 className="text-white text-xl font-bold mb-3">5. Writer Responsibilities</h2>
              <ul className="text-slate-400 space-y-2 list-disc list-inside leading-relaxed">
                <li>Deliver original, plagiarism-free content by the agreed deadline</li>
                <li>Accurately represent your qualifications during the application process</li>
                <li>Maintain professional communication with clients at all times</li>
                <li>Not share, resell, or repurpose content delivered to a client</li>
                <li>Accept revisions that fall within the original scope of the order</li>
              </ul>
            </section>

            <section>
              <h2 className="text-white text-xl font-bold mb-3">6. Payments & Escrow</h2>
              <p className="text-slate-400 leading-relaxed">
                Clients pay upfront when placing an order. Funds are held in escrow and released to the writer only after the client approves the completed work. WriteProf retains a 20% platform commission. Writers receive 80% of the order value. Payments are processed via Paystack.
              </p>
            </section>

            <section>
              <h2 className="text-white text-xl font-bold mb-3">7. Revisions</h2>
              <p className="text-slate-400 leading-relaxed">
                Clients may request revisions within the scope of the original order instructions. Revisions that significantly alter the original brief may be treated as a new order. Writers are expected to complete reasonable revision requests promptly.
              </p>
            </section>

            <section>
              <h2 className="text-white text-xl font-bold mb-3">8. Prohibited Conduct</h2>
              <p className="text-slate-400 leading-relaxed mb-3">You may not:</p>
              <ul className="text-slate-400 space-y-2 list-disc list-inside leading-relaxed">
                <li>Attempt to circumvent the platform by transacting with other users directly</li>
                <li>Upload harmful, illegal, or fraudulent content</li>
                <li>Harass, threaten, or abuse other users</li>
                <li>Create fake accounts or manipulate ratings</li>
                <li>Use the platform for money laundering or fraudulent payments</li>
              </ul>
              <p className="text-slate-400 leading-relaxed mt-3">Violations may result in immediate account termination without refund.</p>
            </section>

            <section>
              <h2 className="text-white text-xl font-bold mb-3">9. Intellectual Property</h2>
              <p className="text-slate-400 leading-relaxed">
                Upon full payment and approval of a completed order, the client receives full rights to the delivered content. WriteProf retains no ownership of completed work. Writers assign all rights to the client upon payment release. WriteProf retains ownership of all platform software, branding, and design.
              </p>
            </section>

            <section>
              <h2 className="text-white text-xl font-bold mb-3">10. Limitation of Liability</h2>
              <p className="text-slate-400 leading-relaxed">
                WriteProf provides the platform "as is." We are not liable for any indirect, incidental, or consequential damages arising from use of the platform, including but not limited to missed deadlines caused by inaccurate order instructions, writer delays beyond our control, or system outages. Our maximum liability to any user shall not exceed the amount paid for the specific order in dispute.
              </p>
            </section>

            <section>
              <h2 className="text-white text-xl font-bold mb-3">11. Termination</h2>
              <p className="text-slate-400 leading-relaxed">
                We reserve the right to suspend or terminate any account at our discretion if we believe these terms have been violated. Users may close their account at any time by contacting us at <a href="mailto:oriaventures@gmail.com" className="text-brand-400 hover:text-brand-300">oriaventures@gmail.com</a>.
              </p>
            </section>

            <section>
              <h2 className="text-white text-xl font-bold mb-3">12. Governing Law</h2>
              <p className="text-slate-400 leading-relaxed">
                These terms are governed by the laws of the United States. Any disputes shall be resolved through binding arbitration, except where prohibited by local law.
              </p>
            </section>

            <section>
              <h2 className="text-white text-xl font-bold mb-3">13. Contact</h2>
              <p className="text-slate-400 leading-relaxed">
                For questions about these terms, contact us at{" "}
                <a href="mailto:oriaventures@gmail.com" className="text-brand-400 hover:text-brand-300">oriaventures@gmail.com</a>.
              </p>
            </section>

          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
