const db = require('../config/db');

/**
 * Get all saved vehicles for the logged-in customer
 */
const getVehicles = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const [vehicles] = await db.query(
      `SELECT id, user_id, make, model, year, registration_number, vehicle_type, color, is_default, created_at
       FROM vehicles WHERE user_id = ? ORDER BY is_default DESC, id DESC`,
      [userId]
    );

    return res.json({
      success: true,
      vehicles
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Add a new vehicle
 */
const addVehicle = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { make, model, year, registrationNumber, vehicleType = 'Sedan', color = 'Silver', isDefault = false } = req.body;

    if (!make || !model || !year || !registrationNumber) {
      return res.status(400).json({
        success: false,
        message: 'Make, model, manufacturing year, and registration number are required.'
      });
    }

    // Check if this is the first vehicle; if so, make it default automatically
    const [existing] = await db.query('SELECT COUNT(*) as count FROM vehicles WHERE user_id = ?', [userId]);
    const makeDefault = isDefault || existing[0].count === 0;

    if (makeDefault) {
      await db.query('UPDATE vehicles SET is_default = FALSE WHERE user_id = ?', [userId]);
    }

    const [result] = await db.query(
      `INSERT INTO vehicles (user_id, make, model, year, registration_number, vehicle_type, color, is_default)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        userId,
        make.trim(),
        model.trim(),
        parseInt(year, 10),
        registrationNumber.trim().toUpperCase(),
        vehicleType,
        color.trim(),
        makeDefault ? 1 : 0
      ]
    );

    const [newVehicle] = await db.query('SELECT * FROM vehicles WHERE id = ?', [result.insertId]);

    return res.status(201).json({
      success: true,
      message: 'Vehicle added successfully.',
      vehicle: newVehicle[0]
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update an existing vehicle
 */
const updateVehicle = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const vehicleId = req.params.id;
    const { make, model, year, registrationNumber, vehicleType, color, isDefault } = req.body;

    const [existing] = await db.query('SELECT id FROM vehicles WHERE id = ? AND user_id = ?', [vehicleId, userId]);
    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Vehicle not found or you do not have permission to modify it.'
      });
    }

    if (isDefault) {
      await db.query('UPDATE vehicles SET is_default = FALSE WHERE user_id = ?', [userId]);
    }

    await db.query(
      `UPDATE vehicles
       SET make = COALESCE(?, make),
           model = COALESCE(?, model),
           year = COALESCE(?, year),
           registration_number = COALESCE(?, registration_number),
           vehicle_type = COALESCE(?, vehicle_type),
           color = COALESCE(?, color),
           is_default = COALESCE(?, is_default)
       WHERE id = ? AND user_id = ?`,
      [
        make,
        model,
        year ? parseInt(year, 10) : null,
        registrationNumber ? registrationNumber.toUpperCase() : null,
        vehicleType,
        color,
        isDefault !== undefined ? (isDefault ? 1 : 0) : null,
        vehicleId,
        userId
      ]
    );

    const [updated] = await db.query('SELECT * FROM vehicles WHERE id = ?', [vehicleId]);

    return res.json({
      success: true,
      message: 'Vehicle details updated successfully.',
      vehicle: updated[0]
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete vehicle
 */
const deleteVehicle = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const vehicleId = req.params.id;

    const [result] = await db.query('DELETE FROM vehicles WHERE id = ? AND user_id = ?', [vehicleId, userId]);
    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Vehicle not found.'
      });
    }

    return res.json({
      success: true,
      message: 'Vehicle removed successfully.'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Set a vehicle as primary/default
 */
const setDefaultVehicle = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const vehicleId = req.params.id;

    await db.query('UPDATE vehicles SET is_default = FALSE WHERE user_id = ?', [userId]);
    const [result] = await db.query('UPDATE vehicles SET is_default = TRUE WHERE id = ? AND user_id = ?', [vehicleId, userId]);

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Vehicle not found.'
      });
    }

    return res.json({
      success: true,
      message: 'Default vehicle updated.'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getVehicles,
  addVehicle,
  updateVehicle,
  deleteVehicle,
  setDefaultVehicle
};
