"use client";

import { useState } from "react";
import { Navbar } from "@/components/shared/Navbar";
import { Footer } from "@/components/shared/Footer";
import { Mail, MessageCircle, Clock, Send, CheckCircle } from "lucide-react";

export default function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Simulate send — in production wire this to an API route
    await new Promise((r) => setTimeout(r, 1200));
    setLoading(false);
    setSent(true);
  };

  return (
    <div className="min-h-screen bg-[#020817]">
      <Navbar />
      <main className="pt-32 pb-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* Header */}
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-400 text-sm font-semibold mb-4">
              <Mail className="w-3.5 h-3.5" />
              Get in Touch
            </div>
            <h1 className="text-4xl lg:text-5xl font-extrabold text-white mb-4">
              We're here to <span className="gradient-text">help</span>
            </h1>
            <p className="text-slate-400 text-lg max-w-xl mx-auto">
              Got a question, issue, or feedback? Send us a message and we'll get back to you fast.
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">

            {/* Contact info cards */}
            <div className="space-y-4">
              <div className="glass-card p-5">
                <div className="w-10 h-10 rounded-xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center mb-3">
                  <Mail className="w-5 h-5 text-brand-400" />
                </div>
                <h3 className="text-white font-semibold mb-1">Email Us</h3>
                <p className="text-slate-500 text-sm mb-2">For all inquiries and support</p>
                <a href="mailto:oriaventures@gmail.com" className="text-brand-400 hover:text-brand-300 text-sm font-medium transition-colors">
                  oriaventures@gmail.com
                </a>
              </div>

              <div className="glass-card p-5">
                <div className="w-10 h-10 rounded-xl bg-green-500/10 border border-green-500/20 flex items-center justify-center mb-3">
                  <MessageCircle className="w-5 h-5 text-green-400" />
                </div>
                <h3 className="text-white font-semibold mb-1">Live Chat</h3>
                <p className="text-slate-500 text-sm mb-2">Chat with Aria, our AI support agent</p>
                <p className="text-green-400 text-sm font-medium">Click the chat button → bottom right</p>
              </div>

              <div className="glass-card p-5">
                <div className="w-10 h-10 rounded-xl bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center mb-3">
                  <Clock className="w-5 h-5 text-yellow-400" />
                </div>
                <h3 className="text-white font-semibold mb-1">Response Time</h3>
                <p className="text-slate-500 text-sm mb-2">We move fast — just like our writers</p>
                <p className="text-yellow-400 text-sm font-medium">Usually within a few hours</p>
              </div>
            </div>

            {/* Contact form */}
            <div className="lg:col-span-2">
              <div className="glass-card p-8">
                {sent ? (
                  <div className="text-center py-10">
                    <div className="w-16 h-16 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center mx-auto mb-4">
                      <CheckCircle className="w-8 h-8 text-green-400" />
                    </div>
                    <h2 className="text-white text-xl font-bold mb-2">Message Sent!</h2>
                    <p className="text-slate-400 text-sm">We've received your message and will get back to you shortly at <strong className="text-white">{form.email}</strong>.</p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-5">
                    <h2 className="text-white text-xl font-bold mb-6">Send a Message</h2>
                    <div className="grid sm:grid-cols-2 gap-5">
                      <div>
                        <label className="label">Your Name</label>
                        <input
                          type="text"
                          required
                          placeholder="John Smith"
                          className="input-field"
                          value={form.name}
                          onChange={(e) => setForm({ ...form, name: e.target.value })}
                        />
                      </div>
                      <div>
                        <label className="label">Email Address</label>
                        <input
                          type="email"
                          required
                          placeholder="you@example.com"
                          className="input-field"
                          value={form.email}
                          onChange={(e) => setForm({ ...form, email: e.target.value })}
                        />
                      </div>
                    </div>
                    <div>
                      <label className="label">Subject</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Issue with my order"
                        className="input-field"
                        value={form.subject}
                        onChange={(e) => setForm({ ...form, subject: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="label">Message</label>
                      <textarea
                        required
                        rows={5}
                        placeholder="Describe your question or issue in detail..."
                        className="input-field resize-none"
                        value={form.message}
                        onChange={(e) => setForm({ ...form, message: e.target.value })}
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={loading}
                      className="btn-primary w-full py-3 text-base"
                    >
                      {loading ? (
                        <span className="flex items-center justify-center gap-2">
                          <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                          </svg>
                          Sending...
                        </span>
                      ) : (
                        <span className="flex items-center justify-center gap-2">
                          <Send className="w-4 h-4" />
                          Send Message
                        </span>
                      )}
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
