import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/shared/Providers";
import { SupportChat } from "@/components/shared/SupportChat";
import { Toaster } from "react-hot-toast";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "https://writeprof.com"),
  title: {
    default: "WriteProf — Emergency Writing Marketplace | Deadline Savers",
    template: "%s | WriteProf",
  },
  description:
    "Submit urgent writing tasks and get them completed by professional writers within 1–24 hours. Essays, research papers, copywriting, and more. Emergency delivery available.",
  keywords: [
    "emergency writing service",
    "urgent essay writing",
    "professional writing marketplace",
    "fast academic writing",
    "deadline writing help",
    "research paper writing",
    "urgent copywriting",
    "WriteProf",
  ],
  authors: [{ name: "WriteProf Team" }],
  creator: "WriteProf",
  publisher: "WriteProf",
  formatDetection: { email: false, address: false, telephone: false },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://writeprof.com",
    siteName: "WriteProf",
    title: "WriteProf — Emergency Writing Marketplace",
    description: "Get urgent writing tasks completed by professionals in 1–24 hours.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "WriteProf — Emergency Writing Marketplace",
      },
    ],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon.svg", type: "image/svg+xml" },
    ],
    apple: "/apple-touch-icon.png",
  },
  manifest: "/manifest.json",
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#0ea5e9" },
    { media: "(prefers-color-scheme: dark)", color: "#020817" },
  ],
  width: "device-width",
  initialScale: 1,
};

const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "WriteProf",
  url: "https://writeprof.com",
  logo: "https://writeprof.com/logo.png",
  description: "Emergency writing marketplace connecting clients with professional writers.",
  contactPoint: {
    "@type": "ContactPoint",
    email: "oriaventures@gmail.com",
    contactType: "customer service",
    availableLanguage: "English",
  },
};

const websiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "WriteProf",
  url: "https://writeprof.com",
  potentialAction: {
    "@type": "SearchAction",
    target: "https://writeprof.com/search?q={search_term_string}",
    "query-input": "required name=search_term_string",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
        />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
      </head>
      <body className="min-h-screen bg-[#020817] antialiased">
        <Providers>{children}</Providers>
        <SupportChat />
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: "#1e293b",
              color: "#e2e8f0",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: "12px",
              boxShadow: "0 20px 40px rgba(0,0,0,0.4)",
              fontSize: "14px",
            },
            success: {
              iconTheme: { primary: "#22c55e", secondary: "#1e293b" },
            },
            error: {
              iconTheme: { primary: "#ef4444", secondary: "#1e293b" },
            },
          }}
        />
      </body>
    </html>
  );
}
