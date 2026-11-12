import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Star, MessageSquare, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';

const AdminReviewsPage = () => {
  const [reviews, setReviews] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        setIsLoading(true);
        const res = await api.get('/reviews/public');
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
  }, []);

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-16">
      
      {/* Header */}
      <div>
        <h2 className="text-2xl font-black text-navy-900 tracking-tight">Platform Feedback Moderation</h2>
        <p className="text-xs text-slate-500">
          Monitor service quality and customer satisfaction across all verified providers
        </p>
      </div>

      {isLoading ? (
        <div className="p-12 text-center text-xs text-slate-400">Loading reviews...</div>
      ) : reviews.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 text-xs text-slate-500">
          No customer reviews submitted yet.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {reviews.map((rev) => (
            <div
              key={rev.id}
              className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-3"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="font-bold text-navy-900 text-sm">{rev.customer_name}</div>
                  <div className="text-xs text-slate-500">
                    Partner: <strong className="text-slate-800">{rev.provider_name}</strong>
                  </div>
                  <div className="text-[11px] text-slate-400">
                    Incident: {rev.request_code} • {rev.category}
                  </div>
                </div>

                <div className="flex items-center gap-1 text-amber-400 bg-amber-50 px-2 py-1 rounded-lg border border-amber-200/60">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  <span className="text-xs font-bold text-amber-800">{rev.rating}/5</span>
                </div>
              </div>

              <p className="text-xs text-slate-700 leading-relaxed italic bg-slate-50 p-3 rounded-xl border border-slate-100">
                "{rev.comment}"
              </p>

              <div className="text-[10px] text-slate-400">
                Submitted on {new Date(rev.created_at).toLocaleDateString()}
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
};

export default AdminReviewsPage;
