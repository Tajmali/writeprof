"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Zap, Mail, ArrowRight, CheckCircle } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";

const schema = z.object({ email: z.string().email("Invalid email address") });
type FormData = z.infer<typeof schema>;

export default function ForgotPasswordPage() {
  const [sent, setSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { register, handleSubmit, formState: { errors }, getValues } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      setSent(true);
    } catch {
      toast.error("Failed to send reset email. Try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="fixed inset-0 -z-10 bg-[#020817]" />
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <Link href="/" className="flex items-center justify-center gap-2 mb-8">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-600 to-brand-400 flex items-center justify-center">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <span className="text-2xl font-bold text-white">Write<span className="gradient-text">Prof</span></span>
        </Link>

        <div className="glass-card p-8">
          {sent ? (
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-green-400" />
              </div>
              <h1 className="text-2xl font-bold text-white mb-2">Check your email</h1>
              <p className="text-slate-400 text-sm mb-6">
                We've sent a password reset link to{" "}
                <strong className="text-white">{getValues("email")}</strong>
              </p>
              <p className="text-slate-500 text-xs mb-6">Didn't receive it? Check your spam folder.</p>
              <Link href="/login" className="btn-secondary w-full text-center block py-3">
                Back to Sign In
              </Link>
            </div>
          ) : (
            <>
              <h1 className="text-2xl font-bold text-white mb-2">Reset your password</h1>
              <p className="text-slate-400 text-sm mb-6">
                Enter your email and we'll send you a reset link.
              </p>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div>
                  <label className="label">Email address</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input {...register("email")} type="email" placeholder="you@example.com" className="input-field pl-10" />
                  </div>
                  {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email.message}</p>}
                </div>
                <button type="submit" disabled={isLoading} className="btn-primary w-full py-3">
                  {isLoading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><ArrowRight className="w-4 h-4" />Send Reset Link</>}
                </button>
              </form>
              <p className="text-center text-slate-500 text-sm mt-5">
                <Link href="/login" className="text-brand-400 hover:text-brand-300 transition-colors">← Back to login</Link>
              </p>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
}
