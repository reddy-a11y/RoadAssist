import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Car,
  LayoutDashboard,
  AlertOctagon,
  MapPin,
  Clock,
  Settings,
  ShieldCheck,
  Users,
  LogOut,
  X,
  Radio,
  FileText,
  Star,
  CheckCircle,
  BarChart3
} from 'lucide-react';

const Sidebar = ({ isOpen, onClose }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Nav links per role
  const customerNav = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Report Breakdown', path: '/report-breakdown', icon: AlertOctagon },
    { name: 'Find Assistance', path: '/find-assistance', icon: MapPin },
    { name: 'Active Tracking', path: '/tracking', icon: Radio },
    { name: 'My Vehicles', path: '/vehicles', icon: Car },
    { name: 'Service History', path: '/history', icon: Clock },
    { name: 'Profile & Emergency', path: '/profile', icon: Settings },
  ];

  const providerNav = [
    { name: 'Dashboard', path: '/provider', icon: LayoutDashboard },
    { name: 'Service Requests', path: '/provider/requests', icon: AlertOctagon },
    { name: 'Garage Profile', path: '/provider/profile', icon: Settings },
    { name: 'Customer Reviews', path: '/provider/reviews', icon: Star },
  ];

  const adminNav = [
    { name: 'Admin Dashboard', path: '/admin', icon: BarChart3 },
    { name: 'Provider Approvals', path: '/admin/providers', icon: ShieldCheck },
    { name: 'User Management', path: '/admin/users', icon: Users },
    { name: 'All Requests', path: '/admin/requests', icon: FileText },
    { name: 'All Reviews', path: '/admin/reviews', icon: Star },
  ];

  let currentNav = customerNav;
  let roleTitle = 'Customer Portal';
  let badgeColor = 'bg-blue-500/20 text-blue-300 border-blue-400/30';

  if (user?.role === 'provider') {
    currentNav = providerNav;
    roleTitle = 'Provider Console';
    badgeColor = 'bg-amber-500/20 text-amber-300 border-amber-400/30';
  } else if (user?.role === 'admin') {
    currentNav = adminNav;
    roleTitle = 'Admin Operations';
    badgeColor = 'bg-emerald-500/20 text-emerald-300 border-emerald-400/30';
  }

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-sm lg:hidden"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-72 bg-navy-950 text-slate-300 flex flex-col transition-transform duration-300 ease-in-out border-r border-slate-800 ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Brand Header */}
        <div className="h-20 flex items-center justify-between px-6 border-b border-slate-800/80 bg-navy-900/50">
          <NavLink to="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand-blue flex items-center justify-center text-white shadow-md shadow-brand-blue/30">
              <Car className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xl font-black tracking-tight text-white">
                Road<span className="text-brand-blue">Assist</span>
              </span>
              <span className="block text-[10px] uppercase tracking-wider font-semibold text-slate-400">
                {roleTitle}
              </span>
            </div>
          </NavLink>
          
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 lg:hidden"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User Card */}
        <div className="p-4 mx-4 my-4 rounded-xl bg-slate-900/90 border border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-brand-blue to-indigo-600 flex items-center justify-center font-bold text-white text-sm shadow-inner">
              {user?.name?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div className="overflow-hidden">
              <div className="text-sm font-semibold text-white truncate">{user?.name}</div>
              <div className="text-xs text-slate-400 truncate">{user?.email}</div>
            </div>
          </div>
          <div className="mt-3 flex items-center justify-between">
            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border uppercase tracking-wider ${badgeColor}`}>
              {user?.role}
            </span>
            {user?.role === 'provider' && user?.verificationStatus && (
              <span className="text-[10px] text-emerald-400 font-medium flex items-center gap-1">
                <CheckCircle className="w-3 h-3" /> {user.verificationStatus}
              </span>
            )}
          </div>
        </div>

        {/* Navigation Links */}
        <div className="flex-1 px-4 py-2 space-y-1 overflow-y-auto">
          {currentNav.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === '/dashboard' || item.path === '/provider' || item.path === '/admin'}
                onClick={() => onClose && onClose()}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-brand-blue text-white shadow-md shadow-blue-600/30 font-semibold'
                      : 'text-slate-400 hover:text-white hover:bg-slate-900/60'
                  }`
                }
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                <span>{item.name}</span>
              </NavLink>
            );
          })}
        </div>

        {/* Footer Logout */}
        <div className="p-4 border-t border-slate-800/80 bg-navy-900/40">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
          >
            <LogOut className="w-5 h-5 flex-shrink-0" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
