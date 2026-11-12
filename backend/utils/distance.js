/**
 * Calculate distance between two lat/lng coordinates in kilometers using Haversine formula
 */
function calculateDistance(lat1, lon1, lat2, lon2) {
  if (!lat1 || !lon1 || !lat2 || !lon2) return null;

  const toRad = (value) => (value * Math.PI) / 180;
  const R = 6371; // Earth radius in km

  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  return Math.round(distance * 10) / 10; // Round to 1 decimal place
}

/**
 * Estimate travel time in minutes based on distance (assuming average city speed 25 km/h + 5 min prep)
 */
function estimateEtaMinutes(distanceKm) {
  if (!distanceKm) return 15;
  const minutes = Math.round((distanceKm / 25) * 60) + 5;
  return Math.max(10, Math.min(minutes, 90));
}

module.exports = {
  calculateDistance,
  estimateEtaMinutes
};
