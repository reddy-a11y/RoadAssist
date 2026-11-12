import React from 'react';
import { Clock, CheckCircle2, Truck, Wrench, XCircle, ShieldCheck, AlertCircle } from 'lucide-react';

const statusConfig = {
  // Request Statuses
  pending: {
    label: 'Request Submitted',
    bg: 'bg-amber-50 text-amber-700 border-amber-200',
    icon: Clock
  },
  accepted: {
    label: 'Provider Accepted',
    bg: 'bg-blue-50 text-blue-700 border-blue-200',
    icon: CheckCircle2
  },
  on_the_way: {
    label: 'Provider On The Way',
    bg: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    icon: Truck
  },
  in_progress: {
    label: 'Assistance In Progress',
    bg: 'bg-purple-50 text-purple-700 border-purple-200',
    icon: Wrench
  },
  completed: {
    label: 'Service Completed',
    bg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    icon: CheckCircle2
  },
  cancelled: {
    label: 'Request Cancelled',
    bg: 'bg-rose-50 text-rose-700 border-rose-200',
    icon: XCircle
  },
  rejected: {
    label: 'Provider Declined',
    bg: 'bg-rose-50 text-rose-700 border-rose-200',
    icon: XCircle
  },

  // Verification Statuses
  verified: {
    label: 'Verified Partner',
    bg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    icon: ShieldCheck
  },
  verification_pending: {
    label: 'Verification Pending',
    bg: 'bg-amber-50 text-amber-700 border-amber-200',
    icon: AlertCircle
  },
  verification_rejected: {
    label: 'Application Rejected',
    bg: 'bg-rose-50 text-rose-700 border-rose-200',
    icon: XCircle
  }
};

const StatusBadge = ({ status, type = 'request', size = 'md' }) => {
  let key = status ? status.toLowerCase() : 'pending';
  if (type === 'verification' && !key.startsWith('verification_')) {
    if (key === 'pending') key = 'verification_pending';
    else if (key === 'rejected') key = 'verification_rejected';
  }

  const config = statusConfig[key] || {
    label: status ? status.replace(/_/g, ' ') : 'Unknown',
    bg: 'bg-slate-100 text-slate-700 border-slate-200',
    icon: Clock
  };

  const Icon = config.icon;
  const sizeClasses = size === 'sm'
    ? 'px-2 py-0.5 text-[11px] gap-1'
    : 'px-2.5 py-1 text-xs gap-1.5';

  return (
    <span className={`inline-flex items-center font-semibold rounded-full border ${config.bg} ${sizeClasses}`}>
      <Icon className={size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5'} />
      <span>{config.label}</span>
    </span>
  );
};

export default StatusBadge;
