import React, { useState } from 'react';
import { Link, useOutletContext } from 'react-router-dom';
import {
  Car,
  Wrench,
  ShieldCheck,
  Clock,
  MapPin,
  PhoneCall,
  CheckCircle2,
  ArrowRight,
  ShieldAlert,
  ChevronDown,
  Star,
  Zap,
  Disc,
  Fuel,
  Thermometer,
  Truck
} from 'lucide-react';

const LandingPage = () => {
  const { onOpenSOS } = useOutletContext() || {};
  const [openFaq, setOpenFaq] = useState(0);

  const services = [
    {
      title: 'Flat Tyre & Puncture Repair',
      desc: 'Mobile puncture plugging, air pressure equalization, or spare wheel mounting right on the highway shoulder.',
      icon: Disc,
      price: 'From ₹299',
      badge: 'Most Requested'
    },
    {
      title: '12V Battery Jump-Start',
      desc: 'Heavy-duty booster cables or industrial starter packs to revive dead batteries and test alternator health.',
      icon: Zap,
      price: 'From ₹349',
      badge: '15 Min Arrival'
    },
    {
      title: 'Emergency Fuel Delivery',
      desc: 'Stranded with an empty tank? Receive 5 Litres of sealed pure Petrol or Diesel poured safely into your tank.',
      icon: Fuel,
      price: 'From ₹450',
      badge: 'All Fuel Types'
    },
    {
      title: 'Engine Diagnostics & Scan',
      desc: 'OBD-II computer diagnostics, drive belt check, sensor troubleshooting and on-spot temporary repair.',
      icon: Wrench,
      price: 'From ₹599',
      badge: 'Certified Mechanics'
    },
    {
      title: 'Coolant & Overheating Rescue',
      desc: 'Engine temperature stabilization, radiator hose leak inspect, fan relay testing and coolant flush.',
      icon: Thermometer,
      price: 'From ₹499',
      badge: 'Thermal Safety'
    },
    {
      title: 'Hydraulic Flatbed Towing',
      desc: 'Zero-damage hydraulic tilt-tray flatbed recovery to transport your car safely to your preferred workshop.',
      icon: Truck,
      price: 'From ₹1199',
      badge: 'Safe Recovery'
    }
  ];

  const steps = [
    {
      step: '01',
      title: 'Report Your Breakdown',
      desc: 'Select your vehicle, choose the issue category, share your GPS location, and snap a quick photo.'
    },
    {
      step: '02',
      title: 'Smart Provider Matching',
      desc: 'Our intelligent engine ranks nearby verified mechanics by proximity, ratings, and transparent pricing.'
    },
    {
      step: '03',
      title: 'Live Real-Time Tracking',
      desc: 'Watch the rescue technician en-route on the interactive Leaflet map with live ETA pings via Socket.IO.'
    },
    {
      step: '04',
      title: 'Back on the Road Safely',
      desc: 'Mechanic completes repair on site, charges are verified upfront, and you can rate the experience.'
    }
  ];

  const testimonials = [
    {
      name: 'Rahul Sharma',
      vehicle: 'Hyundai Creta Owner',
      comment: 'Got a puncture on the Inorbit flyover late at night. QuickFix arrived in 14 minutes and repaired it without having to tow! Incredible service.',
      rating: 5
    },
    {
      name: 'Priya Patel',
      vehicle: 'Maruti Suzuki Swift Owner',
      comment: 'My car battery gave up at Mindspace parking lot. Apex Roadside came with a booster pack and revived it immediately. Upfront pricing with no surprises.',
      rating: 5
    },
    {
      name: 'Vikram Singh',
      vehicle: 'Kia Seltos Owner',
      comment: 'The live tracking feature gave my family total peace of mind while stranded on the Outer Ring Road. Fast, professional, and courteous mechanics.',
      rating: 5
    }
  ];

  const faqs = [
    {
      q: 'How quickly does assistance arrive?',
      a: 'Average arrival time across metropolitan corridors is between 12 to 25 minutes depending on traffic. Our smart dispatch system selects the nearest available technician to minimize wait times.'
    },
    {
      q: 'How does RoadAssist calculate service pricing?',
      a: 'All pricing is 100% transparent and computed upfront using base garage fees, exact GPS distance charges, and standard repair materials. You see the estimated bill before confirming the request.'
    },
    {
      q: 'Are all roadside service providers verified?',
      a: 'Yes. Every mechanic and towing service undergoes administrative verification including workshop license checks, identity validation, and background screening before appearing in customer searches.'
    },
    {
      q: 'Does RoadAssist require an internet connection?',
      a: 'Yes. RoadAssist is a real-time online platform utilizing live GPS geolocation, WebSocket streaming, and secure cloud verification to ensure accurate tracking and dispatch.'
    },
    {
      q: 'What should I do in a severe accident or life-threatening emergency?',
      a: 'For personal medical injuries or dangerous collisions, please use the Emergency SOS button immediately to dial National Helpline 112 or Ambulance 108. RoadAssist coordinates mechanical repairs and towing.'
    }
  ];

  return (
    <div className="space-y-24 pb-20">
      
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-28 bg-gradient-to-b from-white via-slate-50 to-slate-100/60 border-b border-slate-200/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Copy */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-brand-blue text-xs font-bold tracking-wide uppercase">
                <span className="w-2 h-2 rounded-full bg-brand-blue animate-pulse" />
                <span>Smart Roadside Assistance Platform</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-navy-900 tracking-tight leading-[1.15]">
                Help Is Just <br className="hidden sm:inline" />
                <span className="bg-gradient-to-r from-brand-blue via-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  Around The Corner.
                </span>
              </h1>

              <p className="text-lg text-slate-600 max-w-2xl leading-relaxed">
                Stranded on the road? We've got your back. Connect instantly with verified nearby mechanics, jump-start technicians, fuel delivery squads, and flatbed towing in under 15 minutes.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
                <Link
                  to="/report-breakdown"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-8 py-4 rounded-xl bg-brand-blue text-white font-bold text-base hover:bg-blue-700 transition-all shadow-xl shadow-blue-500/25 hover:-translate-y-0.5"
                >
                  <Wrench className="w-5 h-5" />
                  <span>Request Instant Help</span>
                  <ArrowRight className="w-5 h-5" />
                </Link>

                <Link
                  to="/find-assistance"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-7 py-4 rounded-xl bg-white border border-slate-300 text-slate-800 font-bold text-base hover:bg-slate-50 transition-all shadow-sm"
                >
                  <MapPin className="w-5 h-5 text-brand-blue" />
                  <span>Explore Nearby Garages</span>
                </Link>

                <button
                  onClick={onOpenSOS}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-4 rounded-xl bg-red-50 text-red-600 border border-red-200 font-bold text-base hover:bg-red-600 hover:text-white transition-all shadow-sm"
                  title="Direct Emergency Hotline Dialer"
                >
                  <ShieldAlert className="w-5 h-5" />
                  <span>SOS Dial</span>
                </button>
              </div>

              {/* Trust Indicators */}
              <div className="pt-6 border-t border-slate-200/80 grid grid-cols-3 gap-4 text-center lg:text-left">
                <div>
                  <div className="text-2xl font-black text-navy-900">&lt; 15 Min</div>
                  <div className="text-xs text-slate-500 font-medium">Avg Arrival Time</div>
                </div>
                <div>
                  <div className="text-2xl font-black text-brand-blue">100% Verified</div>
                  <div className="text-xs text-slate-500 font-medium">Rescue Specialists</div>
                </div>
                <div>
                  <div className="text-2xl font-black text-navy-900">24/7/365</div>
                  <div className="text-xs text-slate-500 font-medium">Live Emergency Hub</div>
                </div>
              </div>
            </div>

            {/* Right Visual Card */}
            <div className="lg:col-span-5 relative">
              <div className="relative mx-auto max-w-md bg-white rounded-3xl p-6 shadow-2xl shadow-navy-900/10 border border-slate-200">
                
                {/* Active Dispatch Live Demo Card */}
                <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                  <div className="flex items-center gap-2.5">
                    <span className="w-3 h-3 rounded-full bg-emerald-500 animate-ping" />
                    <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Live Incident Dispatch
                    </span>
                  </div>
                  <span className="text-xs font-bold text-brand-blue bg-blue-50 px-2.5 py-1 rounded-full">
                    ETA: 8 mins
                  </span>
                </div>

                {/* Simulated Breakdown Status */}
                <div className="py-5 space-y-4">
                  <div className="flex items-start gap-3.5 p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
                    <div className="w-10 h-10 rounded-xl bg-navy-900 text-white flex items-center justify-center flex-shrink-0">
                      <Car className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-navy-900">Flat Tyre on Madhapur Main Rd</div>
                      <div className="text-xs text-slate-500">Vehicle: Hyundai Creta (TS09EA4589)</div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3.5 p-3.5 rounded-2xl bg-blue-50/70 border border-blue-100">
                    <div className="w-10 h-10 rounded-xl bg-brand-blue text-white flex items-center justify-center flex-shrink-0">
                      <Wrench className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-navy-900">QuickFix Auto Rescue Dispatched</div>
                      <div className="text-xs text-slate-600">Technician: Vikram M. (⭐ 4.9) • 1.2 km away</div>
                    </div>
                  </div>

                  {/* Progress Line */}
                  <div className="space-y-1.5 pt-2">
                    <div className="flex justify-between text-xs font-semibold text-slate-600">
                      <span>En-Route to Breakdown Spot</span>
                      <span className="text-brand-blue">Stage 3 of 5</span>
                    </div>
                    <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                      <div className="bg-brand-blue h-full rounded-full w-3/5 transition-all duration-500" />
                    </div>
                  </div>
                </div>

                {/* Direct Action in Card */}
                <div className="pt-2">
                  <Link
                    to="/report-breakdown"
                    className="w-full py-3 rounded-xl bg-navy-900 text-white text-xs font-bold hover:bg-navy-800 transition-colors flex items-center justify-center gap-2"
                  >
                    <span>Launch Breakdown Report</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Available Services Section */}
      <section id="services" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-14">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-brand-blue text-xs font-bold uppercase tracking-wider">
            Comprehensive roadside assistance
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-navy-900 tracking-tight">
            Services Available 24 Hours, 7 Days A Week
          </h2>
          <p className="text-slate-600 text-sm sm:text-base">
            From minor punctures to flatbed recovery, our certified rescue squad is equipped with industrial tools to get you rolling again.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="bg-white rounded-2xl p-7 border border-slate-200 shadow-card hover:shadow-hover hover:-translate-y-1 transition-all group relative flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-5">
                    <div className="w-12 h-12 rounded-xl bg-blue-50 text-brand-blue flex items-center justify-center group-hover:bg-brand-blue group-hover:text-white transition-colors">
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700">
                      {item.badge}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-navy-900 mb-2">{item.title}</h3>
                  <p className="text-sm text-slate-600 leading-relaxed mb-6">{item.desc}</p>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                  <span className="text-sm font-extrabold text-navy-900">{item.price}</span>
                  <Link
                    to={`/report-breakdown?category=${encodeURIComponent(item.title.split(' ')[0])}`}
                    className="text-xs font-bold text-brand-blue hover:text-blue-700 flex items-center gap-1"
                  >
                    <span>Request Now</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="bg-navy-900 text-white py-20 rounded-3xl mx-4 sm:mx-6 lg:mx-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
            <span className="text-xs font-bold uppercase tracking-widest text-brand-blue bg-blue-500/10 px-3 py-1 rounded-full">
              Seamless 4-Step Process
            </span>
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
              How RoadAssist Works in an Emergency
            </h2>
            <p className="text-slate-300 text-sm sm:text-base">
              Designed for high stress roadside situations. Simple, clear, and fast without redundant phone trees.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((st, idx) => (
              <div key={idx} className="relative p-6 rounded-2xl bg-navy-950/60 border border-slate-800 space-y-4">
                <span className="text-3xl font-black text-brand-blue block">{st.step}</span>
                <h3 className="text-lg font-bold text-white">{st.title}</h3>
                <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">{st.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose RoadAssist Section */}
      <section id="why-us" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          <div className="lg:col-span-6 space-y-6">
            <span className="text-xs font-bold uppercase tracking-widest text-brand-blue bg-blue-50 px-3 py-1 rounded-full">
              Why Drivers Trust RoadAssist
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-navy-900 tracking-tight leading-snug">
              Built to Eliminate Roadside Vulnerability and Long Waits.
            </h2>
            <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
              Traditional roadside clubs leave you on hold for 45 minutes with no tracking. RoadAssist uses modern GPS and WebSockets to connect you directly with nearby vetted specialists.
            </p>

            <div className="space-y-4 pt-2">
              <div className="flex items-start gap-3.5">
                <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-navy-900">100% Upfront Transparent Billing</h4>
                  <p className="text-xs text-slate-500">Know base rates and per-km transit costs before booking. No hidden roadside gouging.</p>
                </div>
              </div>

              <div className="flex items-start gap-3.5">
                <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-navy-900">Live GPS Technician Tracking</h4>
                  <p className="text-xs text-slate-500">Track your dispatched rescue van live on OpenStreetMap with real-time ETA countdowns.</p>
                </div>
              </div>

              <div className="flex items-start gap-3.5">
                <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-navy-900">Emergency SOS Safety Center</h4>
                  <p className="text-xs text-slate-500">Instant coordinates sharing and 1-click speed dial to police (100) and ambulance (108).</p>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-6 bg-gradient-to-tr from-slate-100 to-blue-50 p-8 rounded-3xl border border-slate-200 space-y-6">
            <h3 className="text-xl font-bold text-navy-900">Driver Safety Guarantee</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Every service partner undergoes identity check, police clearance, and commercial workshop inspection. Your safety on the road is our priority.
            </p>

            <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200/80 space-y-3">
              <div className="flex items-center gap-2 text-sm font-bold text-navy-900">
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
                <span>Verified Mechanic Badge</span>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                Only providers that pass admin verification appear in customer searches. Unverified providers cannot accept requests.
              </p>
            </div>

            <div className="pt-2">
              <Link
                to="/register?role=provider"
                className="inline-flex items-center gap-2 text-sm font-bold text-brand-blue hover:text-blue-800"
              >
                <span>Are you a garage owner or recovery mechanic? Partner with us</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

        </div>
      </section>

      {/* Customer Testimonials */}
      <section id="testimonials" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto space-y-3 mb-12">
          <span className="text-xs font-bold uppercase tracking-widest text-brand-blue bg-blue-50 px-3 py-1 rounded-full">
            Real Stories
          </span>
          <h2 className="text-3xl font-black text-navy-900">What Rescued Drivers Say</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((t, idx) => (
            <div key={idx} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center gap-1 text-amber-400">
                {[...Array(t.rating)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-400" />
                ))}
              </div>
              <p className="text-sm text-slate-600 leading-relaxed italic">"{t.comment}"</p>
              <div className="pt-2 border-t border-slate-100">
                <div className="text-sm font-bold text-navy-900">{t.name}</div>
                <div className="text-xs text-slate-500">{t.vehicle}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-3 mb-10">
          <span className="text-xs font-bold uppercase tracking-widest text-brand-blue bg-blue-50 px-3 py-1 rounded-full">
            Clear Answers
          </span>
          <h2 className="text-3xl font-black text-navy-900">Frequently Asked Questions</h2>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, idx) => (
            <div
              key={idx}
              className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm transition-all"
            >
              <button
                onClick={() => setOpenFaq(openFaq === idx ? -1 : idx)}
                className="w-full text-left p-5 flex items-center justify-between font-bold text-sm sm:text-base text-navy-900 hover:bg-slate-50"
              >
                <span>{faq.q}</span>
                <ChevronDown
                  className={`w-5 h-5 text-slate-400 transition-transform ${
                    openFaq === idx ? 'rotate-180 text-brand-blue' : ''
                  }`}
                />
              </button>
              {openFaq === idx && (
                <div className="px-5 pb-5 pt-1 text-sm text-slate-600 leading-relaxed border-t border-slate-100 bg-slate-50/50">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Final Call to Action */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-navy-900 via-navy-950 to-brand-blue text-white rounded-3xl p-8 sm:p-14 text-center space-y-6 shadow-2xl">
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight max-w-2xl mx-auto">
            Never Feel Stranded On The Highway Again.
          </h2>
          <p className="text-slate-300 text-sm sm:text-base max-w-xl mx-auto">
            Keep RoadAssist ready on your phone. Save your vehicles now for instant one-click rescue when you need it most.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <Link
              to="/register"
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-brand-orange text-white font-bold text-sm hover:bg-orange-600 transition-colors shadow-lg"
            >
              Create Free Account
            </Link>
            <Link
              to="/find-assistance"
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-sm transition-colors border border-white/20"
            >
              Browse Local Providers
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
};

export default LandingPage;
