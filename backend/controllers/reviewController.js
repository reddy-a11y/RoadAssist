const db = require('../config/db');

/**
 * Submit Review for a Completed Assistance Request
 */
const createReview = async (req, res, next) => {
  try {
    const customerId = req.user.id;
    const { requestId, rating, comment } = req.body;

    if (!requestId || !rating || !comment) {
      return res.status(400).json({
        success: false,
        message: 'Request ID, rating (1-5), and feedback comment are required.'
      });
    }

    const starRating = parseInt(rating, 10);
    if (starRating < 1 || starRating > 5) {
      return res.status(400).json({
        success: false,
        message: 'Rating must be an integer between 1 and 5.'
      });
    }

    // Check request existence and completion
    const [requests] = await db.query(
      'SELECT id, customer_id, provider_id, status FROM assistance_requests WHERE id = ?',
      [requestId]
    );

    if (requests.length === 0) {
      return res.status(404).json({ success: false, message: 'Request not found.' });
    }

    const request = requests[0];

    if (request.customer_id !== customerId) {
      return res.status(403).json({ success: false, message: 'You can only review requests initiated by you.' });
    }

    if (request.status !== 'completed') {
      return res.status(400).json({ success: false, message: 'Reviews can only be submitted after service completion.' });
    }

    if (!request.provider_id) {
      return res.status(400).json({ success: false, message: 'No provider was assigned to this request.' });
    }

    // Check if already reviewed
    const [existing] = await db.query('SELECT id FROM reviews WHERE request_id = ?', [requestId]);
    if (existing.length > 0) {
      return res.status(409).json({ success: false, message: 'You have already reviewed this service.' });
    }

    const conn = await db.getConnection();
    await conn.beginTransaction();

    try {
      await conn.query(
        `INSERT INTO reviews (request_id, customer_id, provider_id, rating, comment)
         VALUES (?, ?, ?, ?, ?)`,
        [requestId, customerId, request.provider_id, starRating, comment.trim()]
      );

      // Recalculate provider aggregate rating
      const [agg] = await conn.query(
        `SELECT COUNT(*) as total_ratings, AVG(rating) as avg_rating
         FROM reviews WHERE provider_id = ?`,
        [request.provider_id]
      );

      const totalRatings = agg[0].total_ratings || 0;
      const avgRating = Math.round((agg[0].avg_rating || 5.0) * 100) / 100;

      await conn.query(
        `UPDATE providers
         SET rating = ?, total_ratings = ?
         WHERE id = ?`,
        [avgRating, totalRatings, request.provider_id]
      );

      // Notify provider
      const [prov] = await conn.query('SELECT user_id FROM providers WHERE id = ?', [request.provider_id]);
      if (prov.length > 0) {
        await conn.query(
          `INSERT INTO notifications (user_id, title, message, type)
           VALUES (?, 'New Customer Review!', ?, 'review')`,
          [
            prov[0].user_id,
            `A customer gave you a ${starRating}-star rating: "${comment.slice(0, 80)}..."`
          ]
        );
      }

      await conn.commit();
      conn.release();

      return res.status(201).json({
        success: true,
        message: 'Thank you! Your feedback has been submitted.',
        rating: starRating,
        comment
      });
    } catch (txError) {
      await conn.rollback();
      conn.release();
      throw txError;
    }
  } catch (error) {
    next(error);
  }
};

/**
 * Get Reviews for a Provider
 */
const getProviderReviews = async (req, res, next) => {
  try {
    const providerId = req.params.providerId;
    const [reviews] = await db.query(
      `SELECT r.*, u.name as customer_name, ar.category, ar.request_code
       FROM reviews r
       JOIN users u ON r.customer_id = u.id
       JOIN assistance_requests ar ON r.request_id = ar.id
       WHERE r.provider_id = ?
       ORDER BY r.id DESC`,
      [providerId]
    );

    return res.json({
      success: true,
      reviews
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get All Reviews (Admin / Public Testimonials)
 */
const getAllReviews = async (req, res, next) => {
  try {
    const [reviews] = await db.query(
      `SELECT r.*, u.name as customer_name, p.business_name as provider_name,
              ar.category, ar.request_code
       FROM reviews r
       JOIN users u ON r.customer_id = u.id
       JOIN providers p ON r.provider_id = p.id
       JOIN assistance_requests ar ON r.request_id = ar.id
       ORDER BY r.id DESC LIMIT 50`
    );

    return res.json({
      success: true,
      reviews
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createReview,
  getProviderReviews,
  getAllReviews
};
