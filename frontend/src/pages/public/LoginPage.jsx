import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Car, Lock, Mail, ArrowRight, ShieldCheck, UserCheck, Wrench, ShieldAlert } from 'lucide-react';
import { toast } from 'sonner';

const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isExpired = searchParams.get('expired') === '1';

  // Demo account quick fill
  const fillDemoAccount = (demoEmail, demoPassword) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    toast.info(`Pre-filled credentials for ${demoEmail}`);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Please enter both email and password.');
      return;
    }

    try {
      setIsSubmitting(true);
      const user = await login(email, password);

      // Redirect based on role
      if (user.role === 'admin') {
        navigate('/admin');
      } else if (user.role === 'provider') {
        navigate('/provider');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      // Error handled in AuthContext
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 sm:p-10 rounded-3xl border border-slate-200 shadow-xl shadow-slate-200/50">
        
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <Link to="/" className="inline-flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-brand-blue flex items-center justify-center text-white shadow-md shadow-blue-500/20">
              <Car className="w-5 h-5" />
            </div>
            <span className="text-2xl font-black text-navy-900">
              Road<span className="text-brand-blue">Assist</span>
            </span>
          </Link>
          <h2 className="text-xl font-bold text-navy-900 pt-2">Welcome Back</h2>
          <p className="text-xs text-slate-500">
            Sign in to access your customer or provider console
          </p>
        </div>

        {isExpired && (
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800">
            Your session has expired. Please sign in again.
          </div>
        )}

        {/* Demo Accounts Quick-Fill Panel */}
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 space-y-2">
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider text-center">
            One-Click Demo Credentials
          </div>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => fillDemoAccount('rahul@gmail.com', 'Password@123')}
              className="py-1.5 px-2 rounded-lg bg-white border border-slate-200 hover:border-brand-blue text-[11px] font-semibold text-slate-700 hover:text-brand-blue transition-colors flex flex-col items-center gap-0.5"
            >
              <UserCheck className="w-3.5 h-3.5 text-blue-600" />
              <span>Customer</span>
            </button>
            <button
              type="button"
              onClick={() => fillDemoAccount('quickfix@roadassist.com', 'Password@123')}
              className="py-1.5 px-2 rounded-lg bg-white border border-slate-200 hover:border-amber-500 text-[11px] font-semibold text-slate-700 hover:text-amber-600 transition-colors flex flex-col items-center gap-0.5"
            >
              <Wrench className="w-3.5 h-3.5 text-amber-600" />
              <span>Provider</span>
            </button>
            <button
              type="button"
              onClick={() => fillDemoAccount('admin@roadassist.com', 'Password@123')}
              className="py-1.5 px-2 rounded-lg bg-white border border-slate-200 hover:border-emerald-500 text-[11px] font-semibold text-slate-700 hover:text-emerald-600 transition-colors flex flex-col items-center gap-0.5"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Admin</span>
            </button>
          </div>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-blue focus:border-transparent transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-blue focus:border-transparent transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 rounded-xl bg-brand-blue text-white font-bold text-sm hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isSubmitting ? (
              <span>Authenticating...</span>
            ) : (
              <>
                <span>Sign In to RoadAssist</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Footer Links */}
        <div className="text-center space-y-2 pt-2 border-t border-slate-100">
          <p className="text-xs text-slate-500">
            Don't have an account?{' '}
            <Link to="/register" className="font-bold text-brand-blue hover:underline">
              Create an Account
            </Link>
          </p>
          <p className="text-xs text-slate-500">
            Are you a service garage owner?{' '}
            <Link to="/register?role=provider" className="font-bold text-slate-700 hover:underline">
              Register as Partner
            </Link>
          </p>
        </div>

      </div>
    </div>
  );
};

export default LoginPage;
