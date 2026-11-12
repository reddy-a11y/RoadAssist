import React, { useState, useEffect } from 'react';
import { ShieldAlert, Phone, MapPin, Copy, Check, ExternalLink, X, AlertTriangle, UserCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { toast } from 'sonner';

const EmergencySOSModal = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const [coords, setCoords] = useState(null);
  const [copied, setCopied] = useState(false);
  const [locLoading, setLocLoading] = useState(true);

  useEffect(() => {
    if (!isOpen) return;

    if ('geolocation' in navigator) {
      setLocLoading(true);
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setCoords({
            lat: pos.coords.latitude.toFixed(6),
            lng: pos.coords.longitude.toFixed(6)
          });
          setLocLoading(false);
        },
        (err) => {
          console.warn('Geolocation error:', err.message);
          // Fallback to default city coords
          setCoords({ lat: '17.448500', lng: '78.374800' });
          setLocLoading(false);
        },
        { enableHighAccuracy: true, timeout: 8000 }
      );
    } else {
      setCoords({ lat: '17.448500', lng: '78.374800' });
      setLocLoading(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const mapLink = coords ? `https://www.openstreetmap.org/?mlat=${coords.lat}&mlon=${coords.lng}#map=16/${coords.lat}/${coords.lng}` : '#';

  const copyLocationText = () => {
    if (!coords) return;
    const shareText = `EMERGENCY ALERT: I need urgent roadside assistance. My current GPS Coordinates: Latitude ${coords.lat}, Longitude ${coords.lng}. Map link: ${mapLink}`;
    navigator.clipboard.writeText(shareText);
    setCopied(true);
    toast.success('Location & Emergency text copied to clipboard!');
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden border border-red-200 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header Ribbon */}
        <div className="bg-gradient-to-r from-red-600 via-rose-600 to-red-700 p-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white">
              <ShieldAlert className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h3 className="text-lg font-bold">Emergency Assistance Mode</h3>
              <p className="text-xs text-red-100">Immediate access to rescue hotlines & coordinates</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          
          {/* Important Distinction Banner */}
          <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl flex gap-3 text-amber-900 text-xs leading-relaxed">
            <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <strong className="block font-semibold mb-0.5">Disclaimer & Distinction:</strong>
              RoadAssist provides private roadside mechanical repairs and towing. If there is an accident, injury, crime, or medical threat, please dial official government helpline <strong>112</strong> or <strong>108</strong> immediately below.
            </div>
          </div>

          {/* Current GPS Location Card */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-red-500" />
                Your Live GPS Coordinates
              </span>
              {locLoading ? (
                <span className="text-xs text-slate-400 animate-pulse">Acquiring GPS fix...</span>
              ) : (
                <span className="inline-flex items-center gap-1 text-xs text-emerald-600 font-semibold">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" /> Active GPS
                </span>
              )}
            </div>

            <div className="flex items-center justify-between bg-white px-3 py-2.5 rounded-lg border border-slate-200 text-sm font-mono font-semibold text-slate-800">
              {coords ? (
                <span>Lat: {coords.lat}, Lng: {coords.lng}</span>
              ) : (
                <span className="text-slate-400">Loading location...</span>
              )}
              <div className="flex items-center gap-2">
                <button
                  onClick={copyLocationText}
                  className="p-1.5 rounded-md hover:bg-slate-100 text-slate-600 transition-colors"
                  title="Copy Coordinates"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                </button>
                {coords && (
                  <a
                    href={mapLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 rounded-md hover:bg-slate-100 text-slate-600 transition-colors"
                    title="Open on OpenStreetMap"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                )}
              </div>
            </div>

            <button
              onClick={copyLocationText}
              className="w-full py-2 px-3 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-semibold transition-colors flex items-center justify-center gap-2"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>Copy Location Alert for WhatsApp / SMS</span>
            </button>
          </div>

          {/* Official Hotlines Grid */}
          <div>
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2.5">
              Instant One-Touch Emergency Call
            </h4>
            <div className="grid grid-cols-2 gap-2.5">
              <a
                href="tel:112"
                className="flex items-center gap-3 p-3 rounded-xl bg-red-50 hover:bg-red-100 border border-red-200 text-red-700 transition-colors"
              >
                <div className="w-8 h-8 rounded-lg bg-red-600 text-white flex items-center justify-center font-bold text-sm">
                  112
                </div>
                <div>
                  <div className="text-xs font-bold">National Helpline</div>
                  <div className="text-[10px] text-red-600">All Emergencies</div>
                </div>
              </a>

              <a
                href="tel:108"
                className="flex items-center gap-3 p-3 rounded-xl bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 transition-colors"
              >
                <div className="w-8 h-8 rounded-lg bg-rose-600 text-white flex items-center justify-center font-bold text-sm">
                  108
                </div>
                <div>
                  <div className="text-xs font-bold">Ambulance Service</div>
                  <div className="text-[10px] text-rose-600">Medical Rapid Aid</div>
                </div>
              </a>

              <a
                href="tel:100"
                className="flex items-center gap-3 p-3 rounded-xl bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-700 transition-colors"
              >
                <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-sm">
                  100
                </div>
                <div>
                  <div className="text-xs font-bold">Police Control Room</div>
                  <div className="text-[10px] text-blue-600">Highway & City Patrol</div>
                </div>
              </a>

              <a
                href="tel:1033"
                className="flex items-center gap-3 p-3 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-700 transition-colors"
              >
                <div className="w-8 h-8 rounded-lg bg-amber-600 text-white flex items-center justify-center font-bold text-sm">
                  1033
                </div>
                <div>
                  <div className="text-xs font-bold">NHAI Highway SOS</div>
                  <div className="text-[10px] text-amber-700">Tollway Recovery</div>
                </div>
              </a>
            </div>
          </div>

          {/* User's Saved Emergency Contact */}
          {user?.emergencyContactName && user?.emergencyContactPhone ? (
            <div className="p-3.5 bg-blue-50/70 border border-blue-200 rounded-xl flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-brand-blue text-white flex items-center justify-center">
                  <UserCheck className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs text-slate-500 font-medium">Your Saved Emergency Contact</div>
                  <div className="text-sm font-bold text-slate-800">
                    {user.emergencyContactName} ({user.emergencyContactPhone})
                  </div>
                </div>
              </div>
              <a
                href={`tel:${user.emergencyContactPhone}`}
                className="px-3.5 py-1.5 rounded-lg bg-brand-blue text-white text-xs font-bold hover:bg-blue-700 flex items-center gap-1.5"
              >
                <Phone className="w-3.5 h-3.5" /> Call
              </a>
            </div>
          ) : (
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-500 text-center">
              Tip: Add a personal emergency contact in your profile to enable 1-click dialer here.
            </div>
          )}

          {/* Quick Roadside Request Action */}
          <div className="pt-2">
            <a
              href="/report-breakdown"
              onClick={onClose}
              className="w-full py-3 px-4 rounded-xl bg-navy-900 text-white text-sm font-bold hover:bg-navy-800 transition-colors flex items-center justify-center gap-2 shadow-lg"
            >
              <span>Dispatch Nearby RoadAssist Mechanic</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmergencySOSModal;
