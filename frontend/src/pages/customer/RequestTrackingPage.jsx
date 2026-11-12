import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useSocket } from '../../context/SocketContext';
import api from '../../services/api';
import LeafletMap from '../../components/LeafletMap';
import StatusBadge from '../../components/StatusBadge';
import ReviewModal from '../../components/ReviewModal';
import {
  Clock,
  CheckCircle2,
  Truck,
  Wrench,
  XCircle,
  Phone,
  MapPin,
  Car,
  Radio,
  Star,
  AlertTriangle,
  ArrowRight
} from 'lucide-react';
import { toast } from 'sonner';

const STAGES = [
  { key: 'pending', title: 'Request Submitted', desc: 'Matching nearby rescue technician', icon: Clock },
  { key: 'accepted', title: 'Provider Accepted', desc: 'Technician confirmed dispatch', icon: CheckCircle2 },
  { key: 'on_the_way', title: 'Provider On The Way', desc: 'Rescue unit traveling to your spot', icon: Truck },
  { key: 'in_progress', title: 'Assistance In Progress', desc: 'Diagnosing & fixing vehicle on site', icon: Wrench },
  { key: 'completed', title: 'Service Completed', desc: 'Work done & verified safely', icon: CheckCircle2 },
];

const RequestTrackingPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const socket = useSocket();

  const requestIdFromUrl = searchParams.get('id');
  const [requestId, setRequestId] = useState(requestIdFromUrl);
  const [request, setRequest] = useState(null);
  const [providerLocation, setProviderLocation] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);

  // Fetch request data
  const fetchRequest = async (idToFetch) => {
    try {
      setIsLoading(true);
      let targetId = idToFetch;

      // If no ID passed in query, fetch user's most recent request
      if (!targetId) {
        const myRes = await api.get('/requests/my');
        if (myRes.success && myRes.requests?.length > 0) {
          targetId = myRes.requests[0].id;
          setRequestId(targetId);
        } else {
          setIsLoading(false);
          return;
        }
      }

      const res = await api.get(`/requests/${targetId}`);
      if (res.success && res.request) {
        setRequest(res.request);

        if (res.request.provider_current_lat && res.request.provider_current_lng) {
          setProviderLocation([
            parseFloat(res.request.provider_current_lat),
            parseFloat(res.request.provider_current_lng)
          ]);
        }
      }
    } catch (err) {
      toast.error('Failed to load tracking data: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRequest(requestId);
  }, [requestId]);

  // Real-time Socket.IO Room & Listeners
  useEffect(() => {
    if (!socket || !requestId) return;

    socket.emit('join_request', requestId);

    // Listen for live status change
    socket.on('request_status_updated', (data) => {
      console.log('[Socket] Request status updated:', data);
      if (data.request) {
        setRequest(data.request);
        toast.info(`Request update: ${data.status.replace(/_/g, ' ')}`);
        if (data.status === 'completed') {
          setReviewModalOpen(true);
        }
      } else {
        fetchRequest(requestId);
      }
    });

    // Listen for provider live GPS movement
    socket.on('provider_location_updated', (data) => {
      if (data.latitude && data.longitude) {
        setProviderLocation([parseFloat(data.latitude), parseFloat(data.longitude)]);
      }
    });

    return () => {
      socket.emit('leave_request', requestId);
      socket.off('request_status_updated');
      socket.off('provider_location_updated');
    };
  }, [socket, requestId]);

  const handleCancelRequest = async () => {
    if (!window.confirm('Are you sure you want to cancel this assistance request?')) return;

    try {
      setIsCancelling(true);
      const res = await api.patch(`/requests/${request.id}/cancel`, {
        reason: 'Cancelled by user from tracking screen'
      });
      if (res.success) {
        toast.info('Request has been cancelled.');
        fetchRequest(request.id);
      }
    } catch (err) {
      toast.error(err.message || 'Failed to cancel request');
    } finally {
      setIsCancelling(false);
    }
  };

  if (isLoading) {
    return (
      <div className="p-12 text-center text-xs text-slate-400">
        Loading real-time tracking data...
      </div>
    );
  }

  if (!request) {
    return (
      <div className="max-w-md mx-auto text-center py-16 space-y-4">
        <Radio className="w-12 h-12 text-slate-300 mx-auto" />
        <h3 className="text-lg font-bold text-navy-900">No Active Assistance Request</h3>
        <p className="text-xs text-slate-500">
          You currently have no active breakdown requests being tracked.
        </p>
        <button
          onClick={() => navigate('/report-breakdown')}
          className="px-6 py-2.5 rounded-xl bg-brand-blue text-white text-xs font-bold shadow-md"
        >
          Report a Breakdown
        </button>
      </div>
    );
  }

  // Calculate current stage index
  const stageKeys = STAGES.map((s) => s.key);
  const currentStageIndex = stageKeys.indexOf(request.status);
  const isTerminated = ['completed', 'cancelled', 'rejected'].includes(request.status);

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-16">
      
      {/* Header Bar */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
            <span className="text-xs font-bold text-brand-blue uppercase tracking-wider">
              Live Socket.IO Stream
            </span>
          </div>
          <h2 className="text-2xl font-black text-navy-900 tracking-tight">
            Assistance Request: {request.request_code}
          </h2>
          <p className="text-xs text-slate-500">
            {request.category} • Logged {new Date(request.created_at).toLocaleTimeString()}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <StatusBadge status={request.status} />
          {!isTerminated && (
            <button
              onClick={handleCancelRequest}
              disabled={isCancelling}
              className="px-3.5 py-1.5 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 text-xs font-bold transition-colors disabled:opacity-50"
            >
              Cancel Request
            </button>
          )}
        </div>
      </div>

      {/* 5-Stage Live Progress Stepper */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-6">
          Rescue Progress Pipeline
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 relative">
          {STAGES.map((st, idx) => {
            const Icon = st.icon;
            const isDone = currentStageIndex > idx || request.status === 'completed';
            const isCurrent = currentStageIndex === idx && request.status !== 'completed';
            const isPending = currentStageIndex < idx;

            return (
              <div key={st.key} className="flex flex-col items-center text-center relative group">
                
                {/* Connecting Line (for desktop) */}
                {idx < STAGES.length - 1 && (
                  <div
                    className={`hidden md:block absolute top-5 left-1/2 w-full h-1 -z-0 transition-colors ${
                      isDone ? 'bg-brand-blue' : 'bg-slate-200'
                    }`}
                  />
                )}

                {/* Circle Icon */}
                <div
                  className={`w-11 h-11 rounded-full flex items-center justify-center font-bold text-sm mb-3 z-10 transition-all ${
                    isDone
                      ? 'bg-brand-blue text-white shadow-md shadow-blue-500/25 ring-4 ring-blue-50'
                      : isCurrent
                      ? 'bg-navy-900 text-white animate-pulse ring-4 ring-navy-100'
                      : 'bg-slate-100 text-slate-400'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                </div>

                <div className="text-xs font-bold text-navy-900">{st.title}</div>
                <div className="text-[11px] text-slate-500 max-w-[130px] leading-tight mt-0.5">
                  {st.desc}
                </div>
              </div>
            );
          })}
        </div>

        {request.status === 'cancelled' && (
          <div className="mt-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
            <XCircle className="w-4 h-4 flex-shrink-0" />
            <span>This assistance request was cancelled. Reason: {request.cancellation_reason || 'Cancelled by user.'}</span>
          </div>
        )}
      </div>

      {/* Map & Incident Details */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Live Leaflet Map */}
        <div className="lg:col-span-7 bg-white rounded-2xl p-3 border border-slate-200 shadow-sm overflow-hidden">
          <div className="h-[420px] w-full rounded-xl overflow-hidden relative">
            <LeafletMap
              center={[parseFloat(request.latitude), parseFloat(request.longitude)]}
              zoom={14}
              userLocation={{ lat: parseFloat(request.latitude), lng: parseFloat(request.longitude) }}
              routeTo={providerLocation}
              providers={
                providerLocation
                  ? [
                      {
                        id: request.provider_id || 999,
                        business_name: request.provider_name || 'Rescue Technician',
                        current_latitude: providerLocation[0],
                        current_longitude: providerLocation[1],
                        rating: request.provider_rating || 4.9
                      }
                    ]
                  : []
              }
              className="h-full w-full"
            />
            
            <div className="absolute top-3 right-3 z-[400] bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-200 shadow-md text-xs font-bold text-slate-800 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>Real-Time Coordinates Stream</span>
            </div>
          </div>
        </div>

        {/* Technician & Vehicle Info Card */}
        <div className="lg:col-span-5 space-y-4">
          
          {/* Provider Card */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Assigned Service Partner
            </h3>

            {request.provider_name ? (
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="text-base font-bold text-navy-900">{request.provider_name}</h4>
                    <p className="text-xs text-slate-500">{request.provider_address || 'Authorized Garage'}</p>
                    <div className="flex items-center gap-1 text-xs font-bold text-slate-800 mt-1">
                      <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                      <span>{Number(request.provider_rating || 5.0).toFixed(1)} / 5.0</span>
                    </div>
                  </div>
                </div>

                {request.provider_phone && (
                  <a
                    href={`tel:${request.provider_phone}`}
                    className="w-full py-2.5 px-4 rounded-xl bg-brand-blue hover:bg-blue-700 text-white font-bold text-xs transition-colors flex items-center justify-center gap-2 shadow-md shadow-blue-500/20"
                  >
                    <Phone className="w-4 h-4" />
                    <span>Call Technician ({request.provider_phone})</span>
                  </a>
                )}
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-slate-50 text-xs text-slate-500 space-y-2">
                <p>Matching the nearest verified technician in your radius...</p>
              </div>
            )}
          </div>

          {/* Incident Details Card */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-3.5 text-xs">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Incident Breakdown Overview
            </h3>

            <div>
              <span className="text-slate-400 block">Breakdown Location:</span>
              <span className="font-semibold text-slate-800">{request.address}</span>
            </div>

            <div>
              <span className="text-slate-400 block">Registered Vehicle:</span>
              <span className="font-semibold text-slate-800">
                {request.make ? `${request.make} ${request.model} (${request.registration_number})` : 'Standard Customer Vehicle'}
              </span>
            </div>

            <div>
              <span className="text-slate-400 block">Problem Symptoms:</span>
              <span className="font-semibold text-slate-800 italic">"{request.description}"</span>
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-sm">
              <span className="font-bold text-slate-700">Total Charges:</span>
              <span className="font-black text-emerald-600 text-base">
                ₹{request.final_cost || request.estimated_cost}
              </span>
            </div>
          </div>

          {/* Leave Review Button (if completed) */}
          {request.status === 'completed' && (
            <button
              onClick={() => setReviewModalOpen(true)}
              className="w-full py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-colors flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20"
            >
              <Star className="w-4 h-4 fill-white" />
              <span>{request.review_rating ? 'Update Your Rating' : 'Rate Service Provider'}</span>
            </button>
          )}

        </div>

      </div>

      {/* Review Modal */}
      <ReviewModal
        isOpen={reviewModalOpen}
        onClose={() => setReviewModalOpen(false)}
        request={request}
        onReviewSubmitted={() => fetchRequest(request.id)}
      />

    </div>
  );
};

export default RequestTrackingPage;
