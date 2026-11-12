import React, { useState } from 'react';
import { Star, X, CheckCircle, MessageSquare } from 'lucide-react';
import api from '../services/api';
import { toast } from 'sonner';

const ReviewModal = ({ isOpen, onClose, request, onReviewSubmitted }) => {
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !request) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!comment.trim()) {
      toast.error('Please write a short review comment.');
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await api.post('/reviews', {
        requestId: request.id,
        rating,
        comment: comment.trim()
      });

      if (res.success) {
        toast.success('Thank you for rating your service provider!');
        if (onReviewSubmitted) onReviewSubmitted(res);
        onClose();
      }
    } catch (err) {
      toast.error(err.message || 'Failed to submit review');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-200">
        
        {/* Header */}
        <div className="bg-navy-900 p-5 text-white flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold">Rate Your Experience</h3>
            <p className="text-xs text-slate-300">
              Provider: {request.provider_name || 'Rescue Specialist'} ({request.request_code})
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          
          {/* Star Rating Picker */}
          <div className="text-center space-y-2">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
              Tap stars to rate
            </span>
            <div className="flex items-center justify-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => {
                const filled = (hoverRating || rating) >= star;
                return (
                  <button
                    type="button"
                    key={star}
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    className="p-1 hover:scale-110 transition-transform focus:outline-none"
                  >
                    <Star
                      className={`w-8 h-8 transition-colors ${
                        filled ? 'text-amber-400 fill-amber-400' : 'text-slate-300'
                      }`}
                    />
                  </button>
                );
              })}
            </div>
            <div className="text-sm font-bold text-navy-900">
              {rating === 5 && 'Outstanding & Fast! 🌟'}
              {rating === 4 && 'Very Good Service 👍'}
              {rating === 3 && 'Average Experience 😐'}
              {rating === 2 && 'Needs Improvement 👎'}
              {rating === 1 && 'Unsatisfactory ❌'}
            </div>
          </div>

          {/* Comment Box */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
              <MessageSquare className="w-3.5 h-3.5 text-brand-blue" />
              <span>Review Details</span>
            </label>
            <textarea
              rows={4}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="How quickly did the mechanic arrive? Was the issue resolved smoothly?"
              className="w-full text-sm rounded-xl border border-slate-300 p-3 focus:outline-none focus:ring-2 focus:ring-brand-blue focus:border-transparent resize-none"
              required
            />
          </div>

          {/* Submit */}
          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-slate-300 font-semibold text-xs text-slate-700 hover:bg-slate-50 transition-colors"
            >
              Skip
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 py-2.5 rounded-xl bg-brand-blue text-white font-semibold text-xs hover:bg-blue-700 transition-colors shadow-md shadow-blue-500/20 disabled:opacity-50"
            >
              {isSubmitting ? 'Submitting...' : 'Post Review'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReviewModal;
