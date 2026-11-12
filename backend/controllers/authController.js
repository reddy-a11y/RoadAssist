const bcrypt = require('bcryptjs');
const db = require('../config/db');
const { generateToken } = require('../config/jwt');

/**
 * Register User (Customer or Provider)
 */
const register = async (req, res, next) => {
  try {
    const {
      name,
      email,
      password,
      phone,
      role = 'customer',
      emergencyContactName,
      emergencyContactPhone,
      // Provider-specific fields:
      businessName,
      address,
      city = 'Hyderabad',
      latitude,
      longitude,
      servicesOffered,
      baseCharge,
      perKmCharge,
      operatingHours
    } = req.body;

    if (!name || !email || !password || !phone) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, password, and phone number are required.'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long.'
      });
    }

    // Check if email already registered
    const [existingUsers] = await db.query('SELECT id FROM users WHERE email = ?', [email.toLowerCase().trim()]);
    if (existingUsers.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'An account with this email address already exists.'
      });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const assignedRole = ['customer', 'provider'].includes(role) ? role : 'customer';

    const conn = await db.getConnection();
    await conn.beginTransaction();

    try {
      const [userResult] = await conn.query(
        `INSERT INTO users (name, email, password_hash, phone, role, emergency_contact_name, emergency_contact_phone)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          name.trim(),
          email.toLowerCase().trim(),
          passwordHash,
          phone.trim(),
          assignedRole,
          emergencyContactName || null,
          emergencyContactPhone || null
        ]
      );

      const userId = userResult.insertId;
      let providerData = null;

      if (assignedRole === 'provider') {
        const servicesArray = Array.isArray(servicesOffered)
          ? servicesOffered
          : ['Flat Tyre', 'Battery Failure', 'Engine Failure', 'Fuel Shortage'];

        const lat = parseFloat(latitude) || 17.4485;
        const lng = parseFloat(longitude) || 78.3748;

        const [providerResult] = await conn.query(
          `INSERT INTO providers (user_id, business_name, owner_name, phone, address, city, latitude, longitude, services_offered, operating_hours, base_charge, per_km_charge, is_available, verification_status)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, TRUE, 'pending')`,
          [
            userId,
            businessName ? businessName.trim() : `${name}'s Auto Rescue`,
            name.trim(),
            phone.trim(),
            address ? address.trim() : 'Madhapur, Hitec City',
            city,
            lat,
            lng,
            JSON.stringify(servicesArray),
            operatingHours || '24/7 Available',
            parseFloat(baseCharge) || 350.00,
            parseFloat(perKmCharge) || 25.00
          ]
        );

        const providerId = providerResult.insertId;

        // Initialize provider availability
        await conn.query(
          `INSERT INTO provider_availability (provider_id, is_online, current_latitude, current_longitude)
           VALUES (?, TRUE, ?, ?)`,
          [providerId, lat, lng]
        );

        // Notify Admin of new provider
        await conn.query(
          `INSERT INTO notifications (user_id, title, message, type)
           VALUES (1, 'New Provider Registration', ?, 'verification')`,
          [`${businessName || name} registered as a roadside provider and is awaiting review.`]
        );

        providerData = {
          id: providerId,
          businessName: businessName || name,
          verificationStatus: 'pending'
        };
      }

      await conn.commit();
      conn.release();

      const token = generateToken({ id: userId, email, role: assignedRole });

      return res.status(201).json({
        success: true,
        message: assignedRole === 'provider'
          ? 'Provider registered successfully. Awaiting administrative verification.'
          : 'Customer registration successful!',
        token,
        user: {
          id: userId,
          name,
          email: email.toLowerCase().trim(),
          phone,
          role: assignedRole,
          emergencyContactName,
          emergencyContactPhone,
          provider: providerData
        }
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
 * Login User (Customer, Provider, or Admin)
 */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both email and password.'
      });
    }

    const [rows] = await db.query(
      `SELECT id, name, email, password_hash, phone, role, status, emergency_contact_name, emergency_contact_phone
       FROM users WHERE email = ?`,
      [email.toLowerCase().trim()]
    );

    if (rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials. Please check your email and password.'
      });
    }

    const user = rows[0];

    if (user.status === 'suspended') {
      return res.status(403).json({
        success: false,
        message: 'Your account has been suspended. Please contact platform administration.'
      });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials. Please check your email and password.'
      });
    }

    let providerData = null;
    if (user.role === 'provider') {
      const [providers] = await db.query(
        `SELECT id, business_name, owner_name, phone, address, city, latitude, longitude,
                services_offered, operating_hours, base_charge, per_km_charge, is_available,
                verification_status, rating, total_ratings, total_services_completed, total_earnings
         FROM providers WHERE user_id = ?`,
        [user.id]
      );
      if (providers.length > 0) {
        providerData = providers[0];
      }
    }

    const token = generateToken({ id: user.id, email: user.email, role: user.role });

    return res.json({
      success: true,
      message: 'Logged in successfully.',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        status: user.status,
        emergencyContactName: user.emergency_contact_name,
        emergencyContactPhone: user.emergency_contact_phone,
        provider: providerData
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get Current Logged-in User Profile
 */
const getMe = async (req, res, next) => {
  try {
    const user = req.user;

    let providerData = null;
    if (user.role === 'provider') {
      const [providers] = await db.query(
        `SELECT id, business_name, owner_name, phone, address, city, latitude, longitude,
                services_offered, operating_hours, base_charge, per_km_charge, is_available,
                verification_status, rating, total_ratings, total_services_completed, total_earnings
         FROM providers WHERE user_id = ?`,
        [user.id]
      );
      if (providers.length > 0) {
        providerData = providers[0];
      }
    }

    return res.json({
      success: true,
      user: {
        ...user,
        provider: providerData
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update Profile Details (Name, Phone, Emergency Contacts)
 */
const updateProfile = async (req, res, next) => {
  try {
    const { name, phone, emergencyContactName, emergencyContactPhone } = req.body;
    const userId = req.user.id;

    await db.query(
      `UPDATE users
       SET name = COALESCE(?, name),
           phone = COALESCE(?, phone),
           emergency_contact_name = COALESCE(?, emergency_contact_name),
           emergency_contact_phone = COALESCE(?, emergency_contact_phone)
       WHERE id = ?`,
      [name, phone, emergencyContactName, emergencyContactPhone, userId]
    );

    const [updated] = await db.query(
      'SELECT id, name, email, phone, role, emergency_contact_name, emergency_contact_phone FROM users WHERE id = ?',
      [userId]
    );

    return res.json({
      success: true,
      message: 'Profile updated successfully.',
      user: updated[0]
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  getMe,
  updateProfile
};
