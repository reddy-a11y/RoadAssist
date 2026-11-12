import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import StatusBadge from '../../components/StatusBadge';
import {
  Users,
  Wrench,
  AlertOctagon,
  CheckCircle2,
  TrendingUp,
  ShieldAlert,
  ArrowRight,
  Clock,
  Star,
  DollarSign
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid
} from 'recharts';
import { toast } from 'sonner';

const COLORS = ['#2563EB', '#101B35', '#F97316', '#10B981', '#8B5CF6', '#EC4899', '#64748B'];

const AdminDashboard = () => {
  const [analytics, setAnalytics] = useState(null);
  const [categoryDist, setCategoryDist] = useState([]);
  const [statusDist, setStatusDist] = useState([]);
  const [trends, setTrends] = useState([]);
  const [recentRequests, setRecentRequests] = useState([]);
  const [topProviders, setTopProviders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchAnalytics = async () => {
    try {
      setIsLoading(true);
      const res = await api.get('/admin/analytics');
      if (res.success) {
        setAnalytics(res.analytics);
        setCategoryDist(res.categoryDistribution || []);
        setStatusDist(res.statusDistribution || []);
        setTrends(res.trends || []);
        setRecentRequests(res.recentRequests || []);
        setTopProviders(res.topProviders || []);
      }
    } catch (err) {
      toast.error('Failed to load administrator analytics: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  if (isLoading && !analytics) {
    return <div className="p-12 text-center text-xs text-slate-400">Loading admin operations hub...</div>;
  }

  // Format trend data for AreaChart
  const formattedTrends = trends.map((t) => ({
    date: new Date(t.date).toLocaleDateString([], { month: 'short', day: 'numeric' }),
    requests: t.requests_count,
    completed: t.completed_count,
    revenue: parseFloat(t.revenue || 0)
  }));

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-16">
      
      {/* Top Banner */}
      <div className="bg-navy-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6 border border-slate-800">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-400/20">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Platform Operations Hub</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
            Administrator Executive Dashboard
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 max-w-xl">
            Live telemetry of customer breakdown requests, service partner verifications, and financial turnover.
          </p>
        </div>

        {analytics?.pendingVerifications > 0 && (
          <Link
            to="/admin/providers?status=pending"
            className="px-5 py-3 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold transition-all shadow-lg shadow-amber-500/25 flex items-center gap-2"
          >
            <ShieldAlert className="w-4 h-4" />
            <span>{analytics.pendingVerifications} Provider Approvals Pending</span>
          </Link>
        )}
      </div>

      {/* KPI Stats Counter Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1.5">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Customers</span>
          <div className="text-2xl font-black text-navy-900">{analytics?.totalCustomers || 0}</div>
          <span className="text-[10px] text-slate-400">Registered drivers</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1.5">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Providers</span>
          <div className="text-2xl font-black text-navy-900">{analytics?.totalProviders || 0}</div>
          <span className="text-[10px] text-emerald-600 font-semibold">
            {analytics?.verifiedProviders || 0} verified
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1.5">
          <span className="text-[11px] font-bold text-amber-600 uppercase tracking-wider block">Pending Verif.</span>
          <div className="text-2xl font-black text-amber-600">{analytics?.pendingVerifications || 0}</div>
          <span className="text-[10px] text-slate-400">Action needed</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1.5">
          <span className="text-[11px] font-bold text-brand-blue uppercase tracking-wider block">Total Incidents</span>
          <div className="text-2xl font-black text-brand-blue">{analytics?.totalRequests || 0}</div>
          <span className="text-[10px] text-slate-400">All-time calls</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1.5">
          <span className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider block">Completed</span>
          <div className="text-2xl font-black text-emerald-600">{analytics?.completedRequests || 0}</div>
          <span className="text-[10px] text-slate-400">Successful fixes</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1.5">
          <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">Platform GMV</span>
          <div className="text-2xl font-black text-emerald-700">
            ₹{analytics?.totalRevenue ? Number(analytics.totalRevenue).toLocaleString() : '0'}
          </div>
          <span className="text-[10px] text-slate-400">Gross revenue</span>
        </div>

      </div>

      {/* Analytics Charts (Recharts) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Incident Trend Graph (AreaChart) */}
        <div className="lg:col-span-8 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-navy-900">Incident Volume & Resolutions</h3>
              <p className="text-xs text-slate-400">Daily breakdown trends across metropolitan zones</p>
            </div>
            <span className="text-xs font-bold text-brand-blue bg-blue-50 px-2.5 py-1 rounded-full">
              Live Feed
            </span>
          </div>

          <div className="h-72 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={formattedTrends}>
                <defs>
                  <linearGradient id="colorRequests" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563EB" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#2563EB" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorCompleted" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#101B35', border: 'none', borderRadius: '12px', color: '#fff', fontSize: '12px' }}
                />
                <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                <Area type="monotone" dataKey="requests" stroke="#2563EB" fillOpacity={1} fill="url(#colorRequests)" name="Reported Incidents" />
                <Area type="monotone" dataKey="completed" stroke="#10B981" fillOpacity={1} fill="url(#colorCompleted)" name="Completed Rescues" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Breakdown Problem Categories (BarChart) */}
        <div className="lg:col-span-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <div>
            <h3 className="text-base font-bold text-navy-900">Breakdown Distribution</h3>
            <p className="text-xs text-slate-400">Most frequent mechanical issues</p>
          </div>

          <div className="h-72 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryDist} layout="vertical" margin={{ left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis type="number" stroke="#94a3b8" fontSize={10} />
                <YAxis dataKey="category" type="category" stroke="#64748B" fontSize={11} width={80} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#101B35', border: 'none', borderRadius: '12px', color: '#fff', fontSize: '12px' }}
                />
                <Bar dataKey="count" fill="#2563EB" radius={[0, 6, 6, 0]} name="Incidents" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* Tables: Top Providers & Recent Incidents */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Top Performing Providers */}
        <div className="lg:col-span-5 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-navy-900">Top Service Partners</h3>
            <Link to="/admin/providers" className="text-xs font-bold text-brand-blue hover:underline">
              View All
            </Link>
          </div>

          <div className="divide-y divide-slate-100">
            {topProviders.map((p) => (
              <div key={p.id} className="py-3 flex items-center justify-between text-xs">
                <div>
                  <div className="font-bold text-navy-900">{p.business_name}</div>
                  <div className="text-slate-400 text-[11px]">{p.owner_name} • {p.email}</div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-amber-600 flex items-center gap-1 justify-end">
                    <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                    <span>{Number(p.rating).toFixed(1)}</span>
                  </div>
                  <div className="text-[11px] text-slate-500 font-semibold">
                    {p.total_services_completed} jobs
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Platform Incidents */}
        <div className="lg:col-span-7 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-navy-900">Recent Assistance Incidents</h3>
            <Link to="/admin/requests" className="text-xs font-bold text-brand-blue hover:underline">
              Live Monitor
            </Link>
          </div>

          <div className="divide-y divide-slate-100 overflow-x-auto">
            {recentRequests.map((req) => (
              <div key={req.id} className="py-3 flex items-center justify-between gap-4 text-xs whitespace-nowrap">
                <div>
                  <div className="font-bold text-navy-900 flex items-center gap-2">
                    <span className="font-mono text-[11px] text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                      {req.request_code}
                    </span>
                    <span>{req.category}</span>
                  </div>
                  <div className="text-slate-400 text-[11px] mt-0.5">
                    Customer: {req.customer_name} • Partner: {req.provider_name || 'Unassigned'}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <StatusBadge status={req.status} size="sm" />
                  <span className="font-bold text-emerald-600">₹{req.final_cost || 450}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
};

export default AdminDashboard;
