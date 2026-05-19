"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CheckCircle, XCircle, Loader2, Mail } from "lucide-react";
import Link from "next/link";

function VerifyEmailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [status, setStatus] = useState<"loading" | "success" | "error" | "no-token">("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!token) {
      setStatus("no-token");
      return;
    }

    // Hit the API route — it redirects on success, returns JSON on error
    fetch(`/api/auth/verify-email?token=${token}`)
      .then(async (res) => {
        if (res.redirected) {
          // Successful — follow redirect
          router.push(new URL(res.url).pathname);
          return;
        }
        if (res.ok) {
          setStatus("success");
        } else {
          const data = await res.json();
          setStatus("error");
          setMessage(data.error || "Verification failed");
        }
      })
      .catch(() => {
        setStatus("error");
        setMessage("Something went wrong. Please try again.");
      });
  }, [token, router]);

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-[#020817]">
      <div className="fixed inset-0 -z-10">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-96 h-96 bg-brand-600/10 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-md text-center">
        {/* Logo */}
        <Link href="/" className="inline-flex items-center gap-2 mb-10 justify-center">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-600 to-brand-400 flex items-center justify-center">
            <Mail className="w-5 h-5 text-white" />
          </div>
          <span className="text-2xl font-bold text-white">Write<span className="gradient-text">Prof</span></span>
        </Link>

        <div className="glass-card p-10">
          {status === "loading" && (
            <>
              <Loader2 className="w-14 h-14 text-brand-400 animate-spin mx-auto mb-5" />
              <h1 className="text-xl font-bold text-white mb-2">Verifying your email…</h1>
              <p className="text-slate-400 text-sm">Please wait a moment.</p>
            </>
          )}

          {status === "success" && (
            <>
              <CheckCircle className="w-14 h-14 text-green-400 mx-auto mb-5" />
              <h1 className="text-xl font-bold text-white mb-2">Email Verified!</h1>
              <p className="text-slate-400 text-sm mb-6">Your account is confirmed. Redirecting you to your dashboard…</p>
              <div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin mx-auto" />
            </>
          )}

          {status === "error" && (
            <>
              <XCircle className="w-14 h-14 text-red-400 mx-auto mb-5" />
              <h1 className="text-xl font-bold text-white mb-2">Verification Failed</h1>
              <p className="text-slate-400 text-sm mb-6">{message}</p>
              <ResendButton />
            </>
          )}

          {status === "no-token" && (
            <>
              <Mail className="w-14 h-14 text-brand-400 mx-auto mb-5" />
              <h1 className="text-xl font-bold text-white mb-2">Check your inbox</h1>
              <p className="text-slate-400 text-sm mb-6">
                We sent you a verification link when you signed up. Click it to activate your account.
              </p>
              <ResendButton />
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function ResendButton() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleResend = async () => {
    if (!email) return;
    setLoading(true);
    try {
      await fetch("/api/auth/resend-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      setSent(true);
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <div className="px-4 py-3 rounded-xl bg-green-500/10 border border-green-500/20 text-green-400 text-sm">
        ✅ New verification link sent! Check your inbox.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <p className="text-slate-500 text-xs">Need a new link? Enter your email:</p>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="you@example.com"
        className="input-field w-full"
      />
      <button
        onClick={handleResend}
        disabled={loading || !email}
        className="btn-primary w-full py-2.5 text-sm"
      >
        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Resend Verification Email"}
      </button>
      <Link href="/login" className="block text-brand-400 text-sm hover:underline">
        Back to login
      </Link>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#020817]" />}>
      <VerifyEmailContent />
    </Suspense>
  );
}
