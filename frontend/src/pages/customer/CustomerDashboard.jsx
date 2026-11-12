import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import StatusBadge from '../../components/StatusBadge';
import {
  Car,
  AlertOctagon,
  MapPin,
  Clock,
  ShieldAlert,
  ArrowRight,
  Wrench,
  Star,
  CheckCircle2,
  Plus,
  Radio,
  ExternalLink
} from 'lucide-react';
import { toast } from 'sonner';

const CustomerDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [activeRequest, setActiveRequest] = useState(null);
  const [vehicles, setVehicles] = useState([]);
  const [recentRequests, setRecentRequests] = useState([]);
  const [nearbyProviders, setNearbyProviders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentLocation, setCurrentLocation] = useState({
    address: 'Madhapur, Hitec City, Hyderabad',
    lat: 17.4485,
    lng: 78.3748
  });

  // Fetch dashboard data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);

        // 1. Get vehicles
        const vRes = await api.get('/vehicles');
        if (vRes.success) {
          setVehicles(vRes.vehicles || []);
        }

        // 2. Get customer requests
        const rRes = await api.get('/requests/my');
        if (rRes.success) {
          const list = rRes.requests || [];
          setRecentRequests(list.slice(0, 5));
          // Look for active in-progress request
          const active = list.find((r) =>
            ['pending', 'accepted', 'on_the_way', 'in_progress'].includes(r.status)
          );
          setActiveRequest(active || null);
        }

        // 3. Get nearby verified providers
        const pRes = await api.get('/providers/nearby?lat=17.4485&lng=78.3748');
        if (pRes.success) {
          setNearbyProviders((pRes.providers || []).slice(0, 4));
        }
      } catch (err) {
        console.warn('Dashboard fetch error:', err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();

    // Acquire live GPS if possible
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setCurrentLocation((prev) => ({
            ...prev,
            lat: pos.coords.latitude,
            lng: pos.coords.longitude
          }));
        },
        () => {}
      );
    }
  }, []);

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-navy-900 via-navy-950 to-brand-blue rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-semibold border border-blue-400/20">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>24/7 Roadside Network Active</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
            Hello, {user?.name}! 👋
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
            Stranded or need immediate assistance? Report your breakdown or explore verified rescue mechanics near you.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Link
            to="/report-breakdown"
            className="px-6 py-3.5 rounded-xl bg-brand-orange hover:bg-orange-600 text-white font-bold text-sm transition-all shadow-lg shadow-orange-500/20 flex items-center gap-2"
          >
            <AlertOctagon className="w-4 h-4" />
            <span>Report Breakdown</span>
          </Link>
          <Link
            to="/find-assistance"
            className="px-5 py-3.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-sm transition-all border border-white/20 flex items-center gap-2"
          >
            <MapPin className="w-4 h-4 text-blue-300" />
            <span>Find Nearby</span>
          </Link>
        </div>
      </div>

      {/* Active Assistance Alert Card (if any) */}
      {activeRequest && (
        <div className="bg-white border-2 border-brand-blue rounded-2xl p-5 sm:p-6 shadow-xl shadow-blue-500/10 space-y-4 animate-in fade-in">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="relative flex h-3.5 w-3.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-blue opacity-75" />
                <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-brand-blue" />
              </span>
              <div>
                <span className="text-xs font-bold text-brand-blue uppercase tracking-wider block">
                  Active Roadside Incident
                </span>
                <h3 className="text-base sm:text-lg font-bold text-navy-900">
                  {activeRequest.category} • {activeRequest.request_code}
                </h3>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <StatusBadge status={activeRequest.status} />
              <Link
                to={`/tracking?id=${activeRequest.id}`}
                className="px-4 py-2 rounded-xl bg-navy-900 hover:bg-navy-800 text-white text-xs font-bold transition-colors flex items-center gap-1.5 shadow-sm"
              >
                <Radio className="w-3.5 h-3.5 text-blue-400" />
                <span>Open Live Tracker</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-slate-100 text-xs">
            <div>
              <span className="text-slate-400 font-medium block">Breakdown Location</span>
              <span className="font-semibold text-slate-800 truncate block">{activeRequest.address}</span>
            </div>
            <div>
              <span className="text-slate-400 font-medium block">Assigned Provider</span>
              <span className="font-semibold text-slate-800 block">
                {activeRequest.provider_name || 'Dispatching Nearest Specialist...'}
              </span>
            </div>
            <div>
              <span className="text-slate-400 font-medium block">Estimated Cost</span>
              <span className="font-extrabold text-emerald-600 text-sm block">
                ₹{activeRequest.final_cost || activeRequest.estimated_cost}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Main Grid: Saved Vehicles & Nearby Providers */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left: Saved Vehicles & Quick Breakdown Triggers */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Vehicles Card */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-blue-50 text-brand-blue flex items-center justify-center">
                  <Car className="w-4 h-4" />
                </div>
                <h3 className="text-base font-bold text-navy-900">My Saved Vehicles</h3>
              </div>
              <Link
                to="/vehicles"
                className="text-xs font-bold text-brand-blue hover:text-blue-700 flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Manage Vehicles</span>
              </Link>
            </div>

            {vehicles.length === 0 ? (
              <div className="text-center py-8 px-4 rounded-xl border border-dashed border-slate-200 space-y-3">
                <Car className="w-10 h-10 text-slate-300 mx-auto" />
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  No vehicles saved yet. Add your car or motorcycle to speed up emergency dispatch.
                </p>
                <Link
                  to="/vehicles"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add First Vehicle</span>
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {vehicles.map((v) => (
                  <div
                    key={v.id}
                    className={`p-4 rounded-xl border transition-all ${
                      v.is_default
                        ? 'bg-blue-50/50 border-blue-200'
                        : 'bg-slate-50/60 border-slate-200'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-white border text-slate-600">
                        {v.vehicle_type}
                      </span>
                      {v.is_default && (
                        <span className="text-[10px] font-bold text-brand-blue flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> Default
                        </span>
                      )}
                    </div>
                    <div className="font-bold text-sm text-navy-900">
                      {v.make} {v.model}
                    </div>
                    <div className="text-xs font-mono font-semibold text-slate-500 mt-1">
                      {v.registration_number} ({v.year})
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Previous Requests Table */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <Clock className="w-4 h-4" />
                </div>
                <h3 className="text-base font-bold text-navy-900">Recent Service History</h3>
              </div>
              <Link
                to="/history"
                className="text-xs font-bold text-brand-blue hover:text-blue-700"
              >
                View All
              </Link>
            </div>

            {recentRequests.length === 0 ? (
              <p className="text-xs text-slate-400 py-4 text-center">No previous requests found.</p>
            ) : (
              <div className="divide-y divide-slate-100">
                {recentRequests.map((req) => (
                  <div key={req.id} className="py-3 flex items-center justify-between gap-3 text-xs">
                    <div>
                      <div className="font-bold text-slate-900">{req.category}</div>
                      <div className="text-slate-500 text-[11px]">
                        {new Date(req.created_at).toLocaleDateString()} • {req.request_code}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <StatusBadge status={req.status} size="sm" />
                      <Link
                        to={`/tracking?id=${req.id}`}
                        className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-600"
                        title="View details"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* Right: Nearby Providers Quick Directory */}
        <div className="lg:col-span-5 space-y-6">
          
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <Wrench className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-navy-900">Nearby Rescuers</h3>
                  <p className="text-[11px] text-slate-400">Verified & active in your zone</p>
                </div>
              </div>
              <Link
                to="/find-assistance"
                className="text-xs font-bold text-brand-blue hover:text-blue-700"
              >
                Map View
              </Link>
            </div>

            <div className="space-y-3">
              {nearbyProviders.map((p) => (
                <div
                  key={p.id}
                  className="p-3.5 rounded-xl border border-slate-200/80 hover:border-brand-blue hover:shadow-sm transition-all space-y-2 bg-slate-50/40"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="text-xs font-bold text-navy-900">{p.business_name}</h4>
                      <p className="text-[11px] text-slate-500 truncate max-w-[200px]">{p.address}</p>
                    </div>
                    <div className="flex items-center gap-1 text-xs font-bold text-slate-800 bg-white px-2 py-0.5 rounded-md border border-slate-200">
                      <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                      <span>{Number(p.rating).toFixed(1)}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[11px] pt-1 border-t border-slate-200/60">
                    <span className="font-semibold text-brand-blue">~{p.distanceKm} km away</span>
                    <span className="font-bold text-emerald-600">Base ₹{p.base_charge}</span>
                    <Link
                      to={`/report-breakdown?providerId=${p.id}`}
                      className="font-bold text-brand-blue hover:underline"
                    >
                      Request &rarr;
                    </Link>
                  </div>
                </div>
              ))}
            </div>

            <Link
              to="/find-assistance"
              className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
            >
              <span>Explore All Mechanics on Map</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Quick SOS Card */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-red-50 to-rose-50 border border-red-200 space-y-3">
            <div className="flex items-center gap-2 text-red-700 font-bold text-sm">
              <ShieldAlert className="w-5 h-5 text-red-600" />
              <span>Emergency SOS Fast Access</span>
            </div>
            <p className="text-xs text-red-800 leading-relaxed">
              Facing immediate roadside danger or accident? Access 1-click dialer for Police (100) or Ambulance (108).
            </p>
            <div className="grid grid-cols-2 gap-2 pt-1">
              <a
                href="tel:112"
                className="py-2 px-3 rounded-lg bg-red-600 text-white font-bold text-xs text-center hover:bg-red-700 shadow-sm"
              >
                Dial 112
              </a>
              <a
                href="tel:108"
                className="py-2 px-3 rounded-lg bg-rose-600 text-white font-bold text-xs text-center hover:bg-rose-700 shadow-sm"
              >
                Ambulance 108
              </a>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};

export default CustomerDashboard;
