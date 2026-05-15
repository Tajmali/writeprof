"use client";

import { useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useDropzone } from "react-dropzone";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import toast from "react-hot-toast";
import {
  FileText, Upload, X, Clock, Zap, ChevronRight, ChevronLeft, CreditCard,
  CheckCircle, AlertCircle, Cloud, BookOpen, Shield
} from "lucide-react";

import { URGENCY_OPTIONS, WRITING_CATEGORIES, calculatePrice, formatPrice } from "@/lib/pricing";
import type { UrgencyLevel, AcademicLevel } from "@/types";

const orderSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters"),
  description: z.string().min(20, "Provide a detailed description (min 20 chars)"),
  instructions: z.string().optional(),
  category: z.string().min(1, "Please select a category"),
  academicLevel: z.enum(["HIGH_SCHOOL", "UNDERGRADUATE", "MASTERS", "PHD", "PROFESSIONAL"]),
  wordCount: z.number().min(100, "Minimum 100 words").max(50000, "Maximum 50,000 words"),
  urgency: z.enum(["ONE_HOUR", "THREE_HOURS", "SIX_HOURS", "TWELVE_HOURS", "TWENTY_FOUR_HOURS", "CUSTOM"]),
  isEmergency: z.boolean().default(false),
  promoCode: z.string().optional(),
});

type OrderForm = z.infer<typeof orderSchema>;

const ACADEMIC_LEVELS = [
  { value: "HIGH_SCHOOL", label: "High School" },
  { value: "UNDERGRADUATE", label: "Undergraduate" },
  { value: "MASTERS", label: "Masters" },
  { value: "PHD", label: "PhD" },
  { value: "PROFESSIONAL", label: "Professional" },
];

const STEPS = ["Order Details", "Urgency & Price", "Review & Pay"];

export default function NewOrderPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isEmergencyMode = searchParams.get("mode") === "emergency";

  const [step, setStep] = useState(0);
  const [files, setFiles] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [promoApplied, setPromoApplied] = useState(false);

  const {
    register, handleSubmit, watch, setValue, formState: { errors, isValid },
  } = useForm<OrderForm>({
    resolver: zodResolver(orderSchema),
    mode: "onChange",
    defaultValues: {
      urgency: isEmergencyMode ? "ONE_HOUR" : "TWENTY_FOUR_HOURS",
      academicLevel: "UNDERGRADUATE",
      wordCount: 1000,
      isEmergency: isEmergencyMode,
      category: searchParams.get("category") || "",
    },
  });

  const watchedValues = watch();
  const pricing = calculatePrice({
    wordCount: watchedValues.wordCount || 1000,
    urgency: watchedValues.urgency || "TWENTY_FOUR_HOURS",
    academicLevel: watchedValues.academicLevel || "UNDERGRADUATE",
    isEmergency: watchedValues.isEmergency || false,
  });

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setFiles((prev) => [...prev, ...acceptedFiles].slice(0, 10));
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    maxSize: 10 * 1024 * 1024, // 10MB
    accept: {
      "application/pdf": [".pdf"],
      "application/msword": [".doc"],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
      "text/plain": [".txt"],
      "image/*": [".jpg", ".jpeg", ".png"],
    },
  });

  const removeFile = (i: number) => setFiles((prev) => prev.filter((_, idx) => idx !== i));

  const onSubmit = async (data: OrderForm) => {
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const result = await res.json();

      if (!res.ok) throw new Error(result.error || "Failed to create order");

      const orderId = result.data.order.id;

      // Initialize payment
      const payRes = await fetch("/api/payments/initialize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, promoCode: data.promoCode }),
      });
      const payResult = await payRes.json();

      if (!payRes.ok) throw new Error(payResult.error || "Payment initialization failed");

      toast.success("Redirecting to payment...");
      window.location.href = payResult.data.authorizationUrl;
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to submit order");
      setIsSubmitting(false);
    }
  };

  const urgencyOption = URGENCY_OPTIONS.find((o) => o.value === watchedValues.urgency);

  return (
    <div className="p-6 lg:p-8 max-w-5xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-2xl lg:text-3xl font-bold text-white mb-1">
              {isEmergencyMode ? "⚡ Emergency Order" : "New Order"}
            </h1>
            <p className="text-slate-400 text-sm">Fill in the details below to get started.</p>
          </div>

          {/* Step indicator */}
          <div className="flex items-center gap-2 mb-8">
            {STEPS.map((s, i) => (
              <div key={s} className="flex items-center gap-2">
                <div className={`flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold transition-all ${
                  i < step ? "bg-green-500 text-white" :
                  i === step ? "bg-brand-500 text-white" :
                  "bg-white/10 text-slate-500"
                }`}>
                  {i < step ? <CheckCircle className="w-4 h-4" /> : i + 1}
                </div>
                <span className={`text-sm hidden sm:block ${i === step ? "text-white font-medium" : "text-slate-500"}`}>
                  {s}
                </span>
                {i < STEPS.length - 1 && (
                  <div className={`w-8 lg:w-16 h-0.5 mx-1 ${i < step ? "bg-green-500" : "bg-white/10"}`} />
                )}
              </div>
            ))}
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Form */}
            <div className="lg:col-span-2">
              <form id="order-form" onSubmit={handleSubmit(onSubmit)}>
                <AnimatePresence mode="wait">
                  {/* Step 1 — Order Details */}
                  {step === 0 && (
                    <motion.div
                      key="step1"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="glass-card p-6 space-y-5"
                    >
                      <h2 className="text-white font-semibold text-lg mb-2">Order Details</h2>

                      <div>
                        <label className="label">Order Title *</label>
                        <input {...register("title")} placeholder="e.g., Essay on Climate Change — 2000 words" className="input-field" />
                        {errors.title && <p className="text-red-400 text-xs mt-1">{errors.title.message}</p>}
                      </div>

                      <div>
                        <label className="label">Category *</label>
                        <select {...register("category")} className="input-field">
                          <option value="">Select category...</option>
                          {WRITING_CATEGORIES.map((cat) => (
                            <option key={cat} value={cat}>{cat}</option>
                          ))}
                        </select>
                        {errors.category && <p className="text-red-400 text-xs mt-1">{errors.category.message}</p>}
                      </div>

                      <div className="grid sm:grid-cols-2 gap-4">
                        <div>
                          <label className="label">Academic Level *</label>
                          <select {...register("academicLevel")} className="input-field">
                            {ACADEMIC_LEVELS.map((l) => (
                              <option key={l.value} value={l.value}>{l.label}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="label">Word Count *</label>
                          <input
                            {...register("wordCount", { valueAsNumber: true })}
                            type="number"
                            min="100"
                            max="50000"
                            step="100"
                            placeholder="1000"
                            className="input-field"
                          />
                          {errors.wordCount && <p className="text-red-400 text-xs mt-1">{errors.wordCount.message}</p>}
                        </div>
                      </div>

                      <div>
                        <label className="label">Description *</label>
                        <textarea
                          {...register("description")}
                          rows={4}
                          placeholder="Describe what you need written. Include topic, purpose, target audience, key points to cover..."
                          className="input-field resize-none"
                        />
                        {errors.description && <p className="text-red-400 text-xs mt-1">{errors.description.message}</p>}
                      </div>

                      <div>
                        <label className="label">Additional Instructions (optional)</label>
                        <textarea
                          {...register("instructions")}
                          rows={3}
                          placeholder="Citation style, formatting requirements, specific sources to use, etc."
                          className="input-field resize-none"
                        />
                      </div>

                      {/* File upload */}
                      <div>
                        <label className="label">Attach Files (optional)</label>
                        <div
                          {...getRootProps()}
                          className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all duration-200 ${
                            isDragActive
                              ? "border-brand-500 bg-brand-500/10"
                              : "border-white/10 hover:border-white/20 hover:bg-white/5"
                          }`}
                        >
                          <input {...getInputProps()} />
                          <Upload className="w-8 h-8 text-slate-500 mx-auto mb-2" />
                          <p className="text-slate-400 text-sm">
                            {isDragActive ? "Drop files here..." : "Drag & drop or click to upload"}
                          </p>
                          <p className="text-slate-600 text-xs mt-1">PDF, DOC, DOCX, TXT, Images · Max 10MB each</p>
                        </div>

                        {files.length > 0 && (
                          <div className="mt-3 space-y-2">
                            {files.map((file, i) => (
                              <div key={i} className="flex items-center gap-3 p-3 bg-white/5 rounded-lg">
                                <FileText className="w-4 h-4 text-brand-400 flex-shrink-0" />
                                <span className="text-white text-xs flex-1 truncate">{file.name}</span>
                                <span className="text-slate-600 text-xs">{(file.size / 1024).toFixed(0)}KB</span>
                                <button type="button" onClick={() => removeFile(i)} className="text-slate-600 hover:text-red-400 transition-colors">
                                  <X className="w-4 h-4" />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={() => setStep(1)}
                        disabled={!watchedValues.title || !watchedValues.category || !watchedValues.description}
                        className="btn-primary w-full"
                      >
                        Continue to Urgency <ChevronRight className="w-4 h-4" />
                      </button>
                    </motion.div>
                  )}

                  {/* Step 2 — Urgency */}
                  {step === 1 && (
                    <motion.div
                      key="step2"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-6"
                    >
                      <div className="glass-card p-6">
                        <h2 className="text-white font-semibold text-lg mb-4">Choose Urgency</h2>
                        <div className="space-y-3">
                          {URGENCY_OPTIONS.map((option) => {
                            const price = calculatePrice({
                              wordCount: watchedValues.wordCount || 1000,
                              urgency: option.value as UrgencyLevel,
                              academicLevel: watchedValues.academicLevel || "UNDERGRADUATE",
                              isEmergency: false,
                            });
                            const isSelected = watchedValues.urgency === option.value;
                            return (
                              <label
                                key={option.value}
                                className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                                  isSelected
                                    ? "border-brand-500 bg-brand-500/10"
                                    : "border-white/10 bg-white/5 hover:border-white/20"
                                }`}
                              >
                                <input
                                  {...register("urgency")}
                                  type="radio"
                                  value={option.value}
                                  className="sr-only"
                                />
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                                  isSelected ? "bg-brand-500/30" : "bg-white/5"
                                }`}>
                                  <Clock className={`w-5 h-5 ${isSelected ? "text-brand-400" : "text-slate-500"}`} />
                                </div>
                                <div className="flex-1">
                                  <div className="flex items-center gap-2">
                                    <span className="text-white font-medium text-sm">{option.label}</span>
                                    {option.badge && (
                                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                                        option.badge === "FASTEST" ? "bg-red-500/20 text-red-400" : "bg-orange-500/20 text-orange-400"
                                      }`}>
                                        {option.badge}
                                      </span>
                                    )}
                                  </div>
                                  <p className="text-slate-500 text-xs">×{option.multiplier} price multiplier</p>
                                </div>
                                <div className="text-right flex-shrink-0">
                                  <p className="text-white font-bold text-sm">{formatPrice(price.totalPrice)}</p>
                                  {option.value !== "TWENTY_FOUR_HOURS" && (
                                    <p className="text-slate-500 text-xs">
                                      +{formatPrice(price.urgencyPrice)} urgency
                                    </p>
                                  )}
                                </div>
                              </label>
                            );
                          })}
                        </div>
                      </div>

                      {/* Emergency Toggle */}
                      <div className={`glass-card p-6 ${watchedValues.isEmergency ? "border-emergency-500/30" : ""}`}>
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex items-start gap-3">
                            <Zap className={`w-6 h-6 mt-0.5 flex-shrink-0 ${watchedValues.isEmergency ? "text-emergency-400" : "text-slate-500"}`} />
                            <div>
                              <h3 className="text-white font-semibold">Emergency Mode</h3>
                              <p className="text-slate-400 text-sm mt-1">
                                Top-priority assignment, fastest writers, instant support.
                                Additional $50 activation fee.
                              </p>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => setValue("isEmergency", !watchedValues.isEmergency)}
                            className={`relative w-12 h-6 rounded-full transition-all duration-300 flex-shrink-0 ${
                              watchedValues.isEmergency ? "bg-emergency-500" : "bg-white/20"
                            }`}
                          >
                            <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-all duration-300 ${
                              watchedValues.isEmergency ? "left-6" : "left-0.5"
                            }`} />
                          </button>
                        </div>
                      </div>

                      <div className="flex gap-3">
                        <button type="button" onClick={() => setStep(0)} className="btn-secondary flex-1">
                          <ChevronLeft className="w-4 h-4" /> Back
                        </button>
                        <button type="button" onClick={() => setStep(2)} className="btn-primary flex-1">
                          Review Order <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    </motion.div>
                  )}

                  {/* Step 3 — Review */}
                  {step === 2 && (
                    <motion.div
                      key="step3"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-6"
                    >
                      <div className="glass-card p-6">
                        <h2 className="text-white font-semibold text-lg mb-4">Order Summary</h2>
                        <div className="space-y-3">
                          {[
                            { label: "Title", value: watchedValues.title },
                            { label: "Category", value: watchedValues.category },
                            { label: "Academic Level", value: watchedValues.academicLevel?.replace("_", " ") },
                            { label: "Word Count", value: `${(watchedValues.wordCount || 0).toLocaleString()} words` },
                            { label: "Urgency", value: URGENCY_OPTIONS.find((o) => o.value === watchedValues.urgency)?.label },
                            { label: "Emergency Mode", value: watchedValues.isEmergency ? "Yes (+$50)" : "No" },
                          ].map((row) => (
                            <div key={row.label} className="flex items-center justify-between py-2 border-b border-white/5">
                              <span className="text-slate-500 text-sm">{row.label}</span>
                              <span className="text-white text-sm font-medium">{row.value}</span>
                            </div>
                          ))}
                        </div>

                        {/* Promo code */}
                        <div className="mt-4">
                          <label className="label">Promo Code (optional)</label>
                          <div className="flex gap-2">
                            <input {...register("promoCode")} placeholder="Enter promo code" className="input-field flex-1" />
                            <button type="button" className="btn-secondary px-4">Apply</button>
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-3">
                        <button type="button" onClick={() => setStep(1)} className="btn-secondary flex-1">
                          <ChevronLeft className="w-4 h-4" /> Back
                        </button>
                        <button
                          type="submit"
                          form="order-form"
                          disabled={isSubmitting}
                          className="btn-primary flex-1"
                        >
                          {isSubmitting ? (
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          ) : (
                            <>
                              <CreditCard className="w-4 h-4" />
                              Pay {formatPrice(pricing.totalPrice)}
                            </>
                          )}
                        </button>
                      </div>

                      <div className="flex items-center justify-center gap-2 text-slate-600 text-xs">
                        <Shield className="w-3.5 h-3.5" />
                        Secured by Paystack · 256-bit SSL encryption
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </form>
            </div>

            {/* Price Summary */}
            <div>
              <div className="glass-card p-6 sticky top-6">
                <h3 className="text-white font-semibold mb-4">Price Summary</h3>
                <div className="space-y-3 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Base price</span>
                    <span className="text-white">{formatPrice(pricing.basePrice)}</span>
                  </div>
                  {pricing.urgencyPrice > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">Urgency premium</span>
                      <span className="text-orange-400">+{formatPrice(pricing.urgencyPrice)}</span>
                    </div>
                  )}
                  {pricing.emergencyFee > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">Emergency fee</span>
                      <span className="text-emergency-400">+{formatPrice(pricing.emergencyFee)}</span>
                    </div>
                  )}
                  <div className="pt-3 border-t border-white/10 flex justify-between">
                    <span className="text-white font-semibold">Total</span>
                    <span className="text-white font-bold text-lg">{formatPrice(pricing.totalPrice)}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  {[
                    "Held in secure escrow",
                    "Released on approval only",
                    "Full refund if deadline missed",
                  ].map((f) => (
                    <div key={f} className="flex items-center gap-2 text-xs text-slate-500">
                      <CheckCircle className="w-3.5 h-3.5 text-green-400 flex-shrink-0" />
                      {f}
                    </div>
                  ))}
                </div>

                {urgencyOption && (
                  <div className="mt-4 p-3 bg-brand-500/10 border border-brand-500/20 rounded-xl">
                    <p className="text-brand-400 text-xs font-semibold">
                      Deadline: ~{urgencyOption.label} after payment
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
    </div>
  );
}
