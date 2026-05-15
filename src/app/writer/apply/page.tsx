"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  PenTool, CheckCircle, ArrowRight, ArrowLeft, Upload,
  Star, Zap, Clock, DollarSign, Eye, EyeOff, Loader2, BookOpen
} from "lucide-react";
import toast from "react-hot-toast";

const step1Schema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Valid email required"),
  password: z.string().min(8, "At least 8 characters"),
  phone: z.string().optional(),
});

const step2Schema = z.object({
  specialization: z.string().min(1, "Select a specialization"),
  education: z.string().min(2, "Education is required"),
  experience: z.number().min(0, "Enter years of experience"),
  bio: z.string().min(50, "Bio must be at least 50 characters"),
  languages: z.string().min(2, "Enter at least one language"),
});

const step3Schema = z.object({
  sampleText: z.string().min(200, "Please write at least 200 characters"),
  portfolioUrl: z.string().url("Valid URL required").optional().or(z.literal("")),
  agreedToTerms: z.boolean().refine(v => v, "You must agree to the terms"),
});

type Step1 = z.infer<typeof step1Schema>;
type Step2 = z.infer<typeof step2Schema>;
type Step3 = z.infer<typeof step3Schema>;

const SPECIALIZATIONS = [
  "Academic Writing", "Creative Writing", "Technical Writing", "Business Writing",
  "Research Papers", "Essay Writing", "Content Writing", "Copywriting",
  "Thesis & Dissertations", "SEO Writing", "Journalism", "Scientific Writing",
];

const BENEFITS = [
  { icon: DollarSign, label: "Earn up to $2,000/month", color: "text-green-400" },
  { icon: Clock, label: "Work at your own schedule", color: "text-blue-400" },
  { icon: Zap, label: "Instant payment to wallet", color: "text-orange-400" },
  { icon: Star, label: "Build your reputation", color: "text-yellow-400" },
];

export default function WriterApplyPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [step1Data, setStep1Data] = useState<Step1 | null>(null);
  const [step2Data, setStep2Data] = useState<Step2 | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const step1Form = useForm<Step1>({ resolver: zodResolver(step1Schema) });
  const step2Form = useForm<Step2>({ resolver: zodResolver(step2Schema), defaultValues: { experience: 0 } });
  const step3Form = useForm<Step3>({ resolver: zodResolver(step3Schema), defaultValues: { agreedToTerms: false } });

  const handleStep1 = (data: Step1) => {
    setStep1Data(data);
    setCurrentStep(2);
  };

  const handleStep2 = (data: Step2) => {
    setStep2Data(data);
    setCurrentStep(3);
  };

  const handleStep3 = async (data: Step3) => {
    if (!step1Data || !step2Data) return;
    setSubmitting(true);

    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: step1Data.name,
          email: step1Data.email,
          password: step1Data.password,
          phone: step1Data.phone,
          role: "WRITER",
          writerProfile: {
            specialization: step2Data.specialization,
            education: step2Data.education,
            experience: step2Data.experience,
            bio: step2Data.bio,
            languages: step2Data.languages.split(",").map(l => l.trim()),
            portfolioUrl: data.portfolioUrl || null,
            sampleText: data.sampleText,
          },
        }),
      });

      const json = await res.json();
      if (!json.success) throw new Error(json.error);

      setCurrentStep(4);
    } catch (err) {
      toast.error((err as Error).message || "Application failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const steps = [
    { number: 1, label: "Account" },
    { number: 2, label: "Profile" },
    { number: 3, label: "Sample" },
    { number: 4, label: "Done" },
  ];

  return (
    <div className="min-h-screen bg-[#0a0f1e] flex">
      {/* Left Panel — Benefits */}
      <div className="hidden lg:flex lg:w-2/5 xl:w-1/3 flex-col justify-between p-12 bg-gradient-to-b from-brand-900/50 to-[#0a0f1e] border-r border-white/10">
        <Link href="/" className="text-xl font-bold gradient-text">WriteProf</Link>

        <div>
          <div className="w-14 h-14 rounded-2xl bg-brand-500/20 flex items-center justify-center mb-6">
            <PenTool className="w-7 h-7 text-brand-400" />
          </div>
          <h2 className="text-3xl font-bold text-white mb-3">Become a Writer</h2>
          <p className="text-gray-400 mb-8 leading-relaxed">
            Join thousands of professional writers earning from their skills. Complete orders, earn per project, and build your portfolio.
          </p>
          <div className="space-y-4">
            {BENEFITS.map((benefit, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className="flex items-center gap-3"
              >
                <div className="w-9 h-9 rounded-xl bg-white/5 flex items-center justify-center shrink-0">
                  <benefit.icon className={`w-4 h-4 ${benefit.color}`} />
                </div>
                <span className="text-gray-300 text-sm">{benefit.label}</span>
              </motion.div>
            ))}
          </div>

          <div className="mt-8 p-4 rounded-xl bg-brand-500/10 border border-brand-500/20">
            <p className="text-xs text-gray-400 leading-relaxed">
              <span className="text-brand-400 font-semibold">🎓 Academic writers</span> on WriteProf earn an average of $850/month completing assignments, essays, and research papers.
            </p>
          </div>
        </div>

        <p className="text-xs text-gray-600">
          Already have an account?{" "}
          <Link href="/login" className="text-brand-400 hover:text-brand-300">Sign in</Link>
        </p>
      </div>

      {/* Right Panel — Form */}
      <div className="flex-1 flex items-start justify-center p-6 sm:p-10 overflow-y-auto">
        <div className="w-full max-w-md py-6">
          {/* Mobile Header */}
          <div className="lg:hidden mb-8">
            <Link href="/" className="text-xl font-bold gradient-text block mb-4">WriteProf</Link>
            <h1 className="text-2xl font-bold text-white">Become a Writer</h1>
          </div>

          {/* Progress Stepper */}
          {currentStep < 4 && (
            <div className="flex items-center justify-between mb-8">
              {steps.slice(0, 3).map((step, i) => (
                <div key={step.number} className="flex items-center flex-1">
                  <div className="flex flex-col items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-all ${
                      currentStep > step.number ? "bg-brand-500 border-brand-500 text-white" :
                      currentStep === step.number ? "border-brand-500 text-brand-400" :
                      "border-white/20 text-gray-600"
                    }`}>
                      {currentStep > step.number ? <CheckCircle className="w-4 h-4" /> : step.number}
                    </div>
                    <span className={`text-xs mt-1 ${currentStep === step.number ? "text-brand-400" : "text-gray-600"}`}>
                      {step.label}
                    </span>
                  </div>
                  {i < 2 && (
                    <div className={`flex-1 h-0.5 mx-2 mb-3 ${currentStep > step.number ? "bg-brand-500" : "bg-white/10"}`} />
                  )}
                </div>
              ))}
            </div>
          )}

          <AnimatePresence mode="wait">
            {/* Step 1: Account */}
            {currentStep === 1 && (
              <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <h2 className="text-xl font-bold text-white mb-1">Create your account</h2>
                <p className="text-gray-400 text-sm mb-6">Start your writer journey</p>

                <form onSubmit={step1Form.handleSubmit(handleStep1)} className="space-y-4">
                  <div>
                    <label className="text-sm text-gray-400 mb-1.5 block">Full Name</label>
                    <input {...step1Form.register("name")} className="input-field w-full" placeholder="John Doe" />
                    {step1Form.formState.errors.name && <p className="text-xs text-red-400 mt-1">{step1Form.formState.errors.name.message}</p>}
                  </div>
                  <div>
                    <label className="text-sm text-gray-400 mb-1.5 block">Email Address</label>
                    <input {...step1Form.register("email")} type="email" className="input-field w-full" placeholder="john@example.com" />
                    {step1Form.formState.errors.email && <p className="text-xs text-red-400 mt-1">{step1Form.formState.errors.email.message}</p>}
                  </div>
                  <div>
                    <label className="text-sm text-gray-400 mb-1.5 block">Password</label>
                    <div className="relative">
                      <input {...step1Form.register("password")} type={showPassword ? "text" : "password"}
                        className="input-field w-full pr-10" placeholder="Min. 8 characters" />
                      <button type="button" onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white">
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {step1Form.formState.errors.password && <p className="text-xs text-red-400 mt-1">{step1Form.formState.errors.password.message}</p>}
                  </div>
                  <div>
                    <label className="text-sm text-gray-400 mb-1.5 block">Phone (optional)</label>
                    <input {...step1Form.register("phone")} className="input-field w-full" placeholder="+234..." />
                  </div>
                  <button type="submit" className="btn-primary w-full flex items-center justify-center gap-2 py-3">
                    Continue <ArrowRight className="w-4 h-4" />
                  </button>
                </form>

                <p className="text-center text-sm text-gray-500 mt-4">
                  Already a writer?{" "}
                  <Link href="/login" className="text-brand-400 hover:text-brand-300">Sign in</Link>
                </p>
              </motion.div>
            )}

            {/* Step 2: Profile */}
            {currentStep === 2 && (
              <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <h2 className="text-xl font-bold text-white mb-1">Your writing profile</h2>
                <p className="text-gray-400 text-sm mb-6">Tell us about your expertise</p>

                <form onSubmit={step2Form.handleSubmit(handleStep2)} className="space-y-4">
                  <div>
                    <label className="text-sm text-gray-400 mb-1.5 block">Primary Specialization</label>
                    <select {...step2Form.register("specialization")} className="input-field w-full">
                      <option value="">Select your specialization</option>
                      {SPECIALIZATIONS.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                    {step2Form.formState.errors.specialization && <p className="text-xs text-red-400 mt-1">{step2Form.formState.errors.specialization.message}</p>}
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-sm text-gray-400 mb-1.5 block">Education</label>
                      <input {...step2Form.register("education")} className="input-field w-full" placeholder="B.Sc. English" />
                      {step2Form.formState.errors.education && <p className="text-xs text-red-400 mt-1">{step2Form.formState.errors.education.message}</p>}
                    </div>
                    <div>
                      <label className="text-sm text-gray-400 mb-1.5 block">Years Experience</label>
                      <input {...step2Form.register("experience", { valueAsNumber: true })} type="number" min="0"
                        className="input-field w-full" placeholder="e.g. 3" />
                    </div>
                  </div>
                  <div>
                    <label className="text-sm text-gray-400 mb-1.5 block">Languages</label>
                    <input {...step2Form.register("languages")} className="input-field w-full" placeholder="English, French..." />
                  </div>
                  <div>
                    <label className="text-sm text-gray-400 mb-1.5 block">Bio (min. 50 characters)</label>
                    <textarea {...step2Form.register("bio")} rows={4} className="input-field w-full resize-none"
                      placeholder="Tell us about your writing expertise, experience, and why you'd be great on WriteProf..." />
                    <p className="text-xs text-gray-500 mt-1">{step2Form.watch("bio")?.length || 0}/50 min</p>
                    {step2Form.formState.errors.bio && <p className="text-xs text-red-400 mt-1">{step2Form.formState.errors.bio.message}</p>}
                  </div>
                  <div className="flex gap-2">
                    <button type="button" onClick={() => setCurrentStep(1)}
                      className="btn-secondary flex-1 flex items-center justify-center gap-2">
                      <ArrowLeft className="w-4 h-4" /> Back
                    </button>
                    <button type="submit" className="btn-primary flex-1 flex items-center justify-center gap-2">
                      Continue <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </form>
              </motion.div>
            )}

            {/* Step 3: Sample Writing */}
            {currentStep === 3 && (
              <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <h2 className="text-xl font-bold text-white mb-1">Writing sample</h2>
                <p className="text-gray-400 text-sm mb-6">Show us your skills with a short writing sample</p>

                <form onSubmit={step3Form.handleSubmit(handleStep3)} className="space-y-4">
                  <div>
                    <label className="text-sm text-gray-400 mb-1.5 block">
                      Writing Sample <span className="text-xs text-gray-500">(min. 200 characters)</span>
                    </label>
                    <div className="p-3 rounded-xl bg-brand-500/10 border border-brand-500/20 mb-2">
                      <p className="text-xs text-brand-400">
                        <BookOpen className="w-3.5 h-3.5 inline mr-1" />
                        Prompt: Write a short introduction for an essay on the impact of technology on education.
                      </p>
                    </div>
                    <textarea {...step3Form.register("sampleText")} rows={8} className="input-field w-full resize-none"
                      placeholder="Write your sample here..." />
                    <div className="flex justify-between mt-1">
                      <span className="text-xs text-gray-500">{step3Form.watch("sampleText")?.length || 0} characters</span>
                      <span className="text-xs text-gray-500">Min: 200</span>
                    </div>
                    {step3Form.formState.errors.sampleText && <p className="text-xs text-red-400 mt-1">{step3Form.formState.errors.sampleText.message}</p>}
                  </div>
                  <div>
                    <label className="text-sm text-gray-400 mb-1.5 block">Portfolio URL (optional)</label>
                    <input {...step3Form.register("portfolioUrl")} className="input-field w-full" placeholder="https://yourportfolio.com" />
                    {step3Form.formState.errors.portfolioUrl && <p className="text-xs text-red-400 mt-1">{step3Form.formState.errors.portfolioUrl.message}</p>}
                  </div>
                  <div className="flex items-start gap-3">
                    <input {...step3Form.register("agreedToTerms")} type="checkbox" id="terms"
                      className="mt-0.5 w-4 h-4 rounded border-white/20 bg-white/10" />
                    <label htmlFor="terms" className="text-sm text-gray-400">
                      I agree to the{" "}
                      <Link href="/terms" className="text-brand-400 hover:text-brand-300">Terms of Service</Link>{" "}
                      and confirm I will complete orders honestly and on time.
                    </label>
                  </div>
                  {step3Form.formState.errors.agreedToTerms && <p className="text-xs text-red-400">{step3Form.formState.errors.agreedToTerms.message}</p>}
                  <div className="flex gap-2">
                    <button type="button" onClick={() => setCurrentStep(2)}
                      className="btn-secondary flex-1 flex items-center justify-center gap-2">
                      <ArrowLeft className="w-4 h-4" /> Back
                    </button>
                    <button type="submit" disabled={submitting}
                      className="btn-primary flex-1 flex items-center justify-center gap-2">
                      {submitting ? <><Loader2 className="w-4 h-4 animate-spin" /> Submitting...</> : <>Submit Application <ArrowRight className="w-4 h-4" /></>}
                    </button>
                  </div>
                </form>
              </motion.div>
            )}

            {/* Step 4: Success */}
            {currentStep === 4 && (
              <motion.div key="step4" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                className="text-center py-8">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 200, damping: 15 }}
                  className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-6"
                >
                  <CheckCircle className="w-10 h-10 text-green-400" />
                </motion.div>
                <h2 className="text-2xl font-bold text-white mb-3">Application Submitted! 🎉</h2>
                <p className="text-gray-400 mb-6 leading-relaxed">
                  Your application is under review. Our team will review your profile and writing sample within 24–48 hours.
                  You'll receive an email when you're approved.
                </p>
                <div className="glass-card p-4 text-left mb-6">
                  <h3 className="text-sm font-semibold text-white mb-2">What happens next:</h3>
                  <ul className="space-y-2 text-sm text-gray-400">
                    <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-400 shrink-0" /> Profile review by our team</li>
                    <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-400 shrink-0" /> Writing sample evaluation</li>
                    <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-400 shrink-0" /> Approval notification via email</li>
                    <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-400 shrink-0" /> Start accepting orders immediately</li>
                  </ul>
                </div>
                <div className="flex gap-3">
                  <Link href="/login" className="btn-primary flex-1 flex items-center justify-center gap-2">
                    Go to Dashboard <ArrowRight className="w-4 h-4" />
                  </Link>
                  <Link href="/" className="btn-secondary flex-1 text-center">Back to Home</Link>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
