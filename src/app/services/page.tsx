import { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/shared/Navbar";
import { Footer } from "@/components/shared/Footer";
import {
  Zap, GraduationCap, FlaskConical, BookOpen, PenTool,
  Briefcase, Globe, FileText, Megaphone, Mail, Presentation,
  UserCheck, BarChart2, Microscope, BookMarked, ArrowRight,
  Clock, Shield, Star,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Emergency Writing Services — Essays, Research Papers & More | WriteProf",
  description:
    "All writing delivered as rush orders — 1hr, 3hr, 6hr, 12hr or 24hr. Essays, dissertations, copywriting, research papers, proofreading and more. Starting at $15/page.",
  alternates: { canonical: "https://writeprof.com/services" },
  keywords: [
    "emergency essay writing", "rush research paper", "urgent dissertation help",
    "same day essay writer", "1 hour writing service", "copywriting service",
    "proofreading service", "academic writing help", "business writing service",
  ],
  openGraph: {
    title: "Emergency Writing Services — WriteProf",
    description: "Every type of writing, delivered as a rush order. Starting at $15/page.",
    url: "https://writeprof.com/services",
    type: "website",
  },
};

const services = [
  {
    icon: GraduationCap,
    name: "Essay Writing",
    color: "from-brand-600 to-brand-400",
    shadow: "shadow-brand-500/20",
    description:
      "Argumentative, analytical, reflective, descriptive — any essay type, any subject. Structured, well-sourced, and tailored to your exact prompt.",
    includes: ["Argumentative essays", "Analytical essays", "Reflective essays", "Compare & contrast", "Narrative essays"],
    turnaround: "From 1 hour",
    price: "From $15/page",
  },
  {
    icon: FlaskConical,
    name: "Research Papers",
    color: "from-cyan-600 to-cyan-400",
    shadow: "shadow-cyan-500/20",
    description:
      "Fully cited, peer-reviewed papers written by subject-matter experts. APA, MLA, Chicago, Harvard — every citation style covered.",
    includes: ["Literature reviews", "Empirical papers", "Term papers", "Scientific reports", "Annotated bibliographies"],
    turnaround: "From 3 hours",
    price: "From $26/page",
  },
  {
    icon: BookMarked,
    name: "Dissertations & Theses",
    color: "from-violet-600 to-violet-400",
    shadow: "shadow-violet-500/20",
    description:
      "Chapter-by-chapter dissertation support or full thesis writing. Masters and PhD-level writers who understand methodology and academic rigour.",
    includes: ["Full dissertations", "Individual chapters", "Proposals & abstracts", "Literature reviews", "Data analysis sections"],
    turnaround: "From 6 hours",
    price: "From $37/page",
  },
  {
    icon: FileText,
    name: "Proofreading & Editing",
    color: "from-teal-600 to-teal-400",
    shadow: "shadow-teal-500/20",
    description:
      "Grammar, clarity, flow, and academic tone — all polished. Your ideas, perfected. Turnaround as fast as 1 hour for shorter documents.",
    includes: ["Grammar & spelling", "Clarity & flow", "Citation formatting", "Structure review", "Plagiarism check"],
    turnaround: "From 1 hour",
    price: "From $8/page",
  },
  {
    icon: Megaphone,
    name: "Copywriting",
    color: "from-pink-600 to-pink-400",
    shadow: "shadow-pink-500/20",
    description:
      "Conversion-focused copy by specialists who understand both language and psychology. From landing pages to email sequences.",
    includes: ["Landing page copy", "Ad copy (Google, Meta)", "Email campaigns", "Product descriptions", "Sales pages"],
    turnaround: "From 1 hour",
    price: "From $20/page",
  },
  {
    icon: Globe,
    name: "Blog & SEO Content",
    color: "from-green-600 to-green-400",
    shadow: "shadow-green-500/20",
    description:
      "Keyword-targeted blog posts and articles written by professional content writers. Optimised for search and built to rank.",
    includes: ["Blog posts", "SEO articles", "Pillar pages", "How-to guides", "Listicles"],
    turnaround: "From 3 hours",
    price: "From $15/page",
  },
  {
    icon: Briefcase,
    name: "Business Writing",
    color: "from-amber-600 to-amber-400",
    shadow: "shadow-amber-500/20",
    description:
      "Professional business documents that communicate with clarity and authority. From internal memos to investor decks.",
    includes: ["Business proposals", "Executive summaries", "Business plans", "Reports & memos", "White papers"],
    turnaround: "From 2 hours",
    price: "From $26/page",
  },
  {
    icon: BarChart2,
    name: "Case Studies",
    color: "from-orange-600 to-orange-400",
    shadow: "shadow-orange-500/20",
    description:
      "Academic and business case studies with structured analysis, frameworks (SWOT, Porter's 5 Forces), and actionable conclusions.",
    includes: ["Academic case studies", "Business case studies", "SWOT & PESTLE", "Market analysis", "Industry reports"],
    turnaround: "From 3 hours",
    price: "From $26/page",
  },
  {
    icon: Microscope,
    name: "Lab Reports & STEM",
    color: "from-sky-600 to-sky-400",
    shadow: "shadow-sky-500/20",
    description:
      "Science, engineering, and technical writing by STEM specialists. Lab reports, calculations, and technical documentation done right.",
    includes: ["Lab reports", "Technical reports", "Engineering write-ups", "Data analysis", "Mathematical proofs"],
    turnaround: "From 3 hours",
    price: "From $37/page",
  },
  {
    icon: Presentation,
    name: "Presentations & Slides",
    color: "from-rose-600 to-rose-400",
    shadow: "shadow-rose-500/20",
    description:
      "Compelling slide decks and speaker notes for academic defences, business pitches, and conference presentations.",
    includes: ["PowerPoint decks", "Speaker notes", "Pitch decks", "Academic defences", "Board presentations"],
    turnaround: "From 2 hours",
    price: "From $15/slide",
  },
  {
    icon: Mail,
    name: "Email & Communication",
    color: "from-indigo-600 to-indigo-400",
    shadow: "shadow-indigo-500/20",
    description:
      "Professional emails, newsletters, and business correspondence that get read and get responses.",
    includes: ["Cold email sequences", "Newsletter copy", "Business emails", "Follow-up sequences", "Outreach templates"],
    turnaround: "From 1 hour",
    price: "From $20/piece",
  },
  {
    icon: UserCheck,
    name: "CVs, Resumes & Cover Letters",
    color: "from-lime-600 to-lime-400",
    shadow: "shadow-lime-500/20",
    description:
      "ATS-optimised resumes and cover letters written by career coaches who know what hiring managers look for.",
    includes: ["CVs & resumes", "Cover letters", "LinkedIn profiles", "Personal statements", "Application essays"],
    turnaround: "From 2 hours",
    price: "From $49/document",
  },
];

const turnarounds = [
  { time: "1 Hour",  price: "$75/page", color: "text-red-400",    dot: "bg-red-400" },
  { time: "3 Hours", price: "$52/page", color: "text-orange-400", dot: "bg-orange-400" },
  { time: "6 Hours", price: "$37/page", color: "text-yellow-400", dot: "bg-yellow-400" },
  { time: "12 Hours",price: "$26/page", color: "text-green-400",  dot: "bg-green-400" },
  { time: "24 Hours",price: "$15/page", color: "text-brand-400",  dot: "bg-brand-400" },
];

export default function ServicesPage() {
  return (
    <div className="min-h-screen bg-[#020817]">
      {/* Background */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-[#020817]" />
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-brand-600/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-violet-600/8 rounded-full blur-3xl" />
      </div>

      <Navbar />

      {/* Hero */}
      <div className="pt-32 pb-16 px-4 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-semibold mb-5">
          <Zap className="w-4 h-4" />
          Emergency Writing — All Orders Are Rush Orders
        </div>
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white mb-5 leading-tight max-w-4xl mx-auto">
          Every Type of Writing,{" "}
          <span className="bg-gradient-to-r from-brand-400 to-violet-400 bg-clip-text text-transparent">
            Delivered in Hours
          </span>
        </h1>
        <p className="text-slate-400 text-xl max-w-2xl mx-auto mb-10">
          WriteProf is an emergency-only marketplace. Every single order — regardless of service — is a rush order.
          Choose your deadline: 1hr, 3hr, 6hr, 12hr, or 24hr.
        </p>

        {/* Turnaround pills */}
        <div className="flex flex-wrap justify-center gap-3 mb-10">
          {turnarounds.map((t) => (
            <div key={t.time} className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10">
              <span className={`w-2 h-2 rounded-full ${t.dot}`} />
              <span className="text-white text-sm font-semibold">{t.time}</span>
              <span className="text-slate-400 text-sm">{t.price}</span>
            </div>
          ))}
        </div>

        <Link href="/signup" className="btn-primary px-8 py-3.5 text-base inline-flex items-center gap-2 shadow-lg shadow-brand-500/30">
          <Zap className="w-5 h-5" />
          Place Your Order Now
        </Link>
      </div>

      {/* Trust bar */}
      <div className="border-y border-white/5 bg-white/[0.02] py-5 px-4">
        <div className="max-w-5xl mx-auto flex flex-wrap justify-center gap-8 text-sm text-slate-400">
          <span className="flex items-center gap-2"><Shield className="w-4 h-4 text-green-400" /> Escrow payments — pay only when satisfied</span>
          <span className="flex items-center gap-2"><Star className="w-4 h-4 text-yellow-400" /> PhD & Masters-level writers only</span>
          <span className="flex items-center gap-2"><Clock className="w-4 h-4 text-brand-400" /> Writers online 24 / 7</span>
          <span className="flex items-center gap-2"><Zap className="w-4 h-4 text-red-400" /> Full refund if deadline missed</span>
        </div>
      </div>

      {/* Services grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-14">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            All Services Under{" "}
            <span className="bg-gradient-to-r from-brand-400 to-violet-400 bg-clip-text text-transparent">
              Emergency Writing
            </span>
          </h2>
          <p className="text-slate-400 text-lg max-w-xl mx-auto">
            Pick your service and your deadline. A vetted writer starts immediately.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((svc) => (
            <Link
              key={svc.name}
              href={`/signup?service=${encodeURIComponent(svc.name)}`}
              className="glass-card p-6 hover:border-brand-500/30 transition-all duration-300 group flex flex-col"
            >
              {/* Icon */}
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${svc.color} p-0.5 mb-4 group-hover:shadow-lg ${svc.shadow} transition-all duration-300`}>
                <div className="w-full h-full bg-slate-900 rounded-xl flex items-center justify-center">
                  <svc.icon className="w-5 h-5 text-white" />
                </div>
              </div>

              <h3 className="text-white font-bold text-lg mb-2 group-hover:text-brand-300 transition-colors">
                {svc.name}
              </h3>
              <p className="text-slate-400 text-sm mb-4 leading-relaxed flex-1">
                {svc.description}
              </p>

              {/* Includes list */}
              <ul className="space-y-1 mb-4">
                {svc.includes.map((item) => (
                  <li key={item} className="text-xs text-slate-500 flex items-center gap-1.5">
                    <span className="w-1 h-1 rounded-full bg-brand-400 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>

              {/* Footer */}
              <div className="flex items-center justify-between pt-4 border-t border-white/5 mt-auto">
                <div>
                  <p className="text-xs text-slate-600">Starting at</p>
                  <p className="text-white font-semibold text-sm">{svc.price}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-slate-600">Turnaround</p>
                  <p className="text-brand-400 font-semibold text-sm">{svc.turnaround}</p>
                </div>
              </div>

              <div className="mt-3 flex items-center gap-1 text-brand-400 text-xs font-medium group-hover:gap-2 transition-all">
                Order now <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="bg-gradient-to-r from-brand-600/20 to-violet-600/10 border-t border-brand-500/20 py-16 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Don't see your exact service?
          </h2>
          <p className="text-slate-400 text-lg mb-8">
            Just describe what you need when placing your order — our writers handle anything written.
          </p>
          <Link href="/signup" className="btn-primary px-8 py-3.5 text-base inline-flex items-center gap-2">
            <Zap className="w-5 h-5" />
            Place an Order Now
          </Link>
        </div>
      </div>

      <Footer />
    </div>
  );
}
