"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { DollarSign, TrendingUp, Download, Banknote, Clock } from "lucide-react";
import { useAuthStore } from "@/store";
import { formatPrice } from "@/lib/pricing";
import toast from "react-hot-toast";

const mockTransactions = [
  { id: "1", type: "Earning", description: "Order WP-20260501-1234 completed", amount: 128, status: "RELEASED", date: "2026-05-10" },
  { id: "2", type: "Earning", description: "Order WP-20260430-5678 completed", amount: 96, status: "RELEASED", date: "2026-05-08" },
  { id: "3", type: "Withdrawal", description: "Bank transfer", amount: -150, status: "PAID", date: "2026-05-05" },
  { id: "4", type: "Earning", description: "Order WP-20260428-9012 completed", amount: 72, status: "RELEASED", date: "2026-05-03" },
  { id: "5", type: "Earning", description: "Order WP-20260425-3456 pending", amount: 112, status: "ESCROW", date: "2026-05-01" },
];

export default function EarningsPage() {
  const { user } = useAuthStore();
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [amount, setAmount] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [bankCode, setBankCode] = useState("");

  const handleWithdraw = async () => {
    const amt = parseFloat(amount);
    if (!amt || amt < 50) { toast.error("Minimum withdrawal is $50"); return; }
    if (amt > (user?.wallet?.balance || 0)) { toast.error("Insufficient balance"); return; }

    try {
      const res = await fetch("/api/payments/withdraw", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: amt, accountNumber, bankCode }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast.success("Withdrawal request submitted!");
      setShowWithdrawModal(false);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Withdrawal failed");
    }
  };

  const balance = user?.wallet?.balance || 0;
  const totalEarned = user?.wallet?.totalEarned || 0;
  const pendingEarnings = mockTransactions.filter(t => t.status === "ESCROW").reduce((s, t) => s + t.amount, 0);

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-white">Earnings & Withdrawals</h1>
            <p className="text-slate-400 text-sm mt-1">Track your earnings and request withdrawals</p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            {[
              { label: "Available Balance", value: formatPrice(balance), icon: DollarSign, color: "text-emerald-400", bg: "bg-emerald-500/10", action: true },
              { label: "Total Earned", value: formatPrice(totalEarned), icon: TrendingUp, color: "text-brand-400", bg: "bg-brand-500/10" },
              { label: "Pending Clearance", value: formatPrice(pendingEarnings), icon: Clock, color: "text-yellow-400", bg: "bg-yellow-500/10" },
            ].map((stat) => (
              <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6">
                <div className={`w-10 h-10 rounded-xl ${stat.bg} flex items-center justify-center mb-3`}>
                  <stat.icon className={`w-5 h-5 ${stat.color}`} />
                </div>
                <p className="text-2xl font-bold text-white mb-0.5">{stat.value}</p>
                <p className="text-slate-500 text-xs">{stat.label}</p>
                {stat.action && (
                  <button
                    onClick={() => setShowWithdrawModal(true)}
                    disabled={balance < 50}
                    className="mt-3 btn-primary text-xs py-2 w-full disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Request Withdrawal
                  </button>
                )}
              </motion.div>
            ))}
          </div>

          {/* Transaction history */}
          <div className="glass-card overflow-hidden">
            <div className="p-5 border-b border-white/5 flex items-center justify-between">
              <h2 className="text-white font-semibold">Transaction History</h2>
              <button className="btn-ghost text-xs flex items-center gap-1.5">
                <Download className="w-3.5 h-3.5" /> Export CSV
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/5">
                    <th className="text-left px-5 py-3 text-slate-500 text-xs">DATE</th>
                    <th className="text-left px-5 py-3 text-slate-500 text-xs">DESCRIPTION</th>
                    <th className="text-left px-5 py-3 text-slate-500 text-xs">STATUS</th>
                    <th className="text-right px-5 py-3 text-slate-500 text-xs">AMOUNT</th>
                  </tr>
                </thead>
                <tbody>
                  {mockTransactions.map((tx) => (
                    <tr key={tx.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                      <td className="px-5 py-3 text-slate-400 text-sm">{tx.date}</td>
                      <td className="px-5 py-3 text-slate-300 text-sm">{tx.description}</td>
                      <td className="px-5 py-3">
                        <span className={`badge text-xs ${tx.status === "RELEASED" || tx.status === "PAID" ? "badge-green" : tx.status === "ESCROW" ? "badge-orange" : "badge-blue"}`}>
                          {tx.status}
                        </span>
                      </td>
                      <td className={`px-5 py-3 text-right font-semibold text-sm ${tx.amount > 0 ? "text-emerald-400" : "text-red-400"}`}>
                        {tx.amount > 0 ? "+" : ""}{formatPrice(Math.abs(tx.amount))}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Withdrawal Modal */}
          {showWithdrawModal && (
            <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 px-4">
              <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="glass-card p-6 w-full max-w-md">
                <h3 className="text-white font-bold text-lg mb-4">Request Withdrawal</h3>
                <p className="text-slate-400 text-sm mb-4">Available: <strong className="text-white">{formatPrice(balance)}</strong> · Minimum: $50</p>

                <div className="space-y-3 mb-5">
                  <div>
                    <label className="label">Amount (USD)</label>
                    <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="50" className="input-field" min="50" max={balance} />
                  </div>
                  <div>
                    <label className="label">Account Number</label>
                    <input type="text" value={accountNumber} onChange={(e) => setAccountNumber(e.target.value)} placeholder="0123456789" className="input-field" maxLength={10} />
                  </div>
                  <div>
                    <label className="label">Bank</label>
                    <select value={bankCode} onChange={(e) => setBankCode(e.target.value)} className="input-field">
                      <option value="">Select bank...</option>
                      <option value="044">Access Bank</option>
                      <option value="063">Access Bank (Diamond)</option>
                      <option value="035A">ALAT by Wema</option>
                      <option value="023">Citibank</option>
                      <option value="050">EcoBank Nigeria</option>
                      <option value="011">First Bank of Nigeria</option>
                      <option value="214">First City Monument Bank</option>
                      <option value="070">Fidelity Bank</option>
                      <option value="058">GTBank</option>
                      <option value="030">Heritage Bank</option>
                      <option value="301">Jaiz Bank</option>
                      <option value="082">Keystone Bank</option>
                      <option value="014">MainStreet Bank</option>
                      <option value="076">Polaris Bank</option>
                      <option value="101">ProvidusBank</option>
                      <option value="221">Stanbic IBTC Bank</option>
                      <option value="068">Standard Chartered Bank</option>
                      <option value="232">Sterling Bank</option>
                      <option value="100">Suntrust Bank</option>
                      <option value="032">Union Bank of Nigeria</option>
                      <option value="033">United Bank for Africa</option>
                      <option value="215">Unity Bank</option>
                      <option value="035">Wema Bank</option>
                      <option value="057">Zenith Bank</option>
                    </select>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button onClick={() => setShowWithdrawModal(false)} className="btn-secondary flex-1 py-2.5">Cancel</button>
                  <button onClick={handleWithdraw} className="btn-primary flex-1 py-2.5">
                    <Banknote className="w-4 h-4" /> Withdraw
                  </button>
                </div>
              </motion.div>
            </div>
          )}
    </div>
  );
}
