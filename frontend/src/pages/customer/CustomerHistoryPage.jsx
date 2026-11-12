import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import StatusBadge from '../../components/StatusBadge';
import ReviewModal from '../../components/ReviewModal';
import { Clock, Star, MapPin, ExternalLink, Filter, CheckCircle2, FileText, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';

const CustomerHistoryPage = () => {
  const [requests, setRequests] = useState([]);
  const [filter, setFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);

  const fetchHistory = async () => {
    try {
      setIsLoading(true);
      const res = await api.get('/requests/my');
      if (res.success) {
        setRequests(res.requests || []);
      }
    } catch (err) {
      toast.error('Failed to load history: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const filtered = requests.filter((r) => {
    if (filter === 'all') return true;
    if (filter === 'completed') return r.status === 'completed';
    if (filter === 'active') return ['pending', 'accepted', 'on_the_way', 'in_progress'].includes(r.status);
    if (filter === 'cancelled') return ['cancelled', 'rejected'].includes(r.status);
    return true;
  });

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-16">
      
      {/* Header & Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-navy-900 tracking-tight">Assistance History</h2>
          <p className="text-xs text-slate-500">
            Review past roadside repairs, final invoices, and submitted feedback
          </p>
        </div>

        <div className="flex items-center gap-2 bg-white p-1 rounded-xl border border-slate-200">
          {['all', 'completed', 'active', 'cancelled'].map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition-all ${
                filter === tab
                  ? 'bg-navy-900 text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* History List */}
      {isLoading ? (
        <div className="p-12 text-center text-xs text-slate-400">Loading service history...</div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 text-xs text-slate-500 space-y-3">
          <Clock className="w-10 h-10 text-slate-300 mx-auto" />
          <p>No requests found matching filter "{filter}".</p>
        </div>
      ) : (
        <div className="space-y-3.5">
          {filtered.map((req) => (
            <div
              key={req.id}
              className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-sm hover:border-slate-300 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-mono font-bold text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-md">
                    {req.request_code}
                  </span>
                  <StatusBadge status={req.status} size="sm" />
                  <span className="text-xs text-slate-400">
                    {new Date(req.created_at).toLocaleDateString()} at{' '}
                    {new Date(req.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>

                <h3 className="text-base font-bold text-navy-900">{req.category}</h3>

                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <span>{req.address}</span>
                  </span>
                  {req.provider_name && (
                    <span>Provider: <strong className="text-slate-700">{req.provider_name}</strong></span>
                  )}
                  {req.make && (
                    <span>Vehicle: <strong className="text-slate-700">{req.make} {req.model} ({req.registration_number})</strong></span>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between md:justify-end gap-6 pt-3 md:pt-0 border-t md:border-t-0 border-slate-100">
                <div className="text-left md:text-right">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                    Final Charges
                  </span>
                  <span className="text-lg font-black text-emerald-600">
                    ₹{req.final_cost || req.estimated_cost}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {req.status === 'completed' && !req.customer_review_rating && (
                    <button
                      onClick={() => {
                        setSelectedRequest(req);
                        setReviewModalOpen(true);
                      }}
                      className="px-3 py-1.5 rounded-xl bg-amber-50 text-amber-700 border border-amber-200 text-xs font-bold hover:bg-amber-100 transition-colors flex items-center gap-1"
                    >
                      <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                      <span>Rate</span>
                    </button>
                  )}

                  {req.customer_review_rating && (
                    <div className="text-xs font-bold text-amber-600 flex items-center gap-1 bg-amber-50 px-2.5 py-1 rounded-lg">
                      <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                      <span>{req.customer_review_rating}/5</span>
                    </div>
                  )}

                  <Link
                    to={`/tracking?id=${req.id}`}
                    className="px-3.5 py-1.5 rounded-xl bg-navy-900 text-white text-xs font-bold hover:bg-navy-800 transition-colors flex items-center gap-1 shadow-sm"
                  >
                    <span>Details</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Review Modal */}
      <ReviewModal
        isOpen={reviewModalOpen}
        onClose={() => setReviewModalOpen(false)}
        request={selectedRequest}
        onReviewSubmitted={fetchHistory}
      />

    </div>
  );
};

export default CustomerHistoryPage;
