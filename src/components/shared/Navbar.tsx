"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Zap, ChevronDown } from "lucide-react";
import { useAuthStore } from "@/store";
import { Logo } from "@/components/shared/Logo";

const navLinks = [
  { label: "How It Works", href: "/#how-it-works", sectionId: "how-it-works" },
  { label: "Services",     href: "/#categories",   sectionId: "categories" },
  { label: "Pricing",      href: "/#pricing",       sectionId: "pricing" },
  { label: "Writers",      href: "/#writers",       sectionId: "writers" },
  {
    label: "Resources",
    href: "#",
    children: [
      { label: "Blog",     href: "/blog" },
      { label: "FAQ",      href: "/#faq", sectionId: "faq" },
      { label: "About Us", href: "/about" },
    ],
  },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const { user } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleSectionClick = (e: React.MouseEvent, sectionId?: string) => {
    if (!sectionId) return;
    e.preventDefault();
    setMobileOpen(false);
    if (pathname === "/") {
      // Already on homepage — just smooth scroll
      document.getElementById(sectionId)?.scrollIntoView({ behavior: "smooth", block: "start" });
    } else {
      // Navigate to homepage then scroll after load
      router.push(`/#${sectionId}`);
    }
  };

  return (
    <motion.header
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? "bg-[#020817]/95 backdrop-blur-xl border-b border-white/10 shadow-2xl shadow-brand-900/20"
          : "bg-gradient-to-b from-[#020817]/80 via-[#020817]/40 to-transparent backdrop-blur-sm border-b border-white/5"
      }`}
    >
      {/* Glow accent line */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-brand-500/50 to-transparent" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <Logo href="/" size={36} showText />

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) =>
              link.children ? (
                <div key={link.label} className="relative">
                  <button
                    className="flex items-center gap-1 px-4 py-2 text-slate-300 hover:text-white rounded-lg hover:bg-white/5 transition-all duration-200 text-sm font-medium"
                    onMouseEnter={() => setOpenDropdown(link.label)}
                    onMouseLeave={() => setOpenDropdown(null)}
                  >
                    {link.label}
                    <ChevronDown className={`w-3.5 h-3.5 transition-transform ${openDropdown === link.label ? "rotate-180" : ""}`} />
                  </button>
                  <AnimatePresence>
                    {openDropdown === link.label && (
                      <motion.div
                        initial={{ opacity: 0, y: 8, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 8, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className="absolute top-full left-0 mt-1 w-48 glass rounded-xl overflow-hidden shadow-2xl"
                        onMouseEnter={() => setOpenDropdown(link.label)}
                        onMouseLeave={() => setOpenDropdown(null)}
                      >
                        {link.children.map((child) => (
                          <Link
                            key={child.label}
                            href={child.href}
                            onClick={(e) => handleSectionClick(e, (child as any).sectionId)}
                            className="block px-4 py-2.5 text-sm text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
                          >
                            {child.label}
                          </Link>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <Link
                  key={link.label}
                  href={link.href}
                  onClick={(e) => handleSectionClick(e, link.sectionId)}
                  className="px-4 py-2 text-slate-300 hover:text-white rounded-lg hover:bg-white/5 transition-all duration-200 text-sm font-medium"
                >
                  {link.label}
                </Link>
              )
            )}
          </nav>

          {/* Desktop CTA */}
          <div className="hidden lg:flex items-center gap-3">
            {user ? (
              <Link
                href={
                  user.role === "WRITER"
                    ? "/writer-dashboard"
                    : user.role === "ADMIN"
                    ? "/admin"
                    : "/dashboard"
                }
                className="btn-primary text-sm px-5 py-2.5"
              >
                Dashboard
              </Link>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-sm font-medium text-slate-300 hover:text-white transition-colors px-4 py-2"
                >
                  Sign In
                </Link>
                <Link href="/signup" className="btn-primary text-sm px-5 py-2.5 shadow-lg shadow-brand-500/30 hover:shadow-brand-500/50 transition-shadow duration-300">
                  <Zap className="w-4 h-4" />
                  Get Started Free
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            className="lg:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-all"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden border-t border-white/10 bg-[#020817]/98 backdrop-blur-xl overflow-hidden"
          >
            <div className="px-4 py-4 space-y-1">
              {navLinks.map((link) => (
                <div key={link.label}>
                  <Link
                    href={link.href}
                    className="block px-4 py-2.5 text-slate-300 hover:text-white hover:bg-white/5 rounded-lg transition-all text-sm font-medium"
                    onClick={(e) => { handleSectionClick(e, link.sectionId); setMobileOpen(false); }}
                  >
                    {link.label}
                  </Link>
                  {link.children?.map((child) => (
                    <Link
                      key={child.label}
                      href={child.href}
                      className="block pl-8 pr-4 py-2 text-slate-400 hover:text-white hover:bg-white/5 rounded-lg transition-all text-sm"
                      onClick={(e) => { handleSectionClick(e, (child as any).sectionId); setMobileOpen(false); }}
                    >
                      {child.label}
                    </Link>
                  ))}
                </div>
              ))}
              <div className="pt-3 pb-1 border-t border-white/10 flex flex-col gap-2">
                <Link
                  href="/login"
                  className="btn-secondary text-sm justify-center"
                  onClick={() => setMobileOpen(false)}
                >
                  Sign In
                </Link>
                <Link
                  href="/signup"
                  className="btn-primary text-sm justify-center"
                  onClick={() => setMobileOpen(false)}
                >
                  <Zap className="w-4 h-4" />
                  Get Started Free
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
