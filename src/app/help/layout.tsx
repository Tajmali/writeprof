import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Help Center",
  description: "Answers to common questions about placing rush orders, payments, writer quality, revisions, and refunds on WriteProf.",
  alternates: { canonical: "https://writeprof.com/help" },
  keywords: ["writing service FAQ", "how to place order", "refund policy", "revision policy", "emergency writing help"],
  openGraph: {
    title: "WriteProf Help Center — FAQs & Support",
    description: "Everything you need to know about rush orders, payments, writers, and refunds on WriteProf.",
    url: "https://writeprof.com/help",
    type: "website",
  },
};

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "How do I place an order?",
      acceptedAnswer: { "@type": "Answer", text: "Sign in to your client dashboard, click 'New Order', fill in your task details (topic, word count, deadline, instructions), and complete payment. Your order goes live immediately and writers start bidding within minutes." },
    },
    {
      "@type": "Question",
      name: "What deadlines are available?",
      acceptedAnswer: { "@type": "Answer", text: "WriteProf is built for rush orders. You can choose from 1 hour, 3 hours, 6 hours, 12 hours, or 24 hours. The tighter your deadline, the higher the urgency surcharge — but writers start on your order immediately." },
    },
    {
      "@type": "Question",
      name: "How is pricing calculated?",
      acceptedAnswer: { "@type": "Answer", text: "Pricing is based on word count and urgency. Base rate is $15 per page (275 words). Urgency multipliers apply: 1hr (×5.0), 3hr (×3.5), 6hr (×2.5), 12hr (×1.75), 24hr (×1.0)." },
    },
    {
      "@type": "Question",
      name: "Is my payment secure?",
      acceptedAnswer: { "@type": "Answer", text: "Yes. Payments are held in escrow and only released to the writer after you approve the completed work. If no writer delivers, you get a full refund." },
    },
    {
      "@type": "Question",
      name: "Who are the writers?",
      acceptedAnswer: { "@type": "Answer", text: "All writers are manually vetted professionals — PhD holders, Masters graduates, and published authors. They go through a strict application and approval process before accessing any orders." },
    },
    {
      "@type": "Question",
      name: "Is the work plagiarism-free?",
      acceptedAnswer: { "@type": "Answer", text: "Yes. All writers are required to deliver 100% original content. We have a zero-tolerance policy for plagiarism. If plagiarised content is delivered, you are entitled to a full refund." },
    },
    {
      "@type": "Question",
      name: "How many revisions do I get?",
      acceptedAnswer: { "@type": "Answer", text: "You can request revisions within the scope of your original instructions. There is no hard limit on the number of revision requests, as long as they relate to the original brief." },
    },
    {
      "@type": "Question",
      name: "When can I get a full refund?",
      acceptedAnswer: { "@type": "Answer", text: "You're guaranteed a full refund if the writer fails to deliver by the deadline, if no writer accepts your order, or if the work is entirely off-topic." },
    },
    {
      "@type": "Question",
      name: "How do I become a writer on WriteProf?",
      acceptedAnswer: { "@type": "Answer", text: "Sign up as a Writer. Your application is reviewed by our admin team within 24–48 hours. Once approved, your dashboard unlocks and you can start bidding on orders." },
    },
    {
      "@type": "Question",
      name: "How do writer earnings work?",
      acceptedAnswer: { "@type": "Answer", text: "Writers earn 80% of the order value. Funds are released to your wallet when the client approves your work. You can withdraw your balance at any time." },
    },
  ],
};

export default function HelpLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      {children}
    </>
  );
}
