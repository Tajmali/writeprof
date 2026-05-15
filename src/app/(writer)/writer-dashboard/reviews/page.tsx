"use client";

import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Star, TrendingUp, MessageSquare, Award, Loader2, ThumbsUp } from "lucide-react";

interface Review {
  id: string;
  rating: number;
  comment: string;
  createdAt: string;
  author: { id: string; name: string; avatar: string | null };
  orderId: string;
}

interface ReviewStats {
  averageRating: number;
  totalReviews: number;
  distribution: Record<string, number>;
}

export default function WriterReviewsPage() {
  const { data: profileData } = useQuery({
    queryKey: ["writer-profile"],
    queryFn: async () => {
      const res = await fetch("/api/auth/me");
      const json = await res.json();
      return json.data;
    },
  });

  const userId = profileData?.user?.id;

  const { data: reviewData, isLoading } = useQuery({
    queryKey: ["writer-reviews", userId],
    queryFn: async () => {
      const res = await fetch(`/api/reviews?targetId=${userId}`);
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      // Build stats from reviews array
      const reviews: Review[] = json.data.reviews;
      const distribution: Record<string, number> = { "5": 0, "4": 0, "3": 0, "2": 0, "1": 0 };
      reviews.forEach(r => { distribution[r.rating.toString()] = (distribution[r.rating.toString()] || 0) + 1; });
      const avg = reviews.length > 0 ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length : 0;
      return { reviews, stats: { averageRating: avg, totalReviews: reviews.length, distribution } } as { reviews: Review[]; stats: ReviewStats };
    },
    enabled: !!userId,
  });

  const reviews = reviewData?.reviews || [];
  const stats = reviewData?.stats;
  const writerProfile = profileData?.writerProfile;

  const distribution = stats?.distribution || { "5": 0, "4": 0, "3": 0, "2": 0, "1": 0 };
  const maxCount = Math.max(...Object.values(distribution).map(Number), 1);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-brand-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">My Reviews</h1>
        <p className="text-gray-400 mt-1">Client feedback on your work</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          {
            label: "Average Rating",
            value: (writerProfile?.averageRating || 0).toFixed(1),
            icon: Star,
            color: "text-yellow-400",
            suffix: "/5.0",
          },
          {
            label: "Total Reviews",
            value: writerProfile?.totalReviews || 0,
            icon: MessageSquare,
            color: "text-brand-400",
          },
          {
            label: "5-Star Reviews",
            value: distribution["5"] || 0,
            icon: ThumbsUp,
            color: "text-green-400",
          },
          {
            label: "Performance Score",
            value: `${Math.min(100, Math.round(((writerProfile?.averageRating || 0) / 5) * 100))}%`,
            icon: TrendingUp,
            color: "text-purple-400",
          },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="glass-card p-4 text-center"
          >
            <stat.icon className={`w-6 h-6 ${stat.color} mx-auto mb-2`} />
            <p className={`text-2xl font-bold ${stat.color}`}>
              {stat.value}{stat.suffix || ""}
            </p>
            <p className="text-xs text-gray-400 mt-1">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Rating Distribution */}
      <div className="glass-card p-5">
        <h3 className="font-semibold text-white mb-4">Rating Distribution</h3>
        <div className="space-y-3">
          {[5, 4, 3, 2, 1].map(rating => {
            const count = distribution[rating.toString()] || 0;
            const percentage = maxCount > 0 ? (count / maxCount) * 100 : 0;
            return (
              <div key={rating} className="flex items-center gap-3">
                <div className="flex items-center gap-1 w-12 shrink-0">
                  <span className="text-sm text-gray-400">{rating}</span>
                  <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                </div>
                <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                    transition={{ duration: 0.8, delay: (5 - rating) * 0.1 }}
                    className="h-full bg-gradient-to-r from-yellow-500 to-yellow-400 rounded-full"
                  />
                </div>
                <span className="text-sm text-gray-400 w-6 text-right shrink-0">{count}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Reviews List */}
      <div className="space-y-4">
        <h3 className="font-semibold text-white">All Reviews ({reviews.length})</h3>
        {reviews.length === 0 ? (
          <div className="glass-card p-12 text-center">
            <Award className="w-12 h-12 text-gray-600 mx-auto mb-4" />
            <h3 className="font-semibold text-white mb-2">No reviews yet</h3>
            <p className="text-sm text-gray-400">Complete orders to receive ratings from clients</p>
          </div>
        ) : (
          reviews.map((review, i) => (
            <motion.div
              key={review.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="glass-card p-5"
            >
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-brand-500/20 flex items-center justify-center text-sm font-bold text-brand-400 shrink-0">
                  {review.author.name[0]}
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between flex-wrap gap-2">
                    <div>
                      <p className="font-semibold text-white">{review.author.name}</p>
                      <p className="text-xs text-gray-500">Order ID: {review.orderId.slice(0, 8)}...</p>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-0.5">
                        {[1, 2, 3, 4, 5].map(s => (
                          <Star key={s} className={`w-4 h-4 ${s <= review.rating ? "text-yellow-400 fill-yellow-400" : "text-gray-600"}`} />
                        ))}
                      </div>
                      <p className="text-xs text-gray-500 mt-1">{new Date(review.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                  {review.comment && (
                    <p className="text-sm text-gray-300 mt-3 leading-relaxed">&ldquo;{review.comment}&rdquo;</p>
                  )}
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
