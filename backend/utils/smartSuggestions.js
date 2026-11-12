/**
 * Smart Breakdown Rule-Based Intelligence Engine
 * Provides context-aware recommendations, immediate safety instructions,
 * recommended provider service matching, and indicative cost ranges.
 */

const SMART_SUGGESTIONS = {
  'Flat Tyre': {
    title: 'Flat Tyre / Puncture Assistance',
    matchedService: 'Flat Tyre Repair & Replacement',
    recommendedProvidersKeyword: 'Flat Tyre',
    safetyTips: [
      'Engage hazard warning lights immediately.',
      'Pull over safely to the level shoulder/side of the road away from active traffic.',
      'Apply parking handbrake firmly and place warning reflective triangle 50m behind vehicle.',
      'Do not attempt to replace tyre on an incline or soft road shoulder.'
    ],
    immediateAction: 'If you have a functional spare tyre and jack, the technician can mount it in under 20 mins. Alternatively, puncture plugging and portable 12V air inflation will be performed.',
    typicalDuration: '15 - 25 mins',
    indicativeCostRange: '₹250 - ₹450'
  },
  'Battery Failure': {
    title: 'Battery Jump-Start & Electrical Check',
    matchedService: '12V Battery Jump-Start',
    recommendedProvidersKeyword: 'Battery Failure',
    safetyTips: [
      'Turn off headlamps, cabin lights, AC blower, and entertainment system to prevent further drain.',
      'Keep bonnet/hood latch unlocked for technician access.',
      'Ensure vehicle is in Park (automatic) or Neutral with handbrake up (manual).',
      'Never smoke or use open flames near a vehicle battery.'
    ],
    immediateAction: 'Our technician will bring a high-amperage booster pack or jumper cables, start the engine, and perform an alternator charging output test.',
    typicalDuration: '10 - 20 mins',
    indicativeCostRange: '₹300 - ₹500'
  },
  'Fuel Shortage': {
    title: 'Emergency Fuel Dispatch',
    matchedService: 'Emergency Fuel Delivery (5 Litres)',
    recommendedProvidersKeyword: 'Fuel Shortage',
    safetyTips: [
      'Do not crank engine repeatedly if fuel is completely empty (avoids fuel pump overheating).',
      'Coast safely to the kerb or emergency shoulder while steering is still operational.',
      'Specify exact fuel type (Petrol vs Diesel / Ethanol blend) in notes.'
    ],
    immediateAction: 'Authorized technician delivers 5 Litres of certified sealed container fuel directly to your location with safety funnel pouring.',
    typicalDuration: '20 - 35 mins',
    indicativeCostRange: '₹400 - ₹650 (incl. delivery + fuel)'
  },
  'Engine Failure': {
    title: 'Engine Diagnostics & Roadside Repair',
    matchedService: 'Engine Diagnostic & Minor Fix',
    recommendedProvidersKeyword: 'Engine Failure',
    safetyTips: [
      'If you notice smoke, burning smell or loud knocking, switch off ignition immediately.',
      'Step out of the vehicle and wait on a safe pavement or behind the highway guard rail.',
      'Do not open radiator cap or hot coolant expansion tank.'
    ],
    immediateAction: 'Technician will connect an OBD-II diagnostic scanner to read ECU error codes, inspect ignition coils, fuel lines, spark plugs, and drive belts.',
    typicalDuration: '30 - 60 mins',
    indicativeCostRange: '₹500 - ₹950'
  },
  'Overheating': {
    title: 'Coolant & Thermal System Rescue',
    matchedService: 'Coolant Flush & Overheat Rescue',
    recommendedProvidersKeyword: 'Overheating',
    safetyTips: [
      'Turn off AC immediately and turn heater on maximum for 1-2 minutes if safe to dissipate thermal load.',
      'Pull over and turn off the engine to prevent cylinder head warpage or gasket blow.',
      'CAUTION: NEVER touch or twist the radiator pressure cap while hot. Extreme steam burns possible!'
    ],
    immediateAction: 'Technician checks for coolant leaks, hose ruptures, radiator fan relay malfunction, and refills coolant once engine drops below 60°C.',
    typicalDuration: '25 - 45 mins',
    indicativeCostRange: '₹450 - ₹750'
  },
  'Accident': {
    title: 'Accident Recovery & Towing Assistance',
    matchedService: 'Accident Recovery & Flatbed Towing',
    recommendedProvidersKeyword: 'Accident',
    safetyTips: [
      'Ensure all passengers are safe. If injuries exist, dial emergency medical services (108) immediately.',
      'Turn hazard flashers on and turn engine off to minimize fire hazard.',
      'Take photos of damage, road position, and other vehicles before moving.',
      'Do not stand between vehicles or behind an unbraked vehicle.'
    ],
    immediateAction: 'Heavy-duty hydraulic flatbed tow truck is dispatched to securely winch and transport your car to your preferred body shop or service center.',
    typicalDuration: '30 - 60 mins',
    indicativeCostRange: '₹999 - ₹2500'
  },
  'Other Mechanical Issues': {
    title: 'General Mechanical Breakdown Support',
    matchedService: 'General Mechanical Breakdown',
    recommendedProvidersKeyword: 'Other Mechanical Issues',
    safetyTips: [
      'Maintain hazard lights on if vehicle is partly obstructing traffic.',
      'Keep your phone charged and stay in clear visual range of the breakdown spot.',
      'Share live location with a family member or friend.'
    ],
    immediateAction: 'Certified multi-brand mechanic arrives with full mobile toolkit to inspect clutch, gearbox, brakes, steering linkage, and electrical fuses.',
    typicalDuration: '30 - 50 mins',
    indicativeCostRange: '₹400 - ₹800'
  }
};

function getSuggestionForCategory(category) {
  return SMART_SUGGESTIONS[category] || SMART_SUGGESTIONS['Other Mechanical Issues'];
}

module.exports = {
  SMART_SUGGESTIONS,
  getSuggestionForCategory
};
