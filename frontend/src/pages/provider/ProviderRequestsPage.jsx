import React, { useState, useEffect } from 'react';
import { useSocket } from '../../context/SocketContext';
import api from '../../services/api';
import StatusBadge from '../../components/StatusBadge';
import {
  AlertOctagon,
  Phone,
  MapPin,
  Car,
  Clock,
  CheckCircle2,
  XCircle,
  Truck,
  Wrench,
  ExternalLink,
  DollarSign,
  Camera
} from 'lucide-react';
import { toast } from 'sonner';

const ProviderRequestsPage = () => {
  const socket = useSocket();
  const [requests, setRequests] = useState([]);
  const [filter, setFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [completingRequestId, setCompletingRequestId] = useState(null);
  const [completionAmount, setCompletionAmount] = useState('');

  const fetchRequests = async () => {
    try {
      setIsLoading(true);
      const url = filter === 'all'
        ? '/providers/dashboard/requests'
        : `/providers/dashboard/requests?status=${filter}`;
      const res = await api.get(url);
      if (res.success) {
        setRequests(res.requests || []);
      }
    } catch (err) {
      toast.error('Failed to load requests: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [filter]);

  // Real-time socket updates
  useEffect(() => {
    if (!socket) return;
    socket.on('new_assistance_request', () => {
      fetchRequests();
    });
    socket.on('request_status_updated', () => {
      fetchRequests();
    });
    return () => {
      socket.off('new_assistance_request');
      socket.off('request_status_updated');
    };
  }, [socket]);

  const handleUpdateStatus = async (requestId, nextStatus, notes = '') => {
    try {
      const res = await api.patch(`/requests/${requestId}/status`, {
        status: nextStatus,
        notes
      });
      if (res.success) {
        toast.success(`Request updated to ${nextStatus.replace(/_/g, ' ')}`);
        fetchRequests();
      }
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleCompleteService = async (e) => {
    e.preventDefault();
    if (!completingRequestId || !completionAmount) return;

    try {
      const res = await api.patch(`/requests/${completingRequestId}/status`, {
        status: 'completed',
        finalCost: parseFloat(completionAmount)
      });
      if (res.success) {
        toast.success('Service marked completed & payment recorded!');
        setCompletingRequestId(null);
        setCompletionAmount('');
        fetchRequests();
      }
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-16">
      
      {/* Header & Filter Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-navy-900 tracking-tight">Service Request Queue</h2>
          <p className="text-xs text-slate-500">
            Accept, dispatch, and resolve driver breakdown calls in real time
          </p>
        </div>

        <div className="flex items-center gap-1.5 bg-white p-1 rounded-xl border border-slate-200 overflow-x-auto scrollbar-none">
          {['all', 'pending', 'accepted', 'in_progress', 'completed'].map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition-all whitespace-nowrap ${
                filter === tab
                  ? 'bg-navy-900 text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              {tab === 'in_progress' ? 'In Progress' : tab}
            </button>
          ))}
        </div>
      </div>

      {/* Requests List */}
      {isLoading ? (
        <div className="p-12 text-center text-xs text-slate-400">Loading incoming requests...</div>
      ) : requests.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 text-xs text-slate-500 space-y-3">
          <Clock className="w-10 h-10 text-slate-300 mx-auto" />
          <p>No requests found in "{filter}" queue.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {requests.map((req) => (
            <div
              key={req.id}
              className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:border-slate-300 transition-all space-y-4"
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-xs font-bold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-lg">
                    {req.request_code}
                  </span>
                  <span className="text-base font-bold text-navy-900">{req.category}</span>
                  <StatusBadge status={req.status} size="sm" />
                </div>

                <div className="text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-lg border border-emerald-100">
                  Est. Bill: ₹{req.final_cost || req.estimated_cost}
                </div>
              </div>

              {/* Information Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 text-xs">
                <div>
                  <span className="text-slate-400 font-medium block">Customer Contact</span>
                  <span className="font-bold text-slate-800 text-sm block">{req.customer_name}</span>
                  {req.customer_phone && (
                    <a
                      href={`tel:${req.customer_phone}`}
                      className="inline-flex items-center gap-1 text-brand-blue font-bold hover:underline mt-1"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      <span>{req.customer_phone}</span>
                    </a>
                  )}
                </div>

                <div>
                  <span className="text-slate-400 font-medium block">Breakdown Location</span>
                  <span className="font-semibold text-slate-800 block truncate">{req.address}</span>
                  <a
                    href={`https://www.openstreetmap.org/?mlat=${req.latitude}&mlon=${req.longitude}#map=16/${req.latitude}/${req.longitude}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-brand-blue hover:underline text-[11px] mt-1"
                  >
                    <MapPin className="w-3 h-3" />
                    <span>View on OpenStreetMap</span>
                    <ExternalLink className="w-2.5 h-2.5" />
                  </a>
                </div>

                <div>
                  <span className="text-slate-400 font-medium block">Vehicle Spec</span>
                  <span className="font-bold text-slate-800 block">
                    {req.make ? `${req.make} ${req.model}` : 'Customer Vehicle'}
                  </span>
                  <span className="text-slate-500 font-mono text-[11px] block">
                    {req.registration_number || 'N/A'} • {req.vehicle_type || 'Car'}
                  </span>
                </div>
              </div>

              {/* Problem Description & Photo Thumbnail */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex items-start gap-4 text-xs">
                {req.image_url && (
                  <div className="relative w-16 h-16 rounded-lg overflow-hidden border border-slate-200 flex-shrink-0">
                    <img src={req.image_url} alt="Breakdown" className="w-full h-full object-cover" />
                  </div>
                )}
                <div>
                  <span className="font-bold text-slate-700 block mb-0.5">Problem Symptoms:</span>
                  <p className="text-slate-600 leading-relaxed italic">"{req.description}"</p>
                </div>
              </div>

              {/* Status Actions */}
              <div className="pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100">
                <span className="text-[11px] text-slate-400">
                  Logged {new Date(req.created_at).toLocaleString()}
                </span>

                <div className="flex items-center gap-2">
                  {req.status === 'pending' && (
                    <>
                      <button
                        onClick={() => handleUpdateStatus(req.id, 'rejected', 'Provider declined call')}
                        className="px-3.5 py-1.5 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 text-xs font-bold transition-colors"
                      >
                        Decline
                      </button>
                      <button
                        onClick={() => handleUpdateStatus(req.id, 'accepted', 'Provider accepted')}
                        className="px-4 py-1.5 rounded-xl bg-brand-blue hover:bg-blue-700 text-white text-xs font-bold transition-colors shadow-sm"
                      >
                        Accept Assistance Call
                      </button>
                    </>
                  )}

                  {req.status === 'accepted' && (
                    <button
                      onClick={() => handleUpdateStatus(req.id, 'on_the_way', 'Technician dispatched')}
                      className="px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-colors shadow-sm flex items-center gap-1.5"
                    >
                      <Truck className="w-3.5 h-3.5" />
                      <span>Dispatch Unit (On The Way)</span>
                    </button>
                  )}

                  {req.status === 'on_the_way' && (
                    <button
                      onClick={() => handleUpdateStatus(req.id, 'in_progress', 'Technician arrived on site')}
                      className="px-4 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition-colors shadow-sm flex items-center gap-1.5"
                    >
                      <Wrench className="w-3.5 h-3.5" />
                      <span>Arrived On Site (In Progress)</span>
                    </button>
                  )}

                  {req.status === 'in_progress' && (
                    <button
                      onClick={() => {
                        setCompletingRequestId(req.id);
                        setCompletionAmount(req.final_cost || req.estimated_cost || 450);
                      }}
                      className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors shadow-sm flex items-center gap-1.5"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Complete & Bill Customer</span>
                    </button>
                  )}

                  {req.status === 'completed' && (
                    <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4" /> Service Completed
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Final Cost Completion Modal */}
      {completingRequestId && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full border border-slate-200 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-navy-900">Final Service Completion</h3>
            <p className="text-xs text-slate-500">
              Confirm the final amount charged to the customer for repair and parts.
            </p>

            <form onSubmit={handleCompleteService} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Final Bill Amount (₹)
                </label>
                <input
                  type="number"
                  required
                  min={100}
                  value={completionAmount}
                  onChange={(e) => setCompletionAmount(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm font-bold text-emerald-700 rounded-xl border border-slate-300"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setCompletingRequestId(null)}
                  className="flex-1 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700"
                >
                  Confirm Completion
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default ProviderRequestsPage;
