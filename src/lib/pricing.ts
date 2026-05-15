import type { UrgencyLevel, AcademicLevel, UrgencyOption, PricingCalculation } from "@/types";

// ─── Pricing constants ───────────────────────────────────────────────────────
// 1 standard academic page = 275 words (double-spaced, 12pt)
export const WORDS_PER_PAGE = 275;

// Base rate: $15 per page (academic level component)
export const BASE_PRICE_PER_PAGE = 15;

// Urgency rate: up to $25 per page additional (scaled by urgency tier)
export const URGENCY_PRICE_PER_PAGE = 25;

// Flat emergency-delivery fee on top of urgency
export const EMERGENCY_FEE = 50;

// Platform commission retained from the total order value
export const PLATFORM_COMMISSION = 0.2;

// Legacy aliases kept so existing API routes don't break
export const BASE_PRICE_PER_100_WORDS = Math.round((BASE_PRICE_PER_PAGE / WORDS_PER_PAGE) * 100);

// ─── Urgency options ─────────────────────────────────────────────────────────
// `multiplier` = fraction of URGENCY_PRICE_PER_PAGE applied as the surcharge.
//   ONE_HOUR  → 1.00 → full $25/page surcharge
//   ...
//   24 HOURS  → 0.00 → no urgency surcharge (just the $15/page base)
export const URGENCY_OPTIONS: UrgencyOption[] = [
  { value: "ONE_HOUR",          label: "1 Hour",   hours: 1,  multiplier: 1.00, badge: "FASTEST" },
  { value: "THREE_HOURS",       label: "3 Hours",  hours: 3,  multiplier: 0.80, badge: "URGENT"  },
  { value: "SIX_HOURS",         label: "6 Hours",  hours: 6,  multiplier: 0.60 },
  { value: "TWELVE_HOURS",      label: "12 Hours", hours: 12, multiplier: 0.40 },
  { value: "TWENTY_FOUR_HOURS", label: "24 Hours", hours: 24, multiplier: 0.00 },
  { value: "CUSTOM",            label: "Custom",   hours: 0,  multiplier: 0.50 },
];

// ─── Academic level adjustments ──────────────────────────────────────────────
// The base of $15/page is the same for all levels; these are kept for display
// reference only (could be used for level-specific add-ons in future).
export const ACADEMIC_LEVEL_PRICES: Record<AcademicLevel, number> = {
  HIGH_SCHOOL:   BASE_PRICE_PER_PAGE,       // $15/page
  UNDERGRADUATE: BASE_PRICE_PER_PAGE,       // $15/page
  MASTERS:       BASE_PRICE_PER_PAGE,       // $15/page
  PHD:           BASE_PRICE_PER_PAGE,       // $15/page
  PROFESSIONAL:  BASE_PRICE_PER_PAGE,       // $15/page
};

// ─── Writing categories ───────────────────────────────────────────────────────
export const WRITING_CATEGORIES = [
  "Essay Writing",
  "Research Paper",
  "Thesis/Dissertation",
  "Case Study",
  "Business Report",
  "Creative Writing",
  "Blog Content",
  "Copywriting",
  "Technical Writing",
  "Literature Review",
  "Lab Report",
  "Proofreading & Editing",
  "Academic Assignment",
  "Cover Letter & Resume",
  "Grant Proposal",
  "Speech Writing",
  "Screenplay",
  "SEO Content",
];

// ─── Price calculation ────────────────────────────────────────────────────────
/**
 * Calculates order price:
 *   basePrice    = pages × $15           (academic level component)
 *   urgencyPrice = pages × $25 × urgencyFraction  (speed surcharge)
 *   emergencyFee = $50 flat              (same-day emergency flag)
 *   totalPrice   = base + urgency + emergency
 */
export function calculatePrice(params: {
  wordCount: number;
  urgency: UrgencyLevel;
  academicLevel: AcademicLevel;
  isEmergency: boolean;
}): PricingCalculation {
  const { wordCount, urgency, isEmergency } = params;

  const pages = Math.max(1, Math.ceil(wordCount / WORDS_PER_PAGE));

  const basePrice = pages * BASE_PRICE_PER_PAGE;

  const urgencyOption = URGENCY_OPTIONS.find((o) => o.value === urgency);
  const urgencyFraction = urgencyOption?.multiplier ?? 0;
  const urgencyPrice = pages * URGENCY_PRICE_PER_PAGE * urgencyFraction;

  const emergencyFee = isEmergency ? EMERGENCY_FEE : 0;
  const totalPrice = basePrice + urgencyPrice + emergencyFee;

  return {
    basePrice: Math.round(basePrice * 100) / 100,
    urgencyPrice: Math.round(urgencyPrice * 100) / 100,
    emergencyFee,
    totalPrice: Math.round(totalPrice * 100) / 100,
    currency: "USD",
  };
}

// ─── Helpers ─────────────────────────────────────────────────────────────────
export function getUrgencyDeadline(urgency: UrgencyLevel): Date {
  const now = new Date();
  const option = URGENCY_OPTIONS.find((o) => o.value === urgency);
  if (!option || option.hours === 0) return now;
  return new Date(now.getTime() + option.hours * 60 * 60 * 1000);
}

/** Returns a human-readable price string, e.g. "$120" */
export function formatPrice(amount: number, currency = "USD"): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}

/** Returns pages from a word count (1 page = 275 words) */
export function wordsToPages(wordCount: number): number {
  return Math.max(1, Math.ceil(wordCount / WORDS_PER_PAGE));
}

export function getTimeRemaining(deadline: string | Date): {
  hours: number;
  minutes: number;
  seconds: number;
  isExpired: boolean;
  isUrgent: boolean;
  percentage: number;
  label: string;
} {
  const now = new Date().getTime();
  const target = new Date(deadline).getTime();
  const diff = target - now;

  if (diff <= 0) {
    return { hours: 0, minutes: 0, seconds: 0, isExpired: true, isUrgent: false, percentage: 100, label: "Expired" };
  }

  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);
  const isUrgent = hours < 3;

  const totalDuration = 24 * 60 * 60 * 1000;
  const elapsed = totalDuration - diff;
  const percentage = Math.min(100, (elapsed / totalDuration) * 100);

  const label = hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m ${seconds}s`;

  return { hours, minutes, seconds, isExpired: false, isUrgent, percentage, label };
}
