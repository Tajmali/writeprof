"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Zap, Mail, Lock, User, Phone, Eye, EyeOff, ArrowRight, Chrome, CheckCircle } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import toast from "react-hot-toast";
import { useAuthStore } from "@/store";

const signupSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().optional(),
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string(),
  role: z.enum(["CLIENT", "WRITER"]),
  agreedToTerms: z.boolean().refine((v) => v === true, "You must agree to the terms"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type SignupForm = z.infer<typeof signupSchema>;

const passwordChecks = [
  { label: "At least 8 characters", check: (p: string) => p.length >= 8 },
  { label: "Contains uppercase letter", check: (p: string) => /[A-Z]/.test(p) },
  { label: "Contains number", check: (p: string) => /\d/.test(p) },
];

function SignupForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setUser } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [password, setPassword] = useState("");
  const [referralCode, setReferralCode] = useState("");
  const [verificationSent, setVerificationSent] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState("");

  useEffect(() => {
    const ref = searchParams.get("ref");
    if (ref) setReferralCode(ref.toUpperCase());
  }, [searchParams]);

  const { register, handleSubmit, watch, formState: { errors } } = useForm<SignupForm>({
    resolver: zodResolver(signupSchema),
    defaultValues: { role: "CLIENT", agreedToTerms: false },
  });

  const selectedRole = watch("role");

  const onSubmit = async (data: SignupForm) => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, referredBy: referralCode || undefined }),
      });
      const result = await res.json();

      if (!res.ok) throw new Error(result.error || "Signup failed");

      // Show email verification screen instead of logging in
      setRegisteredEmail(data.email);
      setVerificationSent(true);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Signup failed");
    } finally {
      setIsLoading(false);
    }
  };

  // Show "check your email" screen after successful signup
  if (verificationSent) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 py-16">
        <div className="fixed inset-0 -z-10">
          <div className="absolute inset-0 bg-[#020817]" />
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-brand-600/10 rounded-full blur-3xl" />
        </div>
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="w-full max-w-md text-center">
          <Link href="/" className="flex items-center justify-center gap-2 mb-8">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-600 to-brand-400 flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <span className="text-2xl font-bold text-white">Write<span className="gradient-text">Prof</span></span>
          </Link>
          <div className="glass-card p-10">
            <div className="w-16 h-16 rounded-full bg-brand-500/20 flex items-center justify-center mx-auto mb-5">
              <Mail className="w-8 h-8 text-brand-400" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-3">Check your inbox</h1>
            <p className="text-slate-400 text-sm leading-relaxed mb-6">
              We sent a verification link to <strong className="text-white">{registeredEmail}</strong>. Click the link in that email to activate your account.
            </p>
            <div className="bg-brand-500/10 border border-brand-500/20 rounded-xl p-4 mb-6 text-left">
              <p className="text-brand-300 text-xs font-semibold mb-1">📬 Can't find it?</p>
              <p className="text-slate-400 text-xs leading-relaxed">Check your spam/junk folder. The link expires in 24 hours.</p>
            </div>
            <p className="text-slate-500 text-xs">
              Already verified?{" "}
              <Link href="/login" className="text-brand-400 hover:underline">Sign in</Link>
            </p>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-16">
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-[#020817]" />
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-brand-600/10 rounded-full blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Link href="/" className="flex items-center justify-center gap-2 mb-8">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-600 to-brand-400 flex items-center justify-center">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <span className="text-2xl font-bold text-white">
            Write<span className="gradient-text">Prof</span>
          </span>
        </Link>

        {referralCode && (
          <div className="mb-4 px-4 py-3 rounded-xl bg-green-500/10 border border-green-500/20 text-green-400 text-sm text-center font-medium">
            🎉 You were referred by a friend! Sign up to get started.
          </div>
        )}

        <div className="glass-card p-8">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-white mb-1">Create your account</h1>
            <p className="text-slate-400 text-sm">Join 12,847+ users on WriteProf</p>
          </div>

          {/* Role selector */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            {[
              { value: "CLIENT", label: "I Need Writing", icon: "📝", desc: "Submit orders" },
              { value: "WRITER", label: "I Am a Writer", icon: "✍️", desc: "Earn money" },
            ].map((role) => (
              <label
                key={role.value}
                className={`relative flex flex-col items-center p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                  selectedRole === role.value
                    ? "border-brand-500 bg-brand-500/10"
                    : "border-white/10 bg-white/5 hover:border-white/20"
                }`}
              >
                <input
                  {...register("role")}
                  type="radio"
                  value={role.value}
                  className="sr-only"
                />
                <span className="text-2xl mb-1">{role.icon}</span>
                <span className="text-white font-semibold text-sm">{role.label}</span>
                <span className="text-slate-500 text-xs">{role.desc}</span>
                {selectedRole === role.value && (
                  <CheckCircle className="absolute top-2 right-2 w-4 h-4 text-brand-400" />
                )}
              </label>
            ))}
          </div>

          {/* Google */}
          <button
            type="button"
            onClick={() => (window.location.href = "/api/auth/google")}
            className="w-full flex items-center justify-center gap-3 py-3 bg-white/10 border border-white/20 rounded-xl text-white font-medium hover:bg-white/15 transition-all duration-200 mb-5"
          >
            <Chrome className="w-5 h-5" />
            Sign up with Google
          </button>

          <div className="relative mb-5">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/10" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-slate-900 px-4 text-slate-500 text-sm">or with email</span>
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="label">Full Name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input {...register("name")} type="text" placeholder="John Doe" className="input-field pl-10" />
              </div>
              {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name.message}</p>}
            </div>

            <div>
              <label className="label">Email address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input {...register("email")} type="email" placeholder="you@example.com" className="input-field pl-10" />
              </div>
              {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email.message}</p>}
            </div>

            <div>
              <label className="label">Phone (optional)</label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input {...register("phone")} type="tel" placeholder="+234 000 000 0000" className="input-field pl-10" />
              </div>
            </div>

            <div>
              <label className="label">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  {...register("password")}
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className="input-field pl-10 pr-10"
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {/* Password strength */}
              {password && (
                <div className="mt-2 space-y-1">
                  {passwordChecks.map((check) => (
                    <div key={check.label} className={`flex items-center gap-1.5 text-xs ${check.check(password) ? "text-green-400" : "text-slate-600"}`}>
                      <CheckCircle className="w-3 h-3" />
                      {check.label}
                    </div>
                  ))}
                </div>
              )}
              {errors.password && <p className="text-red-400 text-xs mt-1">{errors.password.message}</p>}
            </div>

            <div>
              <label className="label">Confirm Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input {...register("confirmPassword")} type="password" placeholder="••••••••" className="input-field pl-10" />
              </div>
              {errors.confirmPassword && <p className="text-red-400 text-xs mt-1">{errors.confirmPassword.message}</p>}
            </div>

            <label className="flex items-start gap-2.5 cursor-pointer">
              <input {...register("agreedToTerms")} type="checkbox" className="mt-0.5 rounded accent-brand-500" />
              <span className="text-slate-400 text-xs leading-relaxed">
                I agree to the{" "}
                <Link href="/terms" className="text-brand-400 hover:underline">Terms of Service</Link>
                {" "}and{" "}
                <Link href="/privacy" className="text-brand-400 hover:underline">Privacy Policy</Link>
              </span>
            </label>
            {errors.agreedToTerms && <p className="text-red-400 text-xs">{errors.agreedToTerms.message}</p>}

            <button type="submit" disabled={isLoading} className="btn-primary w-full py-3 text-base mt-2">
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  Create Account
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <p className="text-center text-slate-500 text-sm mt-5">
            Already have an account?{" "}
            <Link href="/login" className="text-brand-400 hover:text-brand-300 font-semibold transition-colors">
              Sign in
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}

export default function SignupPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#020817]" />}>
      <SignupForm />
    </Suspense>
  );
}
