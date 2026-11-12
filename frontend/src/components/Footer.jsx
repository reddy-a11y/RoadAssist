import React from 'react';
import { Link } from 'react-router-dom';
import { Car, Phone, Mail, MapPin, ShieldCheck, Heart } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-navy-900 text-slate-300 pt-16 pb-12 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          
          {/* Brand Col */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-brand-blue flex items-center justify-center text-white">
                <Car className="w-5 h-5" />
              </div>
              <span className="text-2xl font-black tracking-tight text-white">
                Road<span className="text-brand-blue">Assist</span>
              </span>
            </Link>
            <p className="text-sm text-slate-400 leading-relaxed">
              Stranded on the road? We've got your back. India's fastest location-based roadside breakdown assistance network connecting drivers with verified local rescue mechanics.
            </p>
            <div className="flex items-center gap-2 text-xs text-emerald-400 font-medium">
              <ShieldCheck className="w-4 h-4" />
              <span>100% Verified Technical Partners</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-semibold text-base mb-4">Quick Links</h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/find-assistance" className="hover:text-white transition-colors">
                  Find Nearby Mechanics
                </Link>
              </li>
              <li>
                <Link to="/report-breakdown" className="hover:text-white transition-colors">
                  Report a Breakdown
                </Link>
              </li>
              <li>
                <Link to="/register?role=provider" className="hover:text-white transition-colors">
                  Partner with Us (Mechanic/Garage)
                </Link>
              </li>
              <li>
                <Link to="/login" className="hover:text-white transition-colors">
                  Member Portal Login
                </Link>
              </li>
              <li>
                <a href="/#faq" className="hover:text-white transition-colors">
                  Frequently Asked Questions
                </a>
              </li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h4 className="text-white font-semibold text-base mb-4">Popular Assistance</h4>
            <ul className="space-y-2.5 text-sm">
              <li>Flat Tyre Repair & Puncture Fix</li>
              <li>12V Battery Jump-Start & Swap</li>
              <li>Emergency Fuel Delivery (5L)</li>
              <li>Engine Diagnostics & Scan</li>
              <li>Coolant Flush & Overheating Fix</li>
              <li>Hydraulic Flatbed Towing</li>
            </ul>
          </div>

          {/* Contact & Hotline */}
          <div className="space-y-3">
            <h4 className="text-white font-semibold text-base mb-4">24/7 Helpline</h4>
            <div className="flex items-center gap-3 text-sm">
              <Phone className="w-4 h-4 text-brand-blue flex-shrink-0" />
              <span className="font-semibold text-white">1800-762-3435 (Toll-Free)</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <Mail className="w-4 h-4 text-brand-blue flex-shrink-0" />
              <span>support@roadassist.com</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <MapPin className="w-4 h-4 text-brand-blue flex-shrink-0" />
              <span>Madhapur, Hyderabad, Telangana 500081</span>
            </div>

            {/* Official Distinction Alert */}
            <div className="mt-4 p-3 rounded-lg bg-slate-800/80 border border-slate-700/80 text-[11px] text-slate-400">
              <strong className="text-amber-400 block mb-1">Important Notice:</strong>
              RoadAssist is a private mechanical assistance platform. For life-threatening medical emergencies or police assistance, please dial National Emergency <strong>112</strong> or Ambulance <strong>108</strong> directly.
            </div>
          </div>
        </div>

        <div className="border-t border-slate-800 pt-8 flex flex-col md:flex-row items-center justify-between text-xs text-slate-300 gap-4">
          <p>© {new Date().getFullYear()} RoadAssist Technologies Inc. All rights reserved.</p>
          <p className="flex items-center gap-1">
            Engineered for high-reliability roadside mobility and safety
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
