"use client";

import { motion } from "framer-motion";
import { Send, Clock, CheckCircle, XCircle, FileText } from "lucide-react";

const mockProposals = [
  {
    id: "1",
    title: "10-page Research Paper on Climate Change",
    client: "Client #4821",
    submittedAt: "2 hours ago",
    deadline: "6 hours",
    budget: "₦18,000",
    status: "pending",
    wordCount: 2500,
  },
  {
    id: "2",
    title: "Business Proposal for Tech Startup",
    client: "Client #3907",
    submittedAt: "5 hours ago",
    deadline: "12 hours",
    budget: "₦24,000",
    status: "accepted",
    wordCount: 3000,
  },
  {
    id: "3",
    title: "SEO Blog Post — Digital Marketing",
    client: "Client #5532",
    submittedAt: "1 day ago",
    deadline: "24 hours",
    budget: "₦9,600",
    status: "rejected",
    wordCount: 1200,
  },
];

const statusConfig = {
  pending: { label: "Pending", color: "text-yellow-400", bg: "bg-yellow-500/10 border-yellow-500/20", icon: Clock },
  accepted: { label: "Accepted", color: "text-green-400", bg: "bg-green-500/10 border-green-500/20", icon: CheckCircle },
  rejected: { label: "Declined", color: "text-red-400", bg: "bg-red-500/10 border-red-500/20", icon: XCircle },
};

export default function ProposalsPage() {
  const pending = mockProposals.filter((p) => p.status === "pending").length;
  const accepted = mockProposals.filter((p) => p.status === "accepted").length;

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white mb-1">My Proposals</h1>
          <p className="text-slate-400 text-sm">Track all the bids you've submitted on available orders.</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { label: "Total Sent", value: mockProposals.length, color: "from-brand-600 to-brand-400" },
            { label: "Pending", value: pending, color: "from-yellow-600 to-yellow-400" },
            { label: "Accepted", value: accepted, color: "from-green-600 to-green-400" },
          ].map((s) => (
            <div key={s.label} className="glass-card p-4 text-center">
              <div className={`text-3xl font-extrabold bg-gradient-to-r ${s.color} bg-clip-text text-transparent`}>
                {s.value}
              </div>
              <p className="text-slate-400 text-xs mt-1">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Proposals list */}
        <div className="space-y-4">
          {mockProposals.map((proposal, i) => {
            const cfg = statusConfig[proposal.status as keyof typeof statusConfig];
            const StatusIcon = cfg.icon;
            return (
              <motion.div
                key={proposal.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                className="glass-card p-5 flex flex-col sm:flex-row sm:items-center gap-4"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center flex-shrink-0">
                      <FileText className="w-4 h-4 text-brand-400" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-white font-semibold text-sm truncate">{proposal.title}</p>
                      <p className="text-slate-500 text-xs mt-0.5">{proposal.client} · {proposal.wordCount.toLocaleString()} words · Due in {proposal.deadline}</p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  <div className="text-right">
                    <p className="text-white font-bold text-sm">{proposal.budget}</p>
                    <p className="text-slate-500 text-xs">{proposal.submittedAt}</p>
                  </div>
                  <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-semibold ${cfg.bg} ${cfg.color}`}>
                    <StatusIcon className="w-3 h-3" />
                    {cfg.label}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {mockProposals.length === 0 && (
          <div className="text-center py-20">
            <Send className="w-12 h-12 text-slate-600 mx-auto mb-4" />
            <p className="text-slate-400 font-medium">No proposals yet</p>
            <p className="text-slate-600 text-sm mt-1">Browse available orders and submit your first bid.</p>
          </div>
        )}
      </motion.div>
    </div>
  );
}
