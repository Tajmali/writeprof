"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Lock, Eye, EyeOff, Zap, CheckCircle, XCircle, Loader2 } from "lucide-react";
import toast from "react-hot-toast";

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token) setError("No reset token found. Please request a new password reset link.");
  }, [token]);

  const strength = (pw: string) => {
    let score = 0;
    if (pw.length >= 8) score++;
    if (/[A-Z]/.test(pw)) score++;
    if (/[0-9]/.test(pw)) score++;
    if (/[^A-Za-z0-9]/.test(pw)) score++;
    return score;
  };

  const pwStrength = strength(password);
  const strengthLabel = ["", "Weak", "Fair", "Good", "Strong"][pwStrength];
  const strengthColor = ["", "bg-red-500", "bg-orange-400", "bg-yellow-400", "bg-green-500"][pwStrength];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    if (password.length < 8) { toast.error("Password must be at least 8 characters"); return; }
    if (password !== confirm) { toast.error("Passwords do not match"); return; }

    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json();
      if (!data.success) {
        setError(data.error || "Something went wrong.");
        return;
      }
      setDone(true);
      setTimeout(() => router.push("/login"), 3000);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#020817] flex items-center justify-center px-4">
      {/* Background glow */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-brand-600/10 rounded-full blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-600 to-brand-400 flex items-center justify-center shadow-lg shadow-brand-500/30">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <span className="text-2xl font-bold text-white">
              Write<span className="gradient-text">Prof</span>
            </span>
          </Link>
        </div>

        <div className="glass-card p-8">
          {done ? (
            /* Success state */
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-4"
            >
              <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-green-400" />
              </div>
              <h2 className="text-xl font-bold text-white mb-2">Password Reset!</h2>
              <p className="text-slate-400 text-sm mb-4">
                Your password has been updated successfully. Redirecting you to login…
              </p>
              <Link href="/login" className="btn-primary px-6 py-2 inline-flex items-center gap-2">
                Go to Login
              </Link>
            </motion.div>
          ) : error && !token ? (
            /* No token state */
            <div className="text-center py-4">
              <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-4">
                <XCircle className="w-8 h-8 text-red-400" />
              </div>
              <h2 className="text-xl font-bold text-white mb-2">Invalid Link</h2>
              <p className="text-slate-400 text-sm mb-6">{error}</p>
              <Link href="/forgot-password" className="btn-primary px-6 py-2 inline-flex">
                Request New Link
              </Link>
            </div>
          ) : (
            /* Form state */
            <>
              <div className="mb-6">
                <h1 className="text-2xl font-bold text-white mb-1">Set new password</h1>
                <p className="text-slate-400 text-sm">Choose a strong password for your account.</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* New password */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">New Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder="At least 8 characters"
                      className="input-field w-full pl-10 pr-10"
                      autoComplete="new-password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(v => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {/* Strength meter */}
                  {password.length > 0 && (
                    <div className="mt-2">
                      <div className="flex gap-1 mb-1">
                        {[1, 2, 3, 4].map(i => (
                          <div
                            key={i}
                            className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                              i <= pwStrength ? strengthColor : "bg-white/10"
                            }`}
                          />
                        ))}
                      </div>
                      <p className={`text-xs ${
                        pwStrength <= 1 ? "text-red-400" :
                        pwStrength === 2 ? "text-orange-400" :
                        pwStrength === 3 ? "text-yellow-400" : "text-green-400"
                      }`}>{strengthLabel}</p>
                    </div>
                  )}
                </div>

                {/* Confirm password */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">Confirm Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type={showConfirm ? "text" : "password"}
                      value={confirm}
                      onChange={e => setConfirm(e.target.value)}
                      placeholder="Repeat your new password"
                      className={`input-field w-full pl-10 pr-10 ${
                        confirm && password !== confirm ? "border-red-500/50" : ""
                      }`}
                      autoComplete="new-password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirm(v => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors"
                    >
                      {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {confirm && password !== confirm && (
                    <p className="text-xs text-red-400 mt-1">Passwords do not match</p>
                  )}
                </div>

                {/* API error */}
                {error && (
                  <div className="flex items-center gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                    <XCircle className="w-4 h-4 shrink-0" />
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading || !password || !confirm || password !== confirm}
                  className="btn-primary w-full flex items-center justify-center gap-2 py-3 mt-2"
                >
                  {loading ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> Resetting…</>
                  ) : (
                    "Reset Password"
                  )}
                </button>
              </form>

              <p className="text-center text-slate-500 text-sm mt-5">
                Remember your password?{" "}
                <Link href="/login" className="text-brand-400 hover:text-brand-300 transition-colors">
                  Sign in
                </Link>
              </p>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#020817] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-brand-400 animate-spin" />
      </div>
    }>
      <ResetPasswordForm />
    </Suspense>
  );
}
