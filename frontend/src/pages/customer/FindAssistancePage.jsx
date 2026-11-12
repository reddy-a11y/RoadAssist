import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import LeafletMap from '../../components/LeafletMap';
import {
  MapPin,
  Star,
  Wrench,
  Clock,
  ShieldCheck,
  Filter,
  ArrowRight,
  SlidersHorizontal,
  Navigation,
  Phone
} from 'lucide-react';
import { toast } from 'sonner';

const FindAssistancePage = () => {
  const navigate = useNavigate();

  const [category, setCategory] = useState('All');
  const [userLocation, setUserLocation] = useState({ lat: 17.4485, lng: 78.3748 });
  const [providers, setProviders] = useState([]);
  const [selectedProvider, setSelectedProvider] = useState(null);
  const [sortBy, setSortBy] = useState('smart_match');
  const [maxDistance, setMaxDistance] = useState(40);
  const [isLoading, setIsLoading] = useState(true);

  const categories = [
    'All',
    'Flat Tyre',
    'Battery Failure',
    'Fuel Shortage',
    'Engine Failure',
    'Overheating',
    'Accident',
    'Other Mechanical Issues'
  ];

  // Fetch nearby providers
  const fetchProviders = async () => {
    try {
      setIsLoading(true);
      const catParam = category === 'All' ? '' : `&category=${encodeURIComponent(category)}`;
      const res = await api.get(
        `/providers/nearby?lat=${userLocation.lat}&lng=${userLocation.lng}&maxDistance=${maxDistance}&sortBy=${sortBy}${catParam}`
      );

      if (res.success) {
        setProviders(res.providers || []);
        if (res.providers?.length > 0 && !selectedProvider) {
          setSelectedProvider(res.providers[0]);
        }
      }
    } catch (err) {
      toast.error('Failed to load nearby providers: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProviders();
  }, [category, sortBy, maxDistance, userLocation]);

  // Acquire live GPS
  const handleAcquireLocation = () => {
    if ('geolocation' in navigator) {
      toast.loading('Acquiring current GPS...', { id: 'gps' });
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUserLocation({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude
          });
          toast.success('Location updated!', { id: 'gps' });
        },
        (err) => {
          toast.error(err.message, { id: 'gps' });
        }
      );
    }
  };

  const handleRequestProvider = (provider) => {
    navigate(`/report-breakdown?providerId=${provider.id}&category=${encodeURIComponent(category === 'All' ? 'Flat Tyre' : category)}`);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      
      {/* Top Filter Bar */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-black text-navy-900 tracking-tight">
              Nearby Rescue Mechanics & Garages
            </h2>
            <p className="text-xs text-slate-500">
              Interactive OpenStreetMap tracking verified specialists around your location
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleAcquireLocation}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-50 text-brand-blue border border-blue-200 text-xs font-bold hover:bg-blue-100 transition-colors"
            >
              <Navigation className="w-3.5 h-3.5" />
              <span>Recenter My GPS</span>
            </button>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="text-xs font-semibold px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-brand-blue"
            >
              <option value="smart_match">Sort: Smart AI Match</option>
              <option value="distance">Sort: Nearest Distance</option>
              <option value="rating">Sort: Highest Rating</option>
              <option value="cost">Sort: Lowest Cost</option>
            </select>
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                category === cat
                  ? 'bg-navy-900 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Map & Provider Split Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Leaflet Interactive Map View */}
        <div className="lg:col-span-7 bg-white rounded-2xl p-3 border border-slate-200 shadow-sm overflow-hidden">
          <div className="h-[480px] w-full rounded-xl overflow-hidden relative">
            <LeafletMap
              center={[userLocation.lat, userLocation.lng]}
              zoom={13}
              userLocation={userLocation}
              providers={providers}
              selectedProviderId={selectedProvider?.id}
              onSelectProvider={(p) => setSelectedProvider(p)}
              className="h-full w-full"
            />
            
            {/* Map Legend Overlay */}
            <div className="absolute bottom-3 left-3 z-[400] bg-white/95 backdrop-blur-md px-3 py-2 rounded-xl border border-slate-200 shadow-md text-[11px] font-semibold text-slate-700 flex items-center gap-3">
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-brand-blue border-2 border-white shadow-sm inline-block" />
                <span>Your Location</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-navy-900 border-2 border-white shadow-sm inline-block" />
                <span>Verified Mechanic</span>
              </span>
            </div>
          </div>
        </div>

        {/* Provider Cards List */}
        <div className="lg:col-span-5 space-y-3.5 max-h-[500px] overflow-y-auto pr-1">
          {isLoading ? (
            <div className="p-8 text-center text-xs text-slate-400">Loading nearby providers...</div>
          ) : providers.length === 0 ? (
            <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 text-xs text-slate-500">
              No verified providers found within {maxDistance}km for category "{category}".
            </div>
          ) : (
            providers.map((p) => {
              const isSelected = selectedProvider?.id === p.id;
              return (
                <div
                  key={p.id}
                  onClick={() => setSelectedProvider(p)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-blue-50/60 border-brand-blue shadow-md shadow-blue-500/10'
                      : 'bg-white border-slate-200 hover:border-slate-300 shadow-sm'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-bold text-navy-900">{p.business_name}</h3>
                        {p.badge && (
                          <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-blue-100 text-brand-blue">
                            {p.badge}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 truncate max-w-[240px]">{p.address}</p>
                    </div>

                    <div className="flex items-center gap-1 text-xs font-bold text-slate-800 bg-white px-2 py-1 rounded-lg border border-slate-200 shadow-sm">
                      <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                      <span>{Number(p.rating).toFixed(1)}</span>
                    </div>
                  </div>

                  {/* Highlights Grid */}
                  <div className="grid grid-cols-3 gap-2 py-2 border-y border-slate-100 text-[11px]">
                    <div>
                      <span className="text-slate-400 block">Distance</span>
                      <span className="font-bold text-brand-blue">~{p.distanceKm} km</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block">ETA</span>
                      <span className="font-bold text-slate-800">{p.etaMins} mins</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Est. Cost</span>
                      <span className="font-bold text-emerald-600">₹{p.estimatedCost}</span>
                    </div>
                  </div>

                  <div className="pt-2 flex items-center justify-between">
                    <span className="text-[11px] text-slate-500">
                      {p.total_services_completed} rescues completed
                    </span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRequestProvider(p);
                      }}
                      className="px-3 py-1.5 rounded-xl bg-navy-900 hover:bg-brand-blue text-white text-xs font-bold transition-colors flex items-center gap-1 shadow-sm"
                    >
                      <span>Request Assistance</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

      </div>

    </div>
  );
};

export default FindAssistancePage;
