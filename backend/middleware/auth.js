const { verifyToken } = require('../config/jwt');
const db = require('../config/db');

const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Access denied. No authentication token provided.'
    });
  }

  try {
    const decoded = verifyToken(token);
    
    // Fetch fresh user record from DB
    const [rows] = await db.query(
      'SELECT id, name, email, phone, role, status, emergency_contact_name, emergency_contact_phone FROM users WHERE id = ?',
      [decoded.id]
    );

    if (rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Invalid session. User account no longer exists.'
      });
    }

    const user = rows[0];

    if (user.status === 'suspended') {
      return res.status(403).json({
        success: false,
        message: 'Your account has been suspended by the administrator.'
      });
    }

    // If provider, attach provider profile id
    if (user.role === 'provider') {
      const [providerRows] = await db.query(
        'SELECT id, business_name, is_available, verification_status FROM providers WHERE user_id = ?',
        [user.id]
      );
      if (providerRows.length > 0) {
        user.provider_id = providerRows[0].id;
        user.business_name = providerRows[0].business_name;
        user.is_available = providerRows[0].is_available;
        user.verification_status = providerRows[0].verification_status;
      }
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Authentication failed. Token is expired or invalid.'
    });
  }
};

const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Forbidden. This action requires one of the following roles: ${allowedRoles.join(', ')}`
      });
    }
    next();
  };
};

module.exports = {
  authenticateToken,
  authorizeRoles
};
