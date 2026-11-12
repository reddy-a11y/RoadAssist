import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import SmartSuggestionCard from '../../components/SmartSuggestionCard';
import {
  Car,
  AlertOctagon,
  MapPin,
  Upload,
  Camera,
  Wrench,
  Check,
  Disc,
  Zap,
  Fuel,
  Thermometer,
  Truck,
  HelpCircle,
  ArrowRight,
  IndianRupee,
  ShieldCheck,
  Navigation
} from 'lucide-react';
import { toast } from 'sonner';

const BreakdownReportPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const initialCat = searchParams.get('category') || 'Flat Tyre';
  const initialProviderId = searchParams.get('providerId') || '';

  const [category, setCategory] = useState(initialCat);
  const [vehicles, setVehicles] = useState([]);
  const [selectedVehicleId, setSelectedVehicleId] = useState('');
  const [description, setDescription] = useState('');
  const [address, setAddress] = useState('Inorbit Mall Road, Madhapur, Hyderabad');
  const [latitude, setLatitude] = useState(17.4485);
  const [longitude, setLongitude] = useState(78.3748);
  const [providerId, setProviderId] = useState(initialProviderId);
  const [providersList, setProvidersList] = useState([]);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGpsLoading, setIsGpsLoading] = useState(false);

  const categories = [
    { name: 'Flat Tyre', icon: Disc, color: 'text-amber-500' },
    { name: 'Battery Failure', icon: Zap, color: 'text-yellow-500' },
    { name: 'Fuel Shortage', icon: Fuel, color: 'text-blue-500' },
    { name: 'Engine Failure', icon: Wrench, color: 'text-rose-500' },
    { name: 'Overheating', icon: Thermometer, color: 'text-red-500' },
    { name: 'Accident', icon: Truck, color: 'text-red-600' },
    { name: 'Other Mechanical Issues', icon: HelpCircle, color: 'text-indigo-500' }
  ];

  // Fetch saved vehicles & nearby providers
  useEffect(() => {
    const fetchPrerequisites = async () => {
      try {
        const [vRes, pRes] = await Promise.all([
          api.get('/vehicles'),
          api.get(`/providers/nearby?lat=${latitude}&lng=${longitude}&category=${encodeURIComponent(category)}`)
        ]);

        if (vRes.success) {
          setVehicles(vRes.vehicles || []);
          const def = vRes.vehicles?.find((v) => v.is_default);
          if (def) setSelectedVehicleId(def.id.toString());
          else if (vRes.vehicles?.length > 0) setSelectedVehicleId(vRes.vehicles[0].id.toString());
        }

        if (pRes.success) {
          setProvidersList(pRes.providers || []);
        }
      } catch (e) {
        console.warn('Init error:', e.message);
      }
    };

    fetchPrerequisites();
  }, [category]);

  // Handle GPS location acquisition
  const handleAcquireLocation = () => {
    if (!('geolocation' in navigator)) {
      toast.error('Geolocation is not supported by your browser.');
      return;
    }

    setIsGpsLoading(true);
    toast.loading('Acquiring high-accuracy GPS coordinates...', { id: 'gps' });

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        setLatitude(lat);
        setLongitude(lng);

        // Attempt reverse geocoding via OpenStreetMap Nominatim
        try {
          const geoRes = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`
          );
          const geoData = await geoRes.json();
          if (geoData?.display_name) {
            setAddress(geoData.display_name);
          } else {
            setAddress(`GPS Location (${lat.toFixed(5)}, ${lng.toFixed(5)})`);
          }
        } catch (e) {
          setAddress(`GPS Location (${lat.toFixed(5)}, ${lng.toFixed(5)})`);
        }

        setIsGpsLoading(false);
        toast.success('Live location updated successfully!', { id: 'gps' });
      },
      (err) => {
        setIsGpsLoading(false);
        toast.error(`GPS Error: ${err.message}. Using default city coordinates.`, { id: 'gps' });
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size cannot exceed 5MB.');
        return;
      }
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!category || !description.trim() || !address.trim()) {
      toast.error('Please fill in category, description, and location.');
      return;
    }

    try {
      setIsSubmitting(true);
      const formData = new FormData();
      formData.append('category', category);
      formData.append('description', description.trim());
      formData.append('address', address.trim());
      formData.append('latitude', latitude.toString());
      formData.append('longitude', longitude.toString());
      if (selectedVehicleId) formData.append('vehicleId', selectedVehicleId);
      if (providerId) formData.append('providerId', providerId);
      if (imageFile) formData.append('image', imageFile);

      const res = await api.post('/requests', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (res.success && res.request) {
        toast.success('Assistance request dispatched successfully!');
        navigate(`/tracking?id=${res.request.id}`);
      }
    } catch (err) {
      toast.error(err.message || 'Failed to submit assistance request.');
      if (err.message.includes('active request')) {
        navigate('/dashboard');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Upfront estimated pricing calculation
  const selectedProvider = providersList.find((p) => p.id.toString() === providerId);
  const estimatedDisplayCost = selectedProvider
    ? selectedProvider.estimatedCost
    : 450;

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-16">
      
      {/* Page Title */}
      <div className="space-y-1">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-50 text-red-600 border border-red-200 text-xs font-bold tracking-wide uppercase">
          <AlertOctagon className="w-3.5 h-3.5" />
          <span>Emergency Assistance Request</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-black text-navy-900 tracking-tight">
          Report Vehicle Breakdown
        </h2>
        <p className="text-xs sm:text-sm text-slate-500">
          Provide your problem details and location to instantly dispatch the nearest rescue specialist.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        
        {/* 1. Select Problem Category */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-navy-900 uppercase tracking-wider flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-navy-900 text-white text-xs flex items-center justify-center font-bold">1</span>
              <span>Select Breakdown Category</span>
            </h3>
            <span className="text-xs text-brand-blue font-semibold">Required</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {categories.map((cat) => {
              const Icon = cat.icon;
              const isSelected = category === cat.name;
              return (
                <button
                  type="button"
                  key={cat.name}
                  onClick={() => setCategory(cat.name)}
                  className={`p-4 rounded-xl border text-left transition-all flex flex-col justify-between h-28 ${
                    isSelected
                      ? 'bg-blue-50/80 border-brand-blue shadow-md shadow-blue-500/10'
                      : 'bg-slate-50/50 border-slate-200 hover:bg-slate-100/70'
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <Icon className={`w-6 h-6 ${cat.color}`} />
                    {isSelected && (
                      <span className="w-4 h-4 rounded-full bg-brand-blue text-white flex items-center justify-center">
                        <Check className="w-3 h-3" />
                      </span>
                    )}
                  </div>
                  <span className={`text-xs font-bold ${isSelected ? 'text-brand-blue' : 'text-slate-800'}`}>
                    {cat.name}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Smart Breakdown Dynamic Suggestions Card */}
          <div className="pt-2">
            <SmartSuggestionCard category={category} />
          </div>
        </div>

        {/* 2. Vehicle Selection */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-navy-900 uppercase tracking-wider flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-navy-900 text-white text-xs flex items-center justify-center font-bold">2</span>
              <span>Affected Vehicle</span>
            </h3>
            <button
              type="button"
              onClick={() => navigate('/vehicles')}
              className="text-xs font-bold text-brand-blue hover:underline"
            >
              + Add New Vehicle
            </button>
          </div>

          {vehicles.length === 0 ? (
            <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-center justify-between">
              <span>You have no saved vehicles yet. You can add one or proceed with quick registration.</span>
              <button
                type="button"
                onClick={() => navigate('/vehicles')}
                className="px-3 py-1.5 rounded-lg bg-amber-600 text-white font-bold text-xs"
              >
                Add Vehicle
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {vehicles.map((v) => {
                const isSelected = selectedVehicleId === v.id.toString();
                return (
                  <label
                    key={v.id}
                    onClick={() => setSelectedVehicleId(v.id.toString())}
                    className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                      isSelected
                        ? 'bg-blue-50 border-brand-blue text-brand-blue font-bold shadow-sm'
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <div>
                      <div className="text-xs font-bold">{v.make} {v.model}</div>
                      <div className="text-[11px] font-mono text-slate-500">{v.registration_number}</div>
                    </div>
                    {isSelected && <Check className="w-4 h-4 text-brand-blue" />}
                  </label>
                );
              })}
            </div>
          )}
        </div>

        {/* 3. Location Details & GPS Auto-Fix */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-navy-900 uppercase tracking-wider flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-navy-900 text-white text-xs flex items-center justify-center font-bold">3</span>
              <span>Breakdown Location</span>
            </h3>
            <button
              type="button"
              onClick={handleAcquireLocation}
              disabled={isGpsLoading}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 text-brand-blue border border-blue-200 text-xs font-bold hover:bg-blue-100 transition-colors disabled:opacity-50"
            >
              <Navigation className="w-3.5 h-3.5" />
              <span>{isGpsLoading ? 'Locating...' : 'Use Current GPS'}</span>
            </button>
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Exact Road / Highway / Landmark Description
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  required
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="e.g. Near Inorbit Mall Flyover, Pillar No. 42, Hitec City"
                  className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-blue"
                />
              </div>
            </div>

            <div className="flex items-center gap-4 text-xs font-mono text-slate-500 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
              <span>Latitude: <strong>{Number(latitude).toFixed(5)}</strong></span>
              <span>Longitude: <strong>{Number(longitude).toFixed(5)}</strong></span>
            </div>
          </div>
        </div>

        {/* 4. Problem Description & Photo Upload */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-navy-900 uppercase tracking-wider flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-navy-900 text-white text-xs flex items-center justify-center font-bold">4</span>
            <span>Problem Description & Photos</span>
          </h3>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Describe the Breakdown Symptoms
              </label>
              <textarea
                rows={3}
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g. Right rear tyre completely deflated after hitting debris. Vehicle parked safely on shoulder with hazard lights on."
                className="w-full text-sm rounded-xl border border-slate-300 p-3 focus:outline-none focus:ring-2 focus:ring-brand-blue resize-none"
              />
            </div>

            {/* Photo Upload */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Attach Image of Breakdown (Optional)
              </label>
              <div className="flex items-center gap-4">
                <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-50 text-xs font-bold text-slate-700 transition-colors">
                  <Camera className="w-4 h-4 text-brand-blue" />
                  <span>Choose Photo</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </label>
                {imagePreview && (
                  <div className="relative w-14 h-14 rounded-xl overflow-hidden border border-slate-200 shadow-sm">
                    <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => {
                        setImageFile(null);
                        setImagePreview(null);
                      }}
                      className="absolute top-0 right-0 bg-red-600 text-white rounded-bl p-0.5 text-[10px]"
                    >
                      ✕
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* 5. Provider Selection (Auto-match or Specific) */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-navy-900 uppercase tracking-wider flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-navy-900 text-white text-xs flex items-center justify-center font-bold">5</span>
              <span>Service Provider Selection</span>
            </h3>
            <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" /> All Verified
            </span>
          </div>

          <div className="space-y-3">
            <label
              onClick={() => setProviderId('')}
              className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                providerId === ''
                  ? 'bg-blue-50 border-brand-blue font-bold text-brand-blue'
                  : 'bg-slate-50 border-slate-200 text-slate-700'
              }`}
            >
              <div>
                <div className="text-xs font-bold">Auto-Match Nearest Available Provider (Recommended)</div>
                <div className="text-[11px] text-slate-500">System automatically dispatches the closest top-rated mechanic.</div>
              </div>
              {providerId === '' && <Check className="w-4 h-4 text-brand-blue" />}
            </label>

            {providersList.map((p) => {
              const isSelected = providerId === p.id.toString();
              return (
                <label
                  key={p.id}
                  onClick={() => setProviderId(p.id.toString())}
                  className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                    isSelected
                      ? 'bg-blue-50 border-brand-blue font-bold text-brand-blue'
                      : 'bg-slate-50 border-slate-200 text-slate-700'
                  }`}
                >
                  <div>
                    <div className="text-xs font-bold">{p.business_name}</div>
                    <div className="text-[11px] text-slate-500">
                      ⭐ {Number(p.rating).toFixed(1)} • ~{p.distanceKm} km away • Base: ₹{p.base_charge}
                    </div>
                  </div>
                  {isSelected && <Check className="w-4 h-4 text-brand-blue" />}
                </label>
              );
            })}
          </div>
        </div>

        {/* Upfront Billing & Confirmation Summary */}
        <div className="p-6 rounded-2xl bg-gradient-to-r from-navy-900 to-navy-950 text-white shadow-xl flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-1 text-center sm:text-left">
            <span className="text-xs text-blue-300 font-semibold uppercase tracking-wider block">
              Transparent Upfront Pricing
            </span>
            <div className="text-2xl font-black">
              Estimated Total: <span className="text-emerald-400">₹{estimatedDisplayCost}</span>
            </div>
            <p className="text-[11px] text-slate-400">
              Includes base inspection fee + GPS transit charges. Pay safely upon service completion.
            </p>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full sm:w-auto px-8 py-4 rounded-xl bg-brand-orange hover:bg-orange-600 text-white font-black text-base transition-all shadow-xl shadow-orange-500/25 flex items-center justify-center gap-2 hover:-translate-y-0.5 disabled:opacity-50"
          >
            {isSubmitting ? (
              <span>Dispatching Help...</span>
            ) : (
              <>
                <span>Confirm & Dispatch Mechanic</span>
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
        </div>

      </form>

    </div>
  );
};

export default BreakdownReportPage;
