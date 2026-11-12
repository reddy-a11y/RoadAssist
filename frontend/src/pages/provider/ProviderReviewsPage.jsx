import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { Star, MessageSquare, ThumbsUp, User } from 'lucide-react';
import { toast } from 'sonner';

const ProviderReviewsPage = () => {
  const { user } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchReviews = async () => {
      if (!user?.provider?.id) return;
      try {
        setIsLoading(true);
        const res = await api.get(`/reviews/provider/${user.provider.id}`);
        if (res.success) {
          setReviews(res.reviews || []);
        }
      } catch (err) {
        toast.error('Failed to load reviews: ' + err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchReviews();
  }, [user]);

  const avgRating = reviews.length > 0
    ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
    : user?.provider?.rating || '5.0';

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-16">
      
      {/* Header & Rating Banner */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <h2 className="text-2xl font-black text-navy-900 tracking-tight">Customer Reviews & Ratings</h2>
          <p className="text-xs text-slate-500">
            Real feedback left by rescued drivers after completed roadside jobs
          </p>
        </div>

        <div className="flex items-center gap-4 bg-amber-50 p-4 rounded-2xl border border-amber-200">
          <div className="text-3xl font-black text-amber-700">{avgRating}</div>
          <div>
            <div className="flex items-center gap-1 text-amber-400">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-4 h-4 ${
                    i < Math.round(Number(avgRating)) ? 'fill-amber-400 text-amber-400' : 'text-slate-300'
                  }`}
                />
              ))}
            </div>
            <div className="text-xs text-amber-900 font-semibold mt-0.5">
              Based on {reviews.length} driver reviews
            </div>
          </div>
        </div>
      </div>

      {/* Reviews List */}
      {isLoading ? (
        <div className="p-12 text-center text-xs text-slate-400">Loading reviews...</div>
      ) : reviews.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 text-xs text-slate-500 space-y-3">
          <Star className="w-10 h-10 text-slate-300 mx-auto" />
          <p>No customer reviews yet. Complete your first rescue job to receive ratings!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((rev) => (
            <div
              key={rev.id}
              className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-3"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-sm">
                    {rev.customer_name?.charAt(0) || 'C'}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-navy-900">{rev.customer_name}</h4>
                    <div className="text-xs text-slate-400">
                      Incident {rev.request_code} • {rev.category}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1 text-amber-400">
                  {[...Array(rev.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
              </div>

              <p className="text-sm text-slate-700 leading-relaxed italic bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                "{rev.comment}"
              </p>

              <div className="text-[11px] text-slate-400">
                Submitted on {new Date(rev.created_at).toLocaleDateString()}
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
};

export default ProviderReviewsPage;
