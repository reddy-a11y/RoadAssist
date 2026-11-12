const db = require('../config/db');

/**
 * Get Comprehensive Admin Analytics for SaaS Dashboard & Recharts Graphs
 */
const getDashboardAnalytics = async (req, res, next) => {
  try {
    // 1. Overall Counts
    const [userCounts] = await db.query(
      `SELECT
        COUNT(CASE WHEN role = 'customer' THEN 1 END) as total_customers,
        COUNT(CASE WHEN role = 'provider' THEN 1 END) as total_providers,
        COUNT(CASE WHEN role = 'admin' THEN 1 END) as total_admins
       FROM users`
    );

    const [providerCounts] = await db.query(
      `SELECT
        COUNT(*) as total_providers_records,
        SUM(CASE WHEN verification_status = 'pending' THEN 1 ELSE 0 END) as pending_verifications,
        SUM(CASE WHEN verification_status = 'verified' THEN 1 ELSE 0 END) as verified_providers,
        SUM(CASE WHEN verification_status = 'rejected' THEN 1 ELSE 0 END) as rejected_providers,
        SUM(CASE WHEN is_available = TRUE AND verification_status = 'verified' THEN 1 ELSE 0 END) as active_online_providers
       FROM providers`
    );

    const [requestCounts] = await db.query(
      `SELECT
        COUNT(*) as total_requests,
        SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed_requests,
        SUM(CASE WHEN status IN ('pending', 'accepted', 'on_the_way', 'in_progress') THEN 1 ELSE 0 END) as active_requests,
        SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) as cancelled_requests,
        SUM(CASE WHEN status = 'rejected' THEN 1 ELSE 0 END) as rejected_requests,
        COALESCE(SUM(CASE WHEN status = 'completed' THEN final_cost ELSE 0 END), 0) as total_revenue
       FROM assistance_requests`
    );

    // 2. Breakdown Categories Distribution (for Recharts Pie/Bar chart)
    const [categoryDistribution] = await db.query(
      `SELECT category, COUNT(*) as count,
              COALESCE(SUM(final_cost), 0) as revenue
       FROM assistance_requests
       GROUP BY category
       ORDER BY count DESC`
    );

    // 3. Request Status Breakdown (for Recharts Doughnut chart)
    const [statusDistribution] = await db.query(
      `SELECT status, COUNT(*) as count
       FROM assistance_requests
       GROUP BY status`
    );

    // 4. Monthly/Daily volume trend (past 7 days or sample dates for charts)
    const [trends] = await db.query(
      `SELECT DATE(created_at) as date,
              COUNT(*) as requests_count,
              SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed_count,
              COALESCE(SUM(CASE WHEN status = 'completed' THEN final_cost ELSE 0 END), 0) as revenue
       FROM assistance_requests
       GROUP BY DATE(created_at)
       ORDER BY date ASC LIMIT 14`
    );

    // 5. Recent 10 Assistance Requests
    const [recentRequests] = await db.query(
      `SELECT ar.id, ar.request_code, ar.category, ar.status, ar.final_cost, ar.created_at,
              u.name as customer_name, u.phone as customer_phone,
              p.business_name as provider_name
       FROM assistance_requests ar
       JOIN users u ON ar.customer_id = u.id
       LEFT JOIN providers p ON ar.provider_id = p.id
       ORDER BY ar.id DESC LIMIT 10`
    );

    // 6. Top Performing Providers
    const [topProviders] = await db.query(
      `SELECT p.id, p.business_name, p.rating, p.total_ratings,
              p.total_services_completed, p.total_earnings, p.verification_status,
              u.name as owner_name, u.email
       FROM providers p
       JOIN users u ON p.user_id = u.id
       WHERE p.verification_status = 'verified'
       ORDER BY p.total_services_completed DESC, p.rating DESC LIMIT 5`
    );

    return res.json({
      success: true,
      analytics: {
        totalCustomers: userCounts[0].total_customers || 0,
        totalProviders: providerCounts[0].total_providers_records || 0,
        pendingVerifications: providerCounts[0].pending_verifications || 0,
        verifiedProviders: providerCounts[0].verified_providers || 0,
        activeOnlineProviders: providerCounts[0].active_online_providers || 0,
        totalRequests: requestCounts[0].total_requests || 0,
        completedRequests: requestCounts[0].completed_requests || 0,
        activeRequests: requestCounts[0].active_requests || 0,
        cancelledRequests: requestCounts[0].cancelled_requests || 0,
        totalRevenue: parseFloat(requestCounts[0].total_revenue || 0)
      },
      categoryDistribution,
      statusDistribution,
      trends,
      recentRequests,
      topProviders
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all users with search and filter
 */
const getAllUsers = async (req, res, next) => {
  try {
    const { role, status, search } = req.query;

    let query = `
      SELECT id, name, email, phone, role, status, emergency_contact_name, emergency_contact_phone, created_at
      FROM users
      WHERE 1=1
    `;
    const params = [];

    if (role && role !== 'all') {
      query += ' AND role = ?';
      params.push(role);
    }

    if (status && status !== 'all') {
      query += ' AND status = ?';
      params.push(status);
    }

    if (search) {
      query += ' AND (name LIKE ? OR email LIKE ? OR phone LIKE ?)';
      const s = `%${search}%`;
      params.push(s, s, s);
    }

    query += ' ORDER BY id DESC';

    const [users] = await db.query(query, params);

    return res.json({
      success: true,
      users
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update user status (active / suspended)
 */
const updateUserStatus = async (req, res, next) => {
  try {
    const userId = req.params.id;
    const { status } = req.body;

    if (!['active', 'suspended'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status.' });
    }

    // Protect admin from self-suspension
    if (parseInt(userId, 10) === req.user.id) {
      return res.status(400).json({ success: false, message: 'Administrators cannot suspend their own account.' });
    }

    await db.query('UPDATE users SET status = ? WHERE id = ?', [status, userId]);

    return res.json({
      success: true,
      message: `User status changed to '${status}'.`
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all providers for Admin review
 */
const getAllProviders = async (req, res, next) => {
  try {
    const { status, search } = req.query;

    let query = `
      SELECT p.*, u.name as owner_real_name, u.email as provider_email, u.status as user_account_status
      FROM providers p
      JOIN users u ON p.user_id = u.id
      WHERE 1=1
    `;
    const params = [];

    if (status && status !== 'all') {
      query += ' AND p.verification_status = ?';
      params.push(status);
    }

    if (search) {
      query += ' AND (p.business_name LIKE ? OR p.owner_name LIKE ? OR p.phone LIKE ? OR p.city LIKE ?)';
      const s = `%${search}%`;
      params.push(s, s, s, s);
    }

    query += ' ORDER BY p.verification_status = "pending" DESC, p.id DESC';

    const [providers] = await db.query(query, params);

    const formatted = providers.map((p) => {
      let services = [];
      try {
        services = typeof p.services_offered === 'string' ? JSON.parse(p.services_offered) : p.services_offered;
      } catch (e) {
        services = [];
      }
      return {
        ...p,
        services_offered: services
      };
    });

    return res.json({
      success: true,
      providers: formatted
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Verify or Reject Service Provider
 */
const updateProviderVerification = async (req, res, next) => {
  try {
    const providerId = req.params.id;
    const { verificationStatus, rejectionReason } = req.body;

    if (!['verified', 'rejected', 'pending'].includes(verificationStatus)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid verification status. Must be verified, rejected, or pending.'
      });
    }

    const [rows] = await db.query('SELECT p.id, p.user_id, p.business_name FROM providers p WHERE p.id = ?', [providerId]);
    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Provider not found.' });
    }

    const provider = rows[0];

    await db.query(
      `UPDATE providers
       SET verification_status = ?, rejection_reason = ?
       WHERE id = ?`,
      [verificationStatus, rejectionReason || null, providerId]
    );

    // Notify provider
    const isApproved = verificationStatus === 'verified';
    await db.query(
      `INSERT INTO notifications (user_id, title, message, type)
       VALUES (?, ?, ?, 'verification')`,
      [
        provider.user_id,
        isApproved ? 'Account Verified!' : 'Account Verification Update',
        isApproved
          ? 'Congratulations! Your roadside service provider account has been verified. You can now receive customer requests.'
          : `Your account verification was not approved: ${rejectionReason || 'Please verify license details.'}`
      ]
    );

    return res.json({
      success: true,
      message: `Provider status updated to '${verificationStatus}'.`
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all requests across platform (Admin Monitoring)
 */
const getAllRequests = async (req, res, next) => {
  try {
    const { status, category, search } = req.query;

    let query = `
      SELECT ar.*,
             u.name as customer_name, u.phone as customer_phone, u.email as customer_email,
             p.business_name as provider_name, p.phone as provider_phone,
             v.make, v.model, v.registration_number
      FROM assistance_requests ar
      JOIN users u ON ar.customer_id = u.id
      LEFT JOIN providers p ON ar.provider_id = p.id
      LEFT JOIN vehicles v ON ar.vehicle_id = v.id
      WHERE 1=1
    `;
    const params = [];

    if (status && status !== 'all') {
      query += ' AND ar.status = ?';
      params.push(status);
    }

    if (category && category !== 'all') {
      query += ' AND ar.category = ?';
      params.push(category);
    }

    if (search) {
      query += ' AND (ar.request_code LIKE ? OR u.name LIKE ? OR ar.address LIKE ?)';
      const s = `%${search}%`;
      params.push(s, s, s);
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
  getDashboardAnalytics,
  getAllUsers,
  updateUserStatus,
  getAllProviders,
  updateProviderVerification,
  getAllRequests
};
