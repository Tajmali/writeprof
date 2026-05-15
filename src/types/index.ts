// Core shared types for the WriteProf platform

export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string | null;
  role: "CLIENT" | "WRITER" | "ADMIN";
  emailVerified: boolean;
  isActive: boolean;
  isBanned: boolean;
  phone?: string | null;
  referralCode?: string;
  createdAt: string;
  // Included when fetched from /api/auth/me
  writerProfile?: WriterProfile | null;
  wallet?: Wallet | null;
}

export interface WriterProfile {
  id: string;
  userId: string;
  bio: string | null;
  specialization: string | null;
  specializations: string[];
  education: string | null;
  experience: number;
  languages: string[];
  status: "AVAILABLE" | "BUSY" | "OFFLINE";
  isApproved: boolean;
  isVerified: boolean;
  averageRating: number;
  rating: number;
  totalReviews: number;
  totalOrders: number;
  completedOrders: number;
  currentOrdersCount: number;
  onTimeDelivery: number;
  performanceScore: number;
  portfolioUrl: string | null;
  joinedAt: string;
  lastActiveAt: string;
  user: User;
}

export interface OrderFile {
  id: string;
  name: string;
  url: string;
  size: number;
  mimeType: string;
  uploadedAt: string;
}

export interface Submission {
  id: string;
  content: string | null;
  fileUrl: string | null;
  fileName: string | null;
  notes: string | null;
  submittedAt: string;
  isRevision: boolean;
  version: number;
}

export interface Message {
  id: string;
  content: string;
  senderId: string;
  sender: {
    id: string;
    name: string;
    avatar: string | null;
  };
  fileUrl: string | null;
  fileName: string | null;
  isRead: boolean;
  createdAt: string;
}

export interface Payment {
  id: string;
  amount: number;
  commissionAmount: number;
  writerAmount: number;
  status: "PENDING" | "PAID" | "ESCROW" | "RELEASED" | "REFUNDED" | "FAILED";
  reference: string;
  paidAt: string | null;
  releasedAt: string | null;
  createdAt: string;
}

export interface Review {
  id: string;
  rating: number;
  comment: string;
  createdAt: string;
  authorId: string;
  targetId: string;
  orderId: string;
  author: { id: string; name: string; avatar: string | null };
}

export interface Order {
  id: string;
  orderNumber: string;
  title: string;
  description: string;
  instructions: string | null;
  category: string;
  academicLevel: string;
  wordCount: number;
  urgency: string;
  deadline: string;
  status: string;
  isEmergency: boolean;
  basePrice: number;
  urgencyPrice: number;
  emergencyFee: number;
  totalPrice: number;
  currency: string;
  revisionCount: number;
  maxRevisions: number;
  createdAt: string;
  updatedAt: string;
  completedAt: string | null;
  assignedAt: string | null;
  clientId: string;
  writerId: string | null;
  client: {
    id: string;
    name: string;
    email: string;
    avatar: string | null;
  };
  writer: {
    id: string;
    averageRating: number;
    rating: number;
    totalReviews: number;
    completedOrders: number;
    specialization: string | null;
    user: {
      id: string;
      name: string;
      avatar: string | null;
      email: string;
    };
  } | null;
  attachments: OrderFile[];
  submissions: Submission[];
  messages: Message[];
  payment: Payment | null;
  reviews: Review[];
  _count?: {
    messages: number;
    submissions: number;
  };
}

export interface Wallet {
  id: string;
  userId: string;
  balance: number;
  totalEarned: number;
  totalSpent: number;
  currency: string;
}

export interface Transaction {
  id: string;
  userId: string;
  type: "PAYMENT" | "PAYOUT" | "REFUND" | "COMMISSION" | "DEPOSIT" | "WITHDRAWAL";
  amount: number;
  currency: string;
  description: string;
  reference: string | null;
  status: "PENDING" | "PAID" | "ESCROW" | "RELEASED" | "REFUNDED" | "FAILED";
  createdAt: string;
  user: { name: string; email: string };
}

export interface Notification {
  id: string;
  userId: string;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  orderId: string | null;
  createdAt: string;
}

export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  coverImage: string | null;
  category: string;
  tags: string[];
  author: string;
  authorImage: string | null;
  isPublished: boolean;
  views: number;
  readTime: number;
  createdAt: string;
  updatedAt: string;
}

export interface PromoCode {
  id: string;
  code: string;
  discount: number;
  isPercent: boolean;
  maxUses: number;
  usedCount: number;
  expiresAt: string | null;
  isActive: boolean;
}

// Pricing types (used by lib/pricing.ts)
export type UrgencyLevel = "ONE_HOUR" | "THREE_HOURS" | "SIX_HOURS" | "TWELVE_HOURS" | "TWENTY_FOUR_HOURS" | "CUSTOM";
export type AcademicLevel = "HIGH_SCHOOL" | "UNDERGRADUATE" | "MASTERS" | "PHD" | "PROFESSIONAL";

export interface UrgencyOption {
  value: UrgencyLevel;
  label: string;
  hours: number;
  multiplier: number;
  badge?: string;
}

export interface PricingCalculation {
  basePrice: number;
  urgencyPrice: number;
  emergencyFee: number;
  totalPrice: number;
  currency: string;
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
