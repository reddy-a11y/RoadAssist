import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import StatusBadge from '../../components/StatusBadge';
import {
  Wrench,
  ShieldCheck,
  MapPin,
  Clock,
  IndianRupee,
  Phone,
  Check,
  AlertTriangle,
  Building
} from 'lucide-react';
import { toast } from 'sonner';

const ProviderProfilePage = () => {
  const { user, refreshUser } = useAuth();

  const [provider, setProvider] = useState(null);
  const [businessName, setBusinessName] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [operatingHours, setOperatingHours] = useState('');
  const [baseCharge, setBaseCharge] = useState('350');
  const [perKmCharge, setPerKmCharge] = useState('25');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [servicesOffered, setServicesOffered] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const allServices = [
    'Flat Tyre',
    'Battery Failure',
    'Engine Failure',
    'Fuel Shortage',
    'Overheating',
    'Accident',
    'Other Mechanical Issues'
  ];

  const fetchProviderDetails = async () => {
    try {
      setIsLoading(true);
      const res = await api.get('/auth/me');
      if (res.success && res.user?.provider) {
        const p = res.user.provider;
        setProvider(p);
        setBusinessName(p.business_name || '');
        setOwnerName(p.owner_name || res.user.name);
        setPhone(p.phone || res.user.phone);
        setAddress(p.address || '');
        setOperatingHours(p.operating_hours || '24/7 Available');
        setBaseCharge(p.base_charge?.toString() || '350');
        setPerKmCharge(p.per_km_charge?.toString() || '25');
        setLatitude(p.latitude?.toString() || '17.4485');
        setLongitude(p.longitude?.toString() || '78.3748');

        let srv = [];
        try {
          srv = typeof p.services_offered === 'string' ? JSON.parse(p.services_offered) : p.services_offered;
        } catch (e) {
          srv = [];
        }
        setServicesOffered(srv || []);
      }
    } catch (err) {
      toast.error('Failed to load garage details: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProviderDetails();
  }, []);

  const handleToggleService = (srv) => {
    if (servicesOffered.includes(srv)) {
      if (servicesOffered.length === 1) {
        toast.warning('Must support at least one service category.');
        return;
      }
      setServicesOffered(servicesOffered.filter((s) => s !== srv));
    } else {
      setServicesOffered([...servicesOffered, srv]);
    }
  };

  const handleUpdateCoordinates = () => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const lat = pos.coords.latitude.toFixed(6);
          const lng = pos.coords.longitude.toFixed(6);
          setLatitude(lat);
          setLongitude(lng);

          try {
            await api.patch('/providers/location', {
              latitude: lat,
              longitude: lng
            });
            toast.success('Live GPS location updated on rescue network!');
          } catch (e) {
            // ignore
          }
        },
        (err) => toast.error(err.message)
      );
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-16">
      
      {/* Header */}
      <div>
        <h2 className="text-2xl font-black text-navy-900 tracking-tight">Workshop & Profile Settings</h2>
        <p className="text-xs text-slate-500">
          Manage your garage business credentials, base inspection charges, and roadside capabilities
        </p>
      </div>

      {/* Verification Status Banner */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center flex-shrink-0">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-navy-900">Administrative Verification</h3>
              <StatusBadge status={provider?.verification_status || 'pending'} type="verification" />
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              {provider?.verification_status === 'verified'
                ? 'Your business is verified. Customers can discover and request assistance from your garage.'
                : 'Pending approval. Admin is reviewing your workshop credentials.'}
            </p>
          </div>
        </div>

        <div className="text-right">
          <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Completed Rescues</span>
          <span className="text-xl font-black text-navy-900">{provider?.total_services_completed || 0}</span>
        </div>
      </div>

      {/* Details Form Card */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-6">
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Workshop / Business Name
            </label>
            <input
              type="text"
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500 font-semibold"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Owner / Representative Name
            </label>
            <input
              type="text"
              value={ownerName}
              onChange={(e) => setOwnerName(e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500 font-semibold"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Dispatch Hotline Phone
            </label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 font-semibold"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Operating Hours
            </label>
            <input
              type="text"
              value={operatingHours}
              onChange={(e) => setOperatingHours(e.target.value)}
              placeholder="e.g. 24/7 Always Open"
              className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
            Physical Garage / Workshop Address
          </label>
          <input
            type="text"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300"
          />
        </div>

        {/* GPS Coordinates */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-navy-900 uppercase tracking-wider flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-brand-blue" />
              <span>Rescue Dispatch Coordinates</span>
            </span>
            <button
              type="button"
              onClick={handleUpdateCoordinates}
              className="text-xs font-bold text-brand-blue hover:underline"
            >
              Update to My Current GPS
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3 font-mono text-xs">
            <div>
              <span className="text-slate-400 block mb-0.5">Latitude</span>
              <input
                type="text"
                value={latitude}
                onChange={(e) => setLatitude(e.target.value)}
                className="w-full px-3 py-1.5 rounded-lg border border-slate-300 bg-white"
              />
            </div>
            <div>
              <span className="text-slate-400 block mb-0.5">Longitude</span>
              <input
                type="text"
                value={longitude}
                onChange={(e) => setLongitude(e.target.value)}
                className="w-full px-3 py-1.5 rounded-lg border border-slate-300 bg-white"
              />
            </div>
          </div>
        </div>

        {/* Service Pricing */}
        <div className="pt-2 border-t border-slate-100">
          <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">
            Service Pricing Structure
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Base Inspection Fee (₹)
              </label>
              <input
                type="number"
                min={100}
                value={baseCharge}
                onChange={(e) => setBaseCharge(e.target.value)}
                className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 font-bold text-navy-900"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Transit Charge per Km (₹)
              </label>
              <input
                type="number"
                min={5}
                value={perKmCharge}
                onChange={(e) => setPerKmCharge(e.target.value)}
                className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 font-bold text-navy-900"
              />
            </div>
          </div>
        </div>

        {/* Capabilities Checkboxes */}
        <div className="pt-2 border-t border-slate-100">
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
            Active Capabilities & Services Supported
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
            {allServices.map((srv) => (
              <label
                key={srv}
                className={`p-3 rounded-xl border cursor-pointer transition-colors flex items-center gap-2 ${
                  servicesOffered.includes(srv)
                    ? 'bg-amber-50 border-amber-300 text-amber-900 font-bold'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <input
                  type="checkbox"
                  checked={servicesOffered.includes(srv)}
                  onChange={() => handleToggleService(srv)}
                  className="rounded text-amber-600 focus:ring-amber-500"
                />
                <span>{srv}</span>
              </label>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
};

export default ProviderProfilePage;
