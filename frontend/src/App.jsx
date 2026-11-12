import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

// Layouts
import PublicLayout from './layouts/PublicLayout';
import DashboardLayout from './layouts/DashboardLayout';

// Public Pages
import LandingPage from './pages/public/LandingPage';
import LoginPage from './pages/public/LoginPage';
import RegisterPage from './pages/public/RegisterPage';

// Customer Pages
import CustomerDashboard from './pages/customer/CustomerDashboard';
import BreakdownReportPage from './pages/customer/BreakdownReportPage';
import FindAssistancePage from './pages/customer/FindAssistancePage';
import RequestTrackingPage from './pages/customer/RequestTrackingPage';
import VehicleManagementPage from './pages/customer/VehicleManagementPage';
import CustomerHistoryPage from './pages/customer/CustomerHistoryPage';
import CustomerProfilePage from './pages/customer/CustomerProfilePage';

// Provider Pages
import ProviderDashboard from './pages/provider/ProviderDashboard';
import ProviderRequestsPage from './pages/provider/ProviderRequestsPage';
import ProviderProfilePage from './pages/provider/ProviderProfilePage';
import ProviderReviewsPage from './pages/provider/ProviderReviewsPage';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminProvidersPage from './pages/admin/AdminProvidersPage';
import AdminUsersPage from './pages/admin/AdminUsersPage';
import AdminRequestsPage from './pages/admin/AdminRequestsPage';
import AdminReviewsPage from './pages/admin/AdminReviewsPage';

// Protected Route Guard
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 text-xs font-semibold text-slate-500">
        Verifying secure credentials...
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    if (user.role === 'admin') return <Navigate to="/admin" replace />;
    if (user.role === 'provider') return <Navigate to="/provider" replace />;
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

function App() {
  return (
    <Routes>
      {/* Public Pages with PublicLayout (Navbar, Footer, SOS) */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Route>

      {/* Protected Dashboard Area with DashboardLayout (Sidebar, Header, SOS) */}
      <Route
        element={
          <ProtectedRoute allowedRoles={['customer', 'provider', 'admin']}>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        {/* Customer Routes */}
        <Route path="/dashboard" element={<CustomerDashboard />} />
        <Route path="/report-breakdown" element={<BreakdownReportPage />} />
        <Route path="/find-assistance" element={<FindAssistancePage />} />
        <Route path="/tracking" element={<RequestTrackingPage />} />
        <Route path="/vehicles" element={<VehicleManagementPage />} />
        <Route path="/history" element={<CustomerHistoryPage />} />
        <Route path="/profile" element={<CustomerProfilePage />} />

        {/* Provider Routes */}
        <Route
          path="/provider"
          element={
            <ProtectedRoute allowedRoles={['provider']}>
              <ProviderDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/provider/requests"
          element={
            <ProtectedRoute allowedRoles={['provider']}>
              <ProviderRequestsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/provider/profile"
          element={
            <ProtectedRoute allowedRoles={['provider']}>
              <ProviderProfilePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/provider/reviews"
          element={
            <ProtectedRoute allowedRoles={['provider']}>
              <ProviderReviewsPage />
            </ProtectedRoute>
          }
        />

        {/* Admin Routes */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/providers"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminProvidersPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/users"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminUsersPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/requests"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminRequestsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/reviews"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminReviewsPage />
            </ProtectedRoute>
          }
        />
      </Route>

      {/* Fallback Catch-all Route */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
