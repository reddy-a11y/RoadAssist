import React, { useState, useEffect } from 'react';
import { useSocket } from '../../context/SocketContext';
import api from '../../services/api';
import StatusBadge from '../../components/StatusBadge';
import { FileText, Search, MapPin, Phone, Car, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';

const AdminRequestsPage = () => {
  const socket = useSocket();
  const [requests, setRequests] = useState([]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const categories = [
    'all',
    'Flat Tyre',
    'Battery Failure',
    'Fuel Shortage',
    'Engine Failure',
    'Overheating',
    'Accident',
    'Other Mechanical Issues'
  ];

  const fetchRequests = async () => {
    try {
      setIsLoading(true);
      const res = await api.get(
        `/admin/requests?status=${statusFilter}&category=${categoryFilter}&search=${encodeURIComponent(search)}`
      );
      if (res.success) {
        setRequests(res.requests || []);
      }
    } catch (err) {
      toast.error('Failed to load platform requests: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [statusFilter, categoryFilter, search]);

  useEffect(() => {
    if (!socket) return;
    socket.on('request_created', () => fetchRequests());
    socket.on('request_status_updated', () => fetchRequests());
    return () => {
      socket.off('request_created');
      socket.off('request_status_updated');
    };
  }, [socket]);

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-16">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-navy-900 tracking-tight">Platform Incident Monitoring</h2>
          <p className="text-xs text-slate-500">
            Real-time feed of all roadside assistance requests logged across India
          </p>
        </div>

        {/* Status Filters */}
        <div className="flex items-center gap-1.5 bg-white p-1 rounded-xl border border-slate-200 overflow-x-auto scrollbar-none">
          {['all', 'pending', 'accepted', 'in_progress', 'completed', 'cancelled'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition-all whitespace-nowrap ${
                statusFilter === st
                  ? 'bg-navy-900 text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              {st === 'in_progress' ? 'In Progress' : st}
            </button>
          ))}
        </div>
      </div>

      {/* Filter Row: Category + Search */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="relative sm:col-span-2">
          <Search className="w-4 h-4 text-slate-400 absolute left-4 top-3.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by request code, customer name, or location..."
            className="w-full pl-11 pr-4 py-2.5 bg-white text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-blue"
          />
        </div>

        <div>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="w-full px-3.5 py-2.5 text-xs font-bold bg-white rounded-xl border border-slate-200"
          >
            {categories.map((c) => (
              <option key={c} value={c}>
                Category: {c === 'all' ? 'All Issues' : c}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="p-12 text-center text-xs text-slate-400">Loading incident registry...</div>
      ) : requests.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 text-xs text-slate-500">
          No assistance requests match current filters.
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[11px]">
                  <th className="py-3.5 px-4">Code & Category</th>
                  <th className="py-3.5 px-4">Customer</th>
                  <th className="py-3.5 px-4">Assigned Partner</th>
                  <th className="py-3.5 px-4">Breakdown Location</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Final Cost</th>
                  <th className="py-3.5 px-4">Logged Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {requests.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-mono font-bold text-navy-900">{r.request_code}</div>
                      <div className="text-[11px] font-semibold text-brand-blue">{r.category}</div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900">{r.customer_name}</div>
                      <div className="text-[11px] text-slate-400">{r.customer_phone}</div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-800">
                        {r.provider_name || <span className="text-amber-600 italic">Unassigned</span>}
                      </div>
                      {r.provider_phone && <div className="text-[11px] text-slate-400">{r.provider_phone}</div>}
                    </td>

                    <td className="py-3.5 px-4 max-w-[200px]">
                      <div className="truncate text-slate-700 font-medium" title={r.address}>
                        {r.address}
                      </div>
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <StatusBadge status={r.status} size="sm" />
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap font-bold text-emerald-600">
                      ₹{r.final_cost || r.estimated_cost}
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap text-slate-400 text-[11px]">
                      {new Date(r.created_at).toLocaleString([], {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminRequestsPage;
