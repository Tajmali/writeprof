import { Metadata } from "next";
import { Navbar } from "@/components/shared/Navbar";
import { Footer } from "@/components/shared/Footer";
import { Shield } from "lucide-react";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How WriteProf collects, uses, and protects your personal data. We never sell your information and use bank-grade encryption to keep your account safe.",
  alternates: { canonical: "https://writeprof.com/privacy" },
  openGraph: {
    title: "Privacy Policy — WriteProf",
    description: "How WriteProf collects, uses, and protects your personal data.",
    url: "https://writeprof.com/privacy",
  },
  robots: { index: true, follow: false },
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#020817]">
      <Navbar />
      <main className="pt-32 pb-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center">
              <Shield className="w-5 h-5 text-brand-400" />
            </div>
            <span className="text-brand-400 text-sm font-semibold uppercase tracking-widest">Legal</span>
          </div>
          <h1 className="text-4xl font-extrabold text-white mb-2">Privacy Policy</h1>
          <p className="text-slate-500 text-sm mb-12">Last updated: January 1, 2026</p>

          <div className="prose prose-invert prose-slate max-w-none space-y-10">

            <section>
              <h2 className="text-white text-xl font-bold mb-3">1. Who We Are</h2>
              <p className="text-slate-400 leading-relaxed">
                WriteProf ("we", "our", "us") is an emergency writing marketplace operating at writeprof.com. We connect clients who need urgent written work with vetted professional writers. Our contact email is{" "}
                <a href="mailto:oriaventures@gmail.com" className="text-brand-400 hover:text-brand-300">oriaventures@gmail.com</a>.
              </p>
            </section>

            <section>
              <h2 className="text-white text-xl font-bold mb-3">2. Information We Collect</h2>
              <p className="text-slate-400 leading-relaxed mb-3">We collect information you provide directly, including:</p>
              <ul className="text-slate-400 space-y-2 list-disc list-inside leading-relaxed">
                <li>Account details: name, email address, and password (stored as a secure hash)</li>
                <li>Profile information: phone number, writer qualifications, and specializations</li>
                <li>Order details: task descriptions, deadlines, uploaded files, and instructions</li>
                <li>Payment information: processed securely via Paystack — we do not store card numbers</li>
                <li>Communications: messages between clients and writers on the platform</li>
              </ul>
              <p className="text-slate-400 leading-relaxed mt-3">We also collect usage data automatically, such as IP address, browser type, pages visited, and device information for security and analytics purposes.</p>
            </section>

            <section>
              <h2 className="text-white text-xl font-bold mb-3">3. How We Use Your Information</h2>
              <ul className="text-slate-400 space-y-2 list-disc list-inside leading-relaxed">
                <li>To create and manage your account</li>
                <li>To facilitate orders between clients and writers</li>
                <li>To process payments and manage your wallet balance</li>
                <li>To send transactional emails (order updates, notifications)</li>
                <li>To improve our platform, detect fraud, and ensure security</li>
                <li>To comply with legal obligations</li>
              </ul>
            </section>

            <section>
              <h2 className="text-white text-xl font-bold mb-3">4. Data Sharing</h2>
              <p className="text-slate-400 leading-relaxed">
                We do not sell your personal data. We share information only with:
              </p>
              <ul className="text-slate-400 space-y-2 list-disc list-inside leading-relaxed mt-3">
                <li><strong className="text-slate-300">Writers assigned to your order</strong> — limited to order details needed to complete the task</li>
                <li><strong className="text-slate-300">Paystack</strong> — for payment processing</li>
                <li><strong className="text-slate-300">Supabase</strong> — our database provider, for secure data storage</li>
                <li><strong className="text-slate-300">Law enforcement</strong> — only when legally required</li>
              </ul>
            </section>

            <section>
              <h2 className="text-white text-xl font-bold mb-3">5. Data Retention</h2>
              <p className="text-slate-400 leading-relaxed">
                We retain your account data for as long as your account is active. If you delete your account, we will remove your personal data within 30 days, except where retention is required by law. Order records may be retained for up to 7 years for financial compliance.
              </p>
            </section>

            <section>
              <h2 className="text-white text-xl font-bold mb-3">6. Your Rights</h2>
              <p className="text-slate-400 leading-relaxed mb-3">You have the right to:</p>
              <ul className="text-slate-400 space-y-2 list-disc list-inside leading-relaxed">
                <li>Access the personal data we hold about you</li>
                <li>Correct inaccurate information</li>
                <li>Request deletion of your account and data</li>
                <li>Withdraw consent at any time</li>
                <li>Lodge a complaint with your local data protection authority</li>
              </ul>
              <p className="text-slate-400 leading-relaxed mt-3">To exercise any of these rights, email us at <a href="mailto:oriaventures@gmail.com" className="text-brand-400 hover:text-brand-300">oriaventures@gmail.com</a>.</p>
            </section>

            <section>
              <h2 className="text-white text-xl font-bold mb-3">7. Cookies</h2>
              <p className="text-slate-400 leading-relaxed">
                We use essential cookies to keep you logged in and maintain session state. We do not use third-party advertising cookies. You can disable cookies in your browser settings, though this may affect platform functionality.
              </p>
            </section>

            <section>
              <h2 className="text-white text-xl font-bold mb-3">8. Security</h2>
              <p className="text-slate-400 leading-relaxed">
                We use industry-standard encryption (SSL/TLS) for all data in transit. Passwords are hashed and never stored in plain text. Payments are processed through PCI-compliant infrastructure. Despite our safeguards, no system is 100% secure and we cannot guarantee absolute security.
              </p>
            </section>

            <section>
              <h2 className="text-white text-xl font-bold mb-3">9. Changes to This Policy</h2>
              <p className="text-slate-400 leading-relaxed">
                We may update this Privacy Policy from time to time. We will notify you of significant changes by email or by posting a notice on the platform. Continued use of WriteProf after changes constitutes acceptance of the updated policy.
              </p>
            </section>

            <section>
              <h2 className="text-white text-xl font-bold mb-3">10. Contact</h2>
              <p className="text-slate-400 leading-relaxed">
                Questions about this policy? Reach us at{" "}
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
