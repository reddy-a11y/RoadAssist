import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import EmergencySOSModal from '../components/EmergencySOSModal';

const DashboardLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sosOpen, setSosOpen] = useState(false);
  const location = useLocation();

  // Dynamic Header Title
  const getPageTitle = (path) => {
    if (path.includes('/report-breakdown')) return 'Report Roadside Breakdown';
    if (path.includes('/find-assistance')) return 'Find Nearby Service Providers';
    if (path.includes('/tracking')) return 'Live Assistance Tracker';
    if (path.includes('/vehicles')) return 'Vehicle Garage & Management';
    if (path.includes('/history')) return 'Service History & Invoices';
    if (path.includes('/profile')) return 'Profile & Emergency Settings';
    if (path.includes('/provider/requests')) return 'Live Request Queue';
    if (path.includes('/provider/profile')) return 'Workshop & Pricing Setup';
    if (path.includes('/provider/reviews')) return 'Customer Ratings & Reviews';
    if (path.includes('/admin/providers')) return 'Provider Verification Approvals';
    if (path.includes('/admin/users')) return 'Registered Customers Directory';
    if (path.includes('/admin/requests')) return 'Platform Breakdown Monitoring';
    if (path.includes('/admin/reviews')) return 'Platform Feedback Moderation';
    if (path.startsWith('/admin')) return 'Administrator Analytics Hub';
    if (path.startsWith('/provider')) return 'Service Provider Dashboard';
    return 'Customer Dashboard';
  };

  const title = getPageTitle(location.pathname);

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col lg:pl-72 min-w-0">
        <Header
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          onOpenSOS={() => setSosOpen(true)}
          title={title}
        />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          <Outlet context={{ onOpenSOS: () => setSosOpen(true) }} />
        </main>
      </div>

      {/* Global SOS Modal */}
      <EmergencySOSModal isOpen={sosOpen} onClose={() => setSosOpen(false)} />
    </div>
  );
};

export default DashboardLayout;
