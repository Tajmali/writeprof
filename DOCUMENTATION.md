# WriteProf — Complete Documentation

## Table of Contents
1. [Overview](#overview)
2. [Tech Stack](#tech-stack)
3. [Project Structure](#project-structure)
4. [Installation Guide](#installation-guide)
5. [Database Schema](#database-schema)
6. [API Documentation](#api-documentation)
7. [Authentication](#authentication)
8. [Payment System](#payment-system)
9. [Deployment](#deployment)
10. [Admin Guide](#admin-guide)
11. [Environment Variables](#environment-variables)

---

## Overview

WriteProf is a premium emergency writing marketplace where clients submit urgent writing tasks and professional writers complete them within 1–24 hours.

**Core Value Proposition:**
- Emergency writing delivery (1 hour minimum)
- Vetted professional writers (PhD, Masters, Published Authors)
- Secure escrow payments via Paystack
- Real-time order tracking and chat
- AI-powered writing assistance

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 15 (App Router), TypeScript |
| Styling | Tailwind CSS, Framer Motion |
| State | Zustand + React Query |
| Database | PostgreSQL (Supabase) + Prisma ORM |
| Auth | JWT (custom) + Google OAuth |
| Payments | Paystack |
| Storage | Cloudinary |
| AI | Anthropic Claude API |
| Email | Nodemailer (SMTP) |
| SMS/WhatsApp | Twilio |
| Deployment | Vercel (frontend) + Supabase (backend) |

---

## Project Structure

```
writeprof/
├── prisma/
│   ├── schema.prisma          # Database schema
│   └── seed.ts                # Sample data seeder
├── public/
│   ├── robots.txt
│   └── manifest.json
├── src/
│   ├── app/
│   │   ├── layout.tsx         # Root layout with providers
│   │   ├── page.tsx           # Homepage
│   │   ├── globals.css        # Global styles
│   │   ├── sitemap.ts         # SEO sitemap
│   │   ├── (auth)/            # Auth pages (login, signup, forgot)
│   │   ├── (client)/          # Client dashboard pages
│   │   ├── (writer)/          # Writer dashboard pages
│   │   ├── (admin)/           # Admin dashboard pages
│   │   ├── blog/              # Blog pages
│   │   └── api/               # API routes
│   │       ├── auth/          # Authentication endpoints
│   │       ├── orders/        # Order CRUD endpoints
│   │       ├── payments/      # Paystack payment endpoints
│   │       ├── writers/       # Writer-specific endpoints
│   │       ├── chat/          # Messaging endpoints
│   │       ├── notifications/ # Notification endpoints
│   │       ├── ai/            # AI assistant endpoints
│   │       └── admin/         # Admin-only endpoints
│   ├── components/
│   │   ├── homepage/          # Landing page sections
│   │   ├── dashboard/         # Shared dashboard components
│   │   ├── shared/            # Navbar, Footer, Providers
│   │   └── ui/                # Reusable UI components
│   ├── lib/
│   │   ├── prisma.ts          # Prisma client singleton
│   │   ├── supabase.ts        # Supabase client
│   │   ├── paystack.ts        # Paystack integration
│   │   ├── cloudinary.ts      # File upload integration
│   │   ├── auth.ts            # JWT auth utilities
│   │   ├── email.ts           # Email templates & sending
│   │   └── pricing.ts         # Pricing calculation logic
│   ├── store/
│   │   └── index.ts           # Zustand stores
│   ├── types/
│   │   └── index.ts           # TypeScript type definitions
│   └── middleware.ts          # Route protection middleware
```

---

## Installation Guide

### Prerequisites
- Node.js 18+ 
- npm or yarn
- PostgreSQL database (via Supabase)
- Paystack account
- Cloudinary account

### Step 1: Clone & Install

```bash
git clone https://github.com/your-org/writeprof.git
cd writeprof
npm install
```

### Step 2: Environment Setup

```bash
cp .env.example .env.local
# Edit .env.local with your credentials
```

### Step 3: Database Setup

```bash
# Generate Prisma client
npm run db:generate

# Push schema to database
npm run db:push

# Seed with sample data
npm run db:seed
```

### Step 4: Run Development Server

```bash
npm run dev
# Visit http://localhost:3000
```

---

## Database Schema

### Core Tables

**users** — All platform users (clients, writers, admins)
- `id`, `email`, `name`, `avatar`, `phone`, `role`, `passwordHash`, `referralCode`

**writer_profiles** — Extended writer information
- `rating`, `completedOrders`, `status` (AVAILABLE/BUSY/OFFLINE), `isApproved`, `specializations`

**orders** — Writing task orders
- `title`, `description`, `category`, `wordCount`, `urgency`, `deadline`, `status`
- `basePrice`, `urgencyPrice`, `emergencyFee`, `totalPrice`

**payments** — Payment records with escrow
- `paystackRef`, `status` (PENDING → ESCROW → RELEASED), `escrowAmount`, `writerAmount`

**messages** — Real-time order chat
- Per-order messaging between client and writer

**notifications** — User notification system
- Type-based notifications for order events, payments, etc.

**wallets** — User wallet balances
- `balance`, `totalEarned`, `totalSpent`

**transactions** — Financial transaction ledger

**blog_posts** — SEO blog content

**promo_codes** — Discount codes

---

## API Documentation

### Authentication Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/auth/signup` | Create account | No |
| POST | `/api/auth/login` | Login | No |
| POST | `/api/auth/logout` | Logout | Yes |
| GET | `/api/auth/me` | Get current user | Yes |
| POST | `/api/auth/forgot-password` | Send reset email | No |

### Order Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/orders` | List orders (role-filtered) | Yes |
| POST | `/api/orders` | Create order | Client |
| GET | `/api/orders/:id` | Get order details | Yes |
| PATCH | `/api/orders/:id` | Update order status | Yes |
| POST | `/api/orders/:id/accept` | Writer accepts order | Writer |

### Payment Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/payments/initialize` | Start Paystack payment | Client |
| GET | `/api/payments/verify` | Verify payment (callback) | No |
| POST | `/api/payments/withdraw` | Request payout | Writer |
| POST | `/api/payments/webhook` | Paystack webhook | No |

### Chat Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/chat?orderId=X` | Get messages | Yes |
| POST | `/api/chat` | Send message | Yes |

### AI Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/ai/assist` | AI writing assistance | Yes |

**AI Types:** `outline`, `grammar`, `paraphrase`, `citation`, `research`, `seo`

### Admin Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/admin/stats` | Platform statistics | Admin |
| GET | `/api/admin/users` | List all users | Admin |
| PATCH | `/api/admin/users/:id` | Ban/activate user | Admin |
| PATCH | `/api/admin/writers/:id/approve` | Approve writer | Admin |

---

## Authentication

WriteProf uses JWT-based authentication with cookies:

1. **Signup/Login** → JWT token generated → stored in `httpOnly` cookie
2. **Every request** → Middleware extracts token → verifies → injects user headers
3. **Role-based routing**: CLIENT → `/dashboard`, WRITER → `/writer-dashboard`, ADMIN → `/admin`

**Google OAuth** — Redirects to `/api/auth/google`, uses Supabase Google provider.

**Session Management** — Sessions stored in `sessions` table, expire after 7 days.

---

## Payment System

### Flow

```
Client Creates Order
      ↓
Initialize Paystack (POST /api/payments/initialize)
      ↓
Redirect to Paystack checkout
      ↓
Payment successful → Paystack redirects to /api/payments/verify
      ↓
Verify transaction → Update payment status to ESCROW
      ↓
Order assigned to writer → Writer completes work
      ↓
Client approves → Payment released to writer wallet
      ↓
Writer requests withdrawal → Transfer to bank account
```

### Commission Structure
- **Platform Commission**: 20% of order value
- **Writer Earnings**: 80% of order value
- **Emergency Fee**: ₦5,000 flat (goes to platform)

### Paystack Configuration
```
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=pk_live_...
PAYSTACK_SECRET_KEY=sk_live_...
```

---

## Pricing Logic

Base price = `(wordCount / 100) × academicLevelRate`

| Academic Level | Rate per 100 words |
|----------------|-------------------|
| High School | ₦800 |
| Undergraduate | ₦1,200 |
| Masters | ₦1,800 |
| PhD | ₦2,500 |
| Professional | ₦3,000 |

Urgency multipliers:
- 1 Hour: ×5.0
- 3 Hours: ×3.5
- 6 Hours: ×2.5
- 12 Hours: ×1.75
- 24 Hours: ×1.0 (base)

Emergency Mode adds ₦5,000 flat fee.

---

## Deployment

### Vercel Deployment

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod

# Set environment variables in Vercel dashboard
```

### Environment Variables (Production)

Set all variables from `.env.example` in your Vercel project settings:
- Database credentials (Supabase)
- Paystack live keys
- Cloudinary credentials
- SMTP email credentials
- Anthropic API key
- JWT secret (32+ characters)

### Supabase Database

1. Create project at supabase.com
2. Copy connection strings to `.env`
3. Run `npm run db:push` to create tables
4. Enable Row Level Security (optional)

---

## Admin Guide

### Default Admin Credentials (after seed)

> **⚠️ Development only.** These credentials are inserted by the seed script and are publicly known. Change them immediately before deploying to any non-local environment.

- Email: `admin@writeprof.com`
- Password: `Admin@WriteProf2026`

### Admin Capabilities
1. **User Management** — Ban/activate accounts, view user details
2. **Writer Approval** — Review and approve writer applications
3. **Order Monitoring** — View all orders, reassign writers, resolve disputes
4. **Payment Management** — Process payouts, issue refunds
5. **Analytics** — Revenue reports, order statistics, user growth
6. **Promo Codes** — Create and manage discount codes
7. **Blog Management** — Publish/unpublish blog posts
8. **System Settings** — Platform commission, fees, maintenance mode

### Platform Commission
Default: 20% (configurable in System Settings → `platform_commission`)

---

## SEO Configuration

- **Sitemap**: Auto-generated at `/sitemap.xml`
- **Robots.txt**: Configured at `/robots.txt`
- **Schema Markup**: Organization + WebSite schemas in `layout.tsx`
- **Open Graph**: Configured in each page's `metadata`
- **Structured Data**: Add product/service schema for service pages

---

## Security Features

- JWT tokens in `httpOnly` cookies (XSS protected)
- CSRF protection via `sameSite: lax`
- Rate limiting (add with `@upstash/ratelimit`)
- Input validation with Zod on all endpoints
- Prisma parameterized queries (SQL injection protected)
- Role-based middleware protection
- Paystack webhook signature verification
- Cloudinary signed upload params

---

## Sample Login Credentials

> **⚠️ Development only.** All passwords below are inserted by the seed script and are publicly known. Never use these accounts or passwords in staging or production.

After running `npm run db:seed`:

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@writeprof.com | Admin@WriteProf2026 |
| Writer | sarah@writeprof.com | Writer@2026 |
| Writer | james@writeprof.com | Writer@2026 |
| Client | chioma@example.com | Client@2026 |

---

## Promo Codes

After seeding:
- `WELCOME20` — 20% off first order
- `EMERGENCY50` — ₦5,000 off emergency fee
- `STUDENT10` — 10% off for students

---

*WriteProf v1.0.0 — Built with Next.js 15, Supabase, Prisma, Paystack*
