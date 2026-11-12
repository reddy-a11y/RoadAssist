const db = require('../config/db');
const { calculateDistance, estimateEtaMinutes } = require('../utils/distance');

/**
 * Get Nearby Assistance Providers with Smart Matching, Distance, and Indicative Cost
 */
const getNearbyProviders = async (req, res, next) => {
  try {
    const { lat, lng, category, maxDistance = 35, sortBy = 'smart_match' } = req.query;

    const userLat = parseFloat(lat) || 17.4485;
    const userLng = parseFloat(lng) || 78.3748;

    // Fetch verified and available providers
    const [providers] = await db.query(
      `SELECT p.id, p.user_id, p.business_name, p.owner_name, p.phone, p.address, p.city,
              p.latitude, p.longitude, p.services_offered, p.operating_hours, p.base_charge,
              p.per_km_charge, p.is_available, p.verification_status, p.rating, p.total_ratings,
              p.total_services_completed,
              pa.is_online, pa.current_latitude, pa.current_longitude
       FROM providers p
       LEFT JOIN provider_availability pa ON p.id = pa.provider_id
       WHERE p.verification_status = 'verified' AND p.is_available = TRUE`
    );

    let matchingProviders = [];

    for (const provider of providers) {
      let services = [];
      try {
        services = typeof provider.services_offered === 'string'
          ? JSON.parse(provider.services_offered)
          : provider.services_offered;
      } catch (e) {
        services = [];
      }

      // Check category compatibility if specified
      if (category && category !== 'All' && !services.includes(category)) {
        continue;
      }

      const pLat = provider.current_latitude || provider.latitude;
      const pLng = provider.current_longitude || provider.longitude;

      const distanceKm = calculateDistance(userLat, userLng, pLat, pLng);

      // Filter by max distance (if set)
      if (distanceKm > parseFloat(maxDistance)) {
        continue;
      }

      const etaMins = estimateEtaMinutes(distanceKm);
      const estimatedCost = Math.round(parseFloat(provider.base_charge) + (distanceKm * parseFloat(provider.per_km_charge)));

      // Smart score calculation (0 - 100)
      // Factors: High rating (weight 40%), Proximity (weight 40%), Experience/Completed (weight 20%)
      const ratingScore = (parseFloat(provider.rating) / 5) * 40;
      const proximityScore = Math.max(0, (1 - (distanceKm / 20))) * 40;
      const experienceScore = Math.min(20, (provider.total_services_completed / 100) * 20);
      const smartScore = Math.round(ratingScore + proximityScore + experienceScore);

      let badge = null;
      if (distanceKm <= 3.5) badge = 'Nearest Rescue';
      else if (parseFloat(provider.rating) >= 4.85) badge = 'Top Rated';
      else if (estimatedCost <= 450) badge = 'Best Value';

      matchingProviders.push({
        ...provider,
        services_offered: services,
        distanceKm,
        etaMins,
        estimatedCost,
        smartScore,
        badge
      });
    }

    // Sort providers
    if (sortBy === 'distance') {
      matchingProviders.sort((a, b) => a.distanceKm - b.distanceKm);
    } else if (sortBy === 'rating') {
      matchingProviders.sort((a, b) => b.rating - a.rating);
    } else if (sortBy === 'cost') {
      matchingProviders.sort((a, b) => a.estimatedCost - b.estimatedCost);
    } else {
      // Default: smart match score
      matchingProviders.sort((a, b) => b.smartScore - a.smartScore);
    }

    return res.json({
      success: true,
      count: matchingProviders.length,
      userLocation: { lat: userLat, lng: userLng },
      providers: matchingProviders
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get Provider Details by ID
 */
const getProviderById = async (req, res, next) => {
  try {
    const providerId = req.params.id;

    const [rows] = await db.query(
      `SELECT p.*, pa.is_online, pa.current_latitude, pa.current_longitude, pa.last_ping
       FROM providers p
       LEFT JOIN provider_availability pa ON p.id = pa.provider_id
       WHERE p.id = ?`,
      [providerId]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Provider not found.'
      });
    }

    const provider = rows[0];
    try {
      provider.services_offered = typeof provider.services_offered === 'string'
        ? JSON.parse(provider.services_offered)
        : provider.services_offered;
    } catch (e) {
      provider.services_offered = [];
    }

    // Fetch recent reviews
    const [reviews] = await db.query(
      `SELECT r.id, r.rating, r.comment, r.created_at, u.name as customer_name
       FROM reviews r
       JOIN users u ON r.customer_id = u.id
       WHERE r.provider_id = ?
       ORDER BY r.id DESC LIMIT 10`,
      [providerId]
    );

    return res.json({
      success: true,
      provider: {
        ...provider,
        reviews
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Toggle Provider Availability (Online / Offline)
 */
const updateAvailability = async (req, res, next) => {
  try {
    const providerId = req.user.provider_id;
    const { isAvailable } = req.body;

    if (!providerId) {
      return res.status(403).json({
        success: false,
        message: 'Only registered providers can update availability.'
      });
    }

    const availableBool = isAvailable === true || isAvailable === 'true' || isAvailable === 1;

    await db.query('UPDATE providers SET is_available = ? WHERE id = ?', [availableBool ? 1 : 0, providerId]);
    await db.query('UPDATE provider_availability SET is_online = ? WHERE provider_id = ?', [availableBool ? 1 : 0, providerId]);

    return res.json({
      success: true,
      message: `Status updated to ${availableBool ? 'Online' : 'Offline'}.`,
      isAvailable: availableBool
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update Provider GPS Coordinates
 */
const updateLocation = async (req, res, next) => {
  try {
    const providerId = req.user.provider_id;
    const { latitude, longitude } = req.body;

    if (!providerId) {
      return res.status(403).json({ success: false, message: 'Not a provider account.' });
    }

    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);

    if (isNaN(lat) || isNaN(lng)) {
      return res.status(400).json({ success: false, message: 'Valid coordinates are required.' });
    }

    await db.query(
      `UPDATE provider_availability
       SET current_latitude = ?, current_longitude = ?, is_online = TRUE
       WHERE provider_id = ?`,
      [lat, lng, providerId]
    );

    // Also update provider table default coordinate
    await db.query('UPDATE providers SET latitude = ?, longitude = ? WHERE id = ?', [lat, lng, providerId]);

    return res.json({
      success: true,
      message: 'Location updated.'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get Provider Dashboard Stats & Active Tasks
 */
const getProviderDashboard = async (req, res, next) => {
  try {
    const providerId = req.user.provider_id;

    if (!providerId) {
      return res.status(403).json({ success: false, message: 'Provider profile required.' });
    }

    const [providerRows] = await db.query('SELECT * FROM providers WHERE id = ?', [providerId]);
    const provider = providerRows[0];

    // Counts
    const [counts] = await db.query(
      `SELECT
        COUNT(*) as total_requests,
        SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending_requests,
        SUM(CASE WHEN status IN ('accepted', 'on_the_way', 'in_progress') THEN 1 ELSE 0 END) as active_requests,
        SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed_requests,
        SUM(CASE WHEN status = 'rejected' OR status = 'cancelled' THEN 1 ELSE 0 END) as rejected_requests,
        COALESCE(SUM(CASE WHEN status = 'completed' THEN final_cost ELSE 0 END), 0) as total_revenue
       FROM assistance_requests
       WHERE provider_id = ?`,
      [providerId]
    );

    // Active Jobs
    const [activeJobs] = await db.query(
      `SELECT ar.*, u.name as customer_name, u.phone as customer_phone,
              v.make, v.model, v.registration_number, v.vehicle_type
       FROM assistance_requests ar
       JOIN users u ON ar.customer_id = u.id
       LEFT JOIN vehicles v ON ar.vehicle_id = v.id
       WHERE ar.provider_id = ? AND ar.status IN ('accepted', 'on_the_way', 'in_progress')
       ORDER BY ar.created_at DESC`,
      [providerId]
    );

    // Recent Requests (last 5)
    const [recentRequests] = await db.query(
      `SELECT ar.*, u.name as customer_name, u.phone as customer_phone
       FROM assistance_requests ar
       JOIN users u ON ar.customer_id = u.id
       WHERE ar.provider_id = ?
       ORDER BY ar.id DESC LIMIT 5`,
      [providerId]
    );

    return res.json({
      success: true,
      stats: {
        totalRequests: counts[0].total_requests || 0,
        pendingRequests: counts[0].pending_requests || 0,
        activeRequests: counts[0].active_requests || 0,
        completedRequests: counts[0].completed_requests || 0,
        totalRevenue: parseFloat(counts[0].total_revenue || 0),
        rating: parseFloat(provider.rating),
        totalRatings: provider.total_ratings,
        isAvailable: Boolean(provider.is_available),
        verificationStatus: provider.verification_status
      },
      activeJobs,
      recentRequests
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all requests assigned to or available for provider
 */
const getProviderRequests = async (req, res, next) => {
  try {
    const providerId = req.user.provider_id;
    const { status } = req.query;

    if (!providerId) {
      return res.status(403).json({ success: false, message: 'Provider profile required.' });
    }

    let query = `
      SELECT ar.*, u.name as customer_name, u.phone as customer_phone,
             v.make, v.model, v.registration_number, v.vehicle_type
      FROM assistance_requests ar
      JOIN users u ON ar.customer_id = u.id
      LEFT JOIN vehicles v ON ar.vehicle_id = v.id
      WHERE ar.provider_id = ?
    `;
    const params = [providerId];

    if (status && status !== 'all') {
      query += ' AND ar.status = ?';
      params.push(status);
    }

    query += ' ORDER BY ar.id DESC';

    const [requests] = await db.query(query, params);

    return res.json({
      success: true,
      requests
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getNearbyProviders,
  getProviderById,
  updateAvailability,
  updateLocation,
  getProviderDashboard,
  getProviderRequests
};
