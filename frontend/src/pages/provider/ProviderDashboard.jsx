import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import api from '../../services/api';
import StatusBadge from '../../components/StatusBadge';
import {
  Wrench,
  Clock,
  CheckCircle2,
  DollarSign,
  Star,
  Power,
  AlertOctagon,
  Phone,
  MapPin,
  Car,
  ArrowRight,
  TrendingUp,
  ShieldCheck,
  AlertTriangle
} from 'lucide-react';
import { toast } from 'sonner';

const ProviderDashboard = () => {
  const { user } = useAuth();
  const socket = useSocket();

  const [stats, setStats] = useState(null);
  const [activeJobs, setActiveJobs] = useState([]);
  const [recentRequests, setRecentRequests] = useState([]);
  const [isAvailable, setIsAvailable] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [completingRequestId, setCompletingRequestId] = useState(null);
  const [completionAmount, setCompletionAmount] = useState('');

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      const res = await api.get('/providers/dashboard/stats');
      if (res.success) {
        setStats(res.stats);
        setActiveJobs(res.activeJobs || []);
        setRecentRequests(res.recentRequests || []);
        setIsAvailable(res.stats.isAvailable);
      }
    } catch (err) {
      toast.error('Failed to load provider metrics: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Listen for real-time incoming request notifications
  useEffect(() => {
    if (!socket) return;

    socket.on('new_assistance_request', () => {
      fetchDashboardData();
    });

    return () => {
      socket.off('new_assistance_request');
    };
  }, [socket]);

  // Toggle Online / Offline Availability
  const handleToggleAvailability = async () => {
    const newStatus = !isAvailable;
    try {
      setIsAvailable(newStatus);
      const res = await api.patch('/providers/availability', { isAvailable: newStatus });
      if (res.success) {
        toast.success(res.message);
      }
    } catch (err) {
      setIsAvailable(!newStatus);
      toast.error(err.message || 'Failed to update availability status.');
    }
  };

  // Quick Advance Status (e.g. accepted -> on_the_way -> in_progress -> completed)
  const handleAdvanceStatus = async (request, nextStatus) => {
    try {
      const res = await api.patch(`/requests/${request.id}/status`, {
        status: nextStatus
      });
      if (res.success) {
        toast.success(`Job advanced to: ${nextStatus.replace(/_/g, ' ')}`);
        fetchDashboardData();
      }
    } catch (err) {
      toast.error(err.message);
    }
  };

  // Complete Job with final cost
  const handleCompleteJob = async (e) => {
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
        fetchDashboardData();
      }
    } catch (err) {
      toast.error(err.message);
    }
  };

  if (isLoading && !stats) {
    return <div className="p-12 text-center text-xs text-slate-400">Loading provider portal...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-16">
      
      {/* Top Banner & Availability Toggle */}
      <div className="bg-gradient-to-r from-navy-950 via-navy-900 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">
              {stats?.verificationStatus === 'verified' ? 'Verified Service Partner' : 'Verification Pending'}
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-slate-500" />
            <span className="text-xs text-slate-300">
              Rating: ⭐ {stats?.rating || 5.0} ({stats?.totalRatings || 0} reviews)
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
            {user?.business_name || user?.name}
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 max-w-lg">
            Manage your incoming roadside breakdowns, dispatch technicians, and track daily service earnings.
          </p>
        </div>

        {/* Online / Offline Toggle Button */}
        <div className="flex items-center gap-4 bg-slate-800/80 p-3 rounded-2xl border border-slate-700/80">
          <div className="text-right">
            <span className="text-xs font-bold block">
              {isAvailable ? 'Online & Available' : 'Offline / On Break'}
            </span>
            <span className="text-[10px] text-slate-400">
              {isAvailable ? 'Receiving customer breakdown alerts' : 'Hidden from driver searches'}
            </span>
          </div>

          <button
            onClick={handleToggleAvailability}
            className={`p-3 rounded-xl transition-all shadow-md ${
              isAvailable
                ? 'bg-emerald-500 text-white shadow-emerald-500/25'
                : 'bg-slate-700 text-slate-400'
            }`}
            title="Toggle Status"
          >
            <Power className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Verification Notice Banner if not verified */}
      {stats?.verificationStatus !== 'verified' && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div className="text-xs leading-relaxed">
            <strong className="block font-bold">Account Verification Under Review:</strong>
            Your service garage account is currently being reviewed by the platform administrator. Once approved, your workshop will automatically begin receiving nearby customer roadside assistance requests.
          </div>
        </div>
      )}

      {/* KPI Stats Counter Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
            <span>Total Requests</span>
            <Clock className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-2xl font-black text-navy-900">{stats?.totalRequests || 0}</div>
          <div className="text-[11px] text-slate-400">Platform lifetime</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold text-amber-600">
            <span>Pending Approvals</span>
            <AlertOctagon className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-black text-amber-600">{stats?.pendingRequests || 0}</div>
          <div className="text-[11px] text-slate-400">Awaiting your response</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold text-brand-blue">
            <span>Active En-Route</span>
            <Wrench className="w-4 h-4 text-brand-blue" />
          </div>
          <div className="text-2xl font-black text-brand-blue">{stats?.activeRequests || 0}</div>
          <div className="text-[11px] text-slate-400">Currently in progress</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold text-emerald-600">
            <span>Services Done</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-black text-emerald-600">{stats?.completedRequests || 0}</div>
          <div className="text-[11px] text-slate-400">Successfully rescued</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2 col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between text-xs font-semibold text-emerald-700">
            <span>Total Earnings</span>
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-emerald-700">
            ₹{stats?.totalRevenue ? Number(stats.totalRevenue).toLocaleString() : '0'}
          </div>
          <div className="text-[11px] text-slate-400">Gross service volume</div>
        </div>

      </div>

      {/* Active Jobs in Progress */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-brand-blue flex items-center justify-center">
              <Wrench className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-navy-900">Active Field Operations</h3>
              <p className="text-xs text-slate-400">Jobs currently accepted, en-route, or in progress</p>
            </div>
          </div>

          <Link
            to="/provider/requests"
            className="text-xs font-bold text-brand-blue hover:underline flex items-center gap-1"
          >
            <span>View All Queue</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {activeJobs.length === 0 ? (
          <div className="p-8 text-center rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-400">
            No active jobs at the moment. Keep your availability online to receive incoming requests!
          </div>
        ) : (
          <div className="space-y-4">
            {activeJobs.map((job) => (
              <div
                key={job.id}
                className="p-5 rounded-2xl border border-slate-200 hover:border-brand-blue bg-slate-50/50 transition-all space-y-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-xs font-bold text-slate-600 bg-white px-2.5 py-1 rounded-md border">
                      {job.request_code}
                    </span>
                    <span className="text-sm font-bold text-navy-900">{job.category}</span>
                    <StatusBadge status={job.status} size="sm" />
                  </div>

                  <div className="text-xs font-bold text-emerald-600">
                    Est. Bill: ₹{job.final_cost || job.estimated_cost}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div>
                    <span className="text-slate-400 block">Customer</span>
                    <span className="font-bold text-slate-800">{job.customer_name}</span>
                    {job.customer_phone && (
                      <a
                        href={`tel:${job.customer_phone}`}
                        className="text-brand-blue font-semibold hover:underline block mt-0.5"
                      >
                        📞 {job.customer_phone}
                      </a>
                    )}
                  </div>

                  <div>
                    <span className="text-slate-400 block">Location</span>
                    <span className="font-medium text-slate-800 truncate block">{job.address}</span>
                  </div>

                  <div>
                    <span className="text-slate-400 block">Vehicle</span>
                    <span className="font-medium text-slate-800 block">
                      {job.make ? `${job.make} ${job.model} (${job.registration_number})` : 'Standard Vehicle'}
                    </span>
                  </div>
                </div>

                <div className="text-xs text-slate-600 italic bg-white p-3 rounded-xl border border-slate-100">
                  Problem: "{job.description}"
                </div>

                {/* Workflow Action Buttons */}
                <div className="pt-2 flex flex-wrap items-center justify-end gap-2.5 border-t border-slate-200/60">
                  {job.status === 'accepted' && (
                    <button
                      onClick={() => handleAdvanceStatus(job, 'on_the_way')}
                      className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700 transition-colors shadow-sm"
                    >
                      Mark Dispatched & On The Way &rarr;
                    </button>
                  )}

                  {job.status === 'on_the_way' && (
                    <button
                      onClick={() => handleAdvanceStatus(job, 'in_progress')}
                      className="px-4 py-2 rounded-xl bg-purple-600 text-white text-xs font-bold hover:bg-purple-700 transition-colors shadow-sm"
                    >
                      Mark Arrived & In Progress &rarr;
                    </button>
                  )}

                  {job.status === 'in_progress' && (
                    <button
                      onClick={() => {
                        setCompletingRequestId(job.id);
                        setCompletionAmount(job.final_cost || job.estimated_cost || 450);
                      }}
                      className="px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 transition-colors shadow-sm"
                    >
                      Complete & Submit Final Invoice &rarr;
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Completion Modal */}
      {completingRequestId && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full border border-slate-200 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-navy-900">Final Service Completion</h3>
            <p className="text-xs text-slate-500">
              Confirm the final amount charged to the customer for repair and parts.
            </p>

            <form onSubmit={handleCompleteJob} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Final Amount (₹)
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

export default ProviderDashboard;
