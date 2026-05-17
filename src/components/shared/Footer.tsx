import Link from "next/link";
import { Zap, Mail, MapPin } from "lucide-react";

const footerLinks = {
  Services: [
    { label: "Essay Writing", href: "/services/essay" },
    { label: "Research Papers", href: "/services/research" },
    { label: "Copywriting", href: "/services/copywriting" },
    { label: "Proofreading", href: "/services/proofreading" },
    { label: "Dissertation Help", href: "/services/dissertation" },
    { label: "Emergency Writing", href: "/emergency" },
  ],
  Company: [
    { label: "About Us", href: "/about" },
    { label: "Blog", href: "/blog" },
    { label: "Careers", href: "/careers" },
    { label: "Press", href: "/press" },
    { label: "Affiliate Program", href: "/affiliate" },
    { label: "Partner With Us", href: "/partners" },
  ],
  "For Writers": [
    { label: "Become a Writer", href: "/writer/apply" },
    { label: "Writer Dashboard", href: "/writer-dashboard" },
    { label: "Writer Guidelines", href: "/writer-guidelines" },
    { label: "Payment Schedule", href: "/writer/payments" },
    { label: "Writer Community", href: "/writer/community" },
  ],
  Support: [
    { label: "Help Center", href: "/help" },
    { label: "Contact Us", href: "/contact" },
    { label: "Live Chat", href: "/contact" },
    { label: "Refund Policy", href: "/refund" },
    { label: "Privacy Policy", href: "/privacy" },
    { label: "Terms of Service", href: "/terms" },
  ],
};


export function Footer() {
  return (
    <footer className="border-t border-white/5 bg-black/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main footer */}
        <div className="py-16 grid grid-cols-2 lg:grid-cols-6 gap-8">
          {/* Brand column */}
          <div className="col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-4 group">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-600 to-brand-400 flex items-center justify-center">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-white">
                Write<span className="gradient-text">Prof</span>
              </span>
            </Link>
            <p className="text-slate-500 text-sm leading-relaxed mb-6 max-w-xs">
              The world's most trusted emergency writing marketplace. Get professional writing done
              in hours, not days.
            </p>

            {/* Contact */}
            <div className="space-y-2.5">
              <a href="mailto:oriaventures@gmail.com" className="flex items-center gap-2.5 text-slate-500 hover:text-slate-300 transition-colors text-sm">
                <Mail className="w-4 h-4" />
                oriaventures@gmail.com
              </a>
              <div className="flex items-center gap-2.5 text-slate-500 text-sm">
                <MapPin className="w-4 h-4" />
                Palo Alto, United States
              </div>
            </div>

          </div>

          {/* Link columns */}
          {Object.entries(footerLinks).map(([section, links]) => (
            <div key={section}>
              <h3 className="text-white font-semibold text-sm mb-4">{section}</h3>
              <ul className="space-y-2.5">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-slate-500 hover:text-slate-300 text-sm transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="py-6 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-slate-600 text-sm">
            © {new Date().getFullYear()} WriteProf. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-slate-600 text-xs">
              <div className="w-4 h-4 rounded bg-green-500/20 border border-green-500/30 flex items-center justify-center">
                <div className="w-1.5 h-1.5 bg-green-400 rounded-full" />
              </div>
              All systems operational
            </div>
            <span className="text-slate-700">·</span>
            <span className="text-slate-600 text-xs">SSL Secured</span>
            <span className="text-slate-700">·</span>
            <span className="text-slate-600 text-xs">PCI Compliant</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
