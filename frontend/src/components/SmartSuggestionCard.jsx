import React from 'react';
import { Sparkles, Shield, Clock, IndianRupee, ArrowRight, AlertTriangle } from 'lucide-react';

const SUGGESTIONS_DATA = {
  'Flat Tyre': {
    title: 'Smart Breakdown Insights: Flat Tyre',
    action: 'Find nearby mobile puncture repair & tyre inflation units',
    serviceNeeded: 'Puncture repair or spare tyre swap',
    duration: '15 - 25 mins',
    cost: '₹250 - ₹450',
    safety: [
      'Turn on hazard blinkers immediately.',
      'Pull over onto a flat, solid shoulder away from speeding lanes.',
      'Apply the handbrake firmly and leave vehicle in gear (or P in auto).'
    ]
  },
  'Battery Failure': {
    title: 'Smart Breakdown Insights: Dead Battery',
    action: 'Find nearby jump-start specialists & battery replacements',
    serviceNeeded: '12V Booster jump-start & alternator check',
    duration: '10 - 20 mins',
    cost: '₹300 - ₹500',
    safety: [
      'Turn off headlamps, air conditioning, and cabin electronics.',
      'Pop open the bonnet/hood latch ready for inspection.',
      'Avoid continuous cranking to preserve starter motor coils.'
    ]
  },
  'Fuel Shortage': {
    title: 'Smart Breakdown Insights: Out of Fuel',
    action: 'Find nearby emergency fuel delivery providers',
    serviceNeeded: '5 Litres pure Petrol/Diesel container delivery',
    duration: '20 - 35 mins',
    cost: '₹400 - ₹650',
    safety: [
      'Coast safely towards the emergency kerb before momentum is lost.',
      'Do not crank dry fuel pump (prevents overheating damage).',
      'Specify whether your vehicle requires Petrol or Diesel.'
    ]
  },
  'Engine Failure': {
    title: 'Smart Breakdown Insights: Engine Stall / Check Light',
    action: 'Find certified mechanical technicians or flatbed towing',
    serviceNeeded: 'OBD-II scanner diagnosis & roadside mechanical fix',
    duration: '30 - 60 mins',
    cost: '₹500 - ₹950',
    safety: [
      'If smoke or burning odor is present, evacuate vehicle to safety.',
      'Do NOT open the radiator pressure cap while hot.',
      'Stand behind the roadside guard rail if stranded on highway.'
    ]
  },
  'Overheating': {
    title: 'Smart Breakdown Insights: Radiator Overheating',
    action: 'Find mobile coolant & cooling system technicians',
    serviceNeeded: 'Coolant refill, hose leak inspection & fan test',
    duration: '25 - 45 mins',
    cost: '₹450 - ₹750',
    safety: [
      'Turn off AC immediately and pull over in a shaded spot if possible.',
      'Switch off engine to prevent cylinder head warping.',
      'DANGER: Do not unscrew pressurized hot radiator reservoir.'
    ]
  },
  'Accident': {
    title: 'Smart Breakdown Insights: Collision / Accident',
    action: 'Find heavy-duty recovery flatbed towing',
    serviceNeeded: 'Hydraulic winching & transport to workshop',
    duration: '30 - 60 mins',
    cost: '₹999 - ₹2500',
    safety: [
      'Verify passenger safety. Dial 108 immediately if injuries exist.',
      'Photograph all collision angles for insurance claims.',
      'Turn off ignition and stay in a safe pedestrian zone.'
    ]
  },
  'Other Mechanical Issues': {
    title: 'Smart Breakdown Insights: General Mechanical',
    action: 'Find multi-brand roadside rescue mechanics',
    serviceNeeded: 'Toolkit inspection for clutch, brakes, or electricals',
    duration: '30 - 50 mins',
    cost: '₹400 - ₹800',
    safety: [
      'Ensure hazard lights are blinking.',
      'Stay near your vehicle in a well-lit location.',
      'Keep your phone battery saved for mechanic coordinates.'
    ]
  }
};

const SmartSuggestionCard = ({ category }) => {
  const data = SUGGESTIONS_DATA[category] || SUGGESTIONS_DATA['Other Mechanical Issues'];

  return (
    <div className="bg-gradient-to-br from-blue-50/80 via-indigo-50/50 to-slate-50 border border-blue-200/80 rounded-2xl p-5 shadow-sm space-y-4">
      
      {/* Header */}
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-lg bg-brand-blue text-white flex items-center justify-center shadow-sm">
          <Sparkles className="w-4 h-4" />
        </div>
        <div>
          <h4 className="text-sm font-bold text-navy-900">{data.title}</h4>
          <p className="text-xs text-brand-blue font-semibold">{data.action}</p>
        </div>
      </div>

      {/* Recommended Service & Estimates Grid */}
      <div className="grid grid-cols-2 gap-3 text-xs">
        <div className="bg-white/80 backdrop-blur-sm p-3 rounded-xl border border-blue-100">
          <div className="text-slate-500 font-medium flex items-center gap-1 mb-1">
            <Clock className="w-3.5 h-3.5 text-brand-blue" />
            <span>Estimated Fix Time</span>
          </div>
          <div className="font-bold text-slate-800 text-sm">{data.duration}</div>
        </div>

        <div className="bg-white/80 backdrop-blur-sm p-3 rounded-xl border border-blue-100">
          <div className="text-slate-500 font-medium flex items-center gap-1 mb-1">
            <IndianRupee className="w-3.5 h-3.5 text-emerald-600" />
            <span>Indicative Cost</span>
          </div>
          <div className="font-bold text-slate-800 text-sm">{data.cost}</div>
        </div>
      </div>

      {/* Safety Instructions */}
      <div className="bg-white/90 rounded-xl p-3.5 border border-blue-100/80">
        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 mb-2">
          <Shield className="w-3.5 h-3.5 text-amber-500" />
          <span>Immediate Safety Checklist:</span>
        </div>
        <ul className="space-y-1.5 text-xs text-slate-600">
          {data.safety.map((tip, idx) => (
            <li key={idx} className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-brand-blue mt-1.5 flex-shrink-0" />
              <span>{tip}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default SmartSuggestionCard;
