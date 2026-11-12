import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../../services/api';
import StatusBadge from '../../components/StatusBadge';
import {
  ShieldCheck,
  ShieldAlert,
  Search,
  Check,
  X,
  MapPin,
  Phone,
  Mail,
  Wrench,
  Clock,
  Filter
} from 'lucide-react';
import { toast } from 'sonner';

const AdminProvidersPage = () => {
  const [searchParams] = useSearchParams();
  const initialStatus = searchParams.get('status') || 'all';

  const [providers, setProviders] = useState([]);
  const [statusFilter, setStatusFilter] = useState(initialStatus);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [rejectModalProvider, setRejectModalProvider] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');

  const fetchProviders = async () => {
    try {
      setIsLoading(true);
      const res = await api.get(`/admin/providers?status=${statusFilter}&search=${encodeURIComponent(search)}`);
      if (res.success) {
        setProviders(res.providers || []);
      }
    } catch (err) {
      toast.error('Failed to load service providers: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProviders();
  }, [statusFilter, search]);

  const handleVerify = async (providerId) => {
    try {
      const res = await api.patch(`/admin/providers/${providerId}/verify`, {
        verificationStatus: 'verified'
      });
      if (res.success) {
        toast.success('Provider approved and verified for customer dispatch!');
        fetchProviders();
      }
    } catch (err) {
      toast.error(err.message || 'Verification update failed');
    }
  };

  const handleReject = async (e) => {
    e.preventDefault();
    if (!rejectModalProvider) return;

    try {
      const res = await api.patch(`/admin/providers/${rejectModalProvider.id}/verify`, {
        verificationStatus: 'rejected',
        rejectionReason: rejectionReason.trim()
      });
      if (res.success) {
        toast.info('Provider application rejected.');
        setRejectModalProvider(null);
        setRejectionReason('');
        fetchProviders();
      }
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-16">
      
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-navy-900 tracking-tight">
            Service Provider Management & Approvals
          </h2>
          <p className="text-xs text-slate-500">
            Verify garage license documents, approve roadside mechanics, or suspend substandard partners
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 bg-white p-1 rounded-xl border border-slate-200">
          {['all', 'pending', 'verified', 'rejected'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition-all ${
                statusFilter === st
                  ? 'bg-navy-900 text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-4 top-3.5" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by business name, owner name, city, or phone..."
          className="w-full pl-11 pr-4 py-2.5 bg-white text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-blue"
        />
      </div>

      {/* Providers Table */}
      {isLoading ? (
        <div className="p-12 text-center text-xs text-slate-400">Loading providers list...</div>
      ) : providers.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 text-xs text-slate-500">
          No service providers found matching current criteria.
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[11px]">
                  <th className="py-3.5 px-4">Provider Details</th>
                  <th className="py-3.5 px-4">Location & Coordinates</th>
                  <th className="py-3.5 px-4">Services Offered</th>
                  <th className="py-3.5 px-4">Pricing</th>
                  <th className="py-3.5 px-4">Verification</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {providers.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/60 transition-colors">
                    
                    {/* Details */}
                    <td className="py-4 px-4">
                      <div className="font-bold text-navy-900 text-sm">{p.business_name}</div>
                      <div className="text-slate-500 mt-0.5">{p.owner_name} • {p.phone}</div>
                      <div className="text-slate-400 text-[10px]">{p.provider_email}</div>
                    </td>

                    {/* Location */}
                    <td className="py-4 px-4">
                      <div className="font-medium text-slate-800">{p.address}</div>
                      <div className="text-[11px] font-mono text-slate-400 mt-0.5">
                        Lat: {Number(p.latitude).toFixed(4)}, Lng: {Number(p.longitude).toFixed(4)}
                      </div>
                    </td>

                    {/* Services */}
                    <td className="py-4 px-4">
                      <div className="flex flex-wrap gap-1 max-w-[220px]">
                        {Array.isArray(p.services_offered) &&
                          p.services_offered.slice(0, 3).map((srv, idx) => (
                            <span
                              key={idx}
                              className="text-[10px] font-semibold bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded"
                            >
                              {srv}
                            </span>
                          ))}
                        {p.services_offered?.length > 3 && (
                          <span className="text-[10px] text-slate-400">+{p.services_offered.length - 3} more</span>
                        )}
                      </div>
                    </td>

                    {/* Pricing */}
                    <td className="py-4 px-4 whitespace-nowrap">
                      <div className="font-bold text-slate-900">Base: ₹{p.base_charge}</div>
                      <div className="text-slate-400 text-[11px]">₹{p.per_km_charge}/km</div>
                    </td>

                    {/* Status */}
                    <td className="py-4 px-4 whitespace-nowrap">
                      <StatusBadge status={p.verification_status} type="verification" size="sm" />
                      {p.rejection_reason && (
                        <div className="text-[10px] text-rose-600 italic mt-1 max-w-[150px] truncate" title={p.rejection_reason}>
                          Reason: {p.rejection_reason}
                        </div>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-4 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        {p.verification_status !== 'verified' && (
                          <button
                            onClick={() => handleVerify(p.id)}
                            className="px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] transition-colors flex items-center gap-1 shadow-sm"
                            title="Approve and Verify"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>Verify</span>
                          </button>
                        )}

                        {p.verification_status !== 'rejected' && (
                          <button
                            onClick={() => {
                              setRejectModalProvider(p);
                              setRejectionReason('');
                            }}
                            className="px-2.5 py-1.5 rounded-lg border border-rose-200 text-rose-600 hover:bg-rose-50 font-bold text-[11px] transition-colors flex items-center gap-1"
                            title="Reject Application"
                          >
                            <X className="w-3.5 h-3.5" />
                            <span>Reject</span>
                          </button>
                        )}
                      </div>
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {rejectModalProvider && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full border border-slate-200 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-navy-900">
              Reject Provider Application
            </h3>
            <p className="text-xs text-slate-500">
              Provide feedback reason for rejecting {rejectModalProvider.business_name}.
            </p>

            <form onSubmit={handleReject} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Rejection Reason
                </label>
                <textarea
                  rows={3}
                  required
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="e.g. Incomplete workshop address, missing trade license number."
                  className="w-full p-2.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-rose-400"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setRejectModalProvider(null)}
                  className="flex-1 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-xl bg-rose-600 text-white text-xs font-bold hover:bg-rose-700"
                >
                  Confirm Rejection
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminProvidersPage;
