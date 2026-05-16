"use client";

import { motion } from "framer-motion";
import { Trophy, Star, Medal } from "lucide-react";

const leaderboard = [
  { rank: 1, name: "Dr. Sarah K.", avatar: "SK", orders: 312, rating: 5.0, earnings: "₦4.2M", badge: "Elite Pro" },
  { rank: 2, name: "James O.", avatar: "JO", orders: 278, rating: 4.98, earnings: "₦3.8M", badge: "Top Writer" },
  { rank: 3, name: "Amelia R.", avatar: "AR", orders: 241, rating: 4.97, earnings: "₦3.1M", badge: "Top Writer" },
  { rank: 4, name: "Michael T.", avatar: "MT", orders: 198, rating: 4.95, earnings: "₦2.6M", badge: "Rising Star" },
  { rank: 5, name: "You", avatar: "ME", orders: 91, rating: 4.90, earnings: "₦1.2M", badge: "Rising Star", isMe: true },
  { rank: 6, name: "Linda W.", avatar: "LW", orders: 87, rating: 4.88, earnings: "₦1.1M", badge: "Active" },
  { rank: 7, name: "Charles B.", avatar: "CB", orders: 74, rating: 4.85, earnings: "₦980K", badge: "Active" },
];

const rankConfig: Record<number, { color: string; icon: React.ElementType }> = {
  1: { color: "text-yellow-400", icon: Trophy },
  2: { color: "text-slate-300", icon: Medal },
  3: { color: "text-amber-600", icon: Medal },
};

export default function LeaderboardPage() {
  return (
    <div className="p-6 max-w-3xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 text-sm font-semibold mb-3">
            <Trophy className="w-3.5 h-3.5 fill-current" />
            Writer Leaderboard
          </div>
          <h1 className="text-2xl font-bold text-white mb-1">Top Writers This Month</h1>
          <p className="text-slate-400 text-sm">Ranked by completed orders, rating, and total earnings.</p>
        </div>

        {/* Top 3 podium */}
        <div className="flex items-end justify-center gap-4 mb-10">
          {[leaderboard[1], leaderboard[0], leaderboard[2]].map((writer, i) => {
            const heights = ["h-24", "h-32", "h-20"];
            const sizes = ["w-14 h-14", "w-18 h-18", "w-14 h-14"];
            const colors = ["from-slate-600 to-slate-400", "from-yellow-600 to-yellow-400", "from-amber-700 to-amber-500"];
            const podiumColors = ["bg-slate-700/50", "bg-yellow-500/20 border border-yellow-500/30", "bg-amber-700/20"];
            const actualRank = [2, 1, 3][i];
            return (
              <motion.div
                key={writer.rank}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="flex flex-col items-center gap-2"
              >
                <div className={`w-14 h-14 rounded-full bg-gradient-to-br ${colors[i]} flex items-center justify-center text-white font-bold text-sm border-2 ${actualRank === 1 ? "border-yellow-400" : "border-white/10"}`}>
                  {writer.avatar}
                </div>
                <p className="text-white text-xs font-semibold text-center">{writer.name}</p>
                <div className={`w-20 ${heights[i]} ${podiumColors[i]} rounded-t-xl flex items-center justify-center`}>
                  <span className={`text-2xl font-extrabold ${["text-slate-300", "text-yellow-400", "text-amber-600"][i]}`}>
                    #{actualRank}
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Full list */}
        <div className="space-y-3">
          {leaderboard.map((writer, i) => {
            const RankIcon = rankConfig[writer.rank]?.icon;
            const rankColor = rankConfig[writer.rank]?.color || "text-slate-400";
            return (
              <motion.div
                key={writer.rank}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.06 }}
                className={`glass-card p-4 flex items-center gap-4 ${writer.isMe ? "border border-brand-500/40 bg-brand-500/5" : ""}`}
              >
                {/* Rank */}
                <div className="w-8 flex-shrink-0 text-center">
                  {RankIcon ? (
                    <RankIcon className={`w-5 h-5 mx-auto ${rankColor}`} />
                  ) : (
                    <span className="text-slate-500 font-bold text-sm">#{writer.rank}</span>
                  )}
                </div>

                {/* Avatar */}
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0
                  ${writer.isMe ? "bg-gradient-to-br from-brand-600 to-brand-400" : "bg-gradient-to-br from-slate-700 to-slate-600"}`}>
                  {writer.avatar}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className={`font-semibold text-sm ${writer.isMe ? "text-brand-400" : "text-white"}`}>
                      {writer.name} {writer.isMe && <span className="text-xs text-brand-500">(You)</span>}
                    </p>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium
                      ${writer.badge === "Elite Pro" ? "bg-yellow-500/15 text-yellow-400" :
                        writer.badge === "Top Writer" ? "bg-brand-500/15 text-brand-400" :
                        writer.badge === "Rising Star" ? "bg-violet-500/15 text-violet-400" :
                        "bg-slate-700 text-slate-400"}`}>
                      {writer.badge}
                    </span>
                  </div>
                  <p className="text-slate-500 text-xs">{writer.orders} orders · {writer.earnings}</p>
                </div>

                {/* Rating */}
                <div className="flex items-center gap-1 flex-shrink-0">
                  <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                  <span className="text-white text-sm font-semibold">{writer.rating.toFixed(2)}</span>
                </div>
              </motion.div>
            );
          })}
        </div>

        <p className="text-center text-slate-600 text-xs mt-6">Updated daily · Based on last 30 days performance</p>
      </motion.div>
    </div>
  );
}
