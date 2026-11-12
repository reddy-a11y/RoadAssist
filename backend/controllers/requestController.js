const db = require('../config/db');
const { calculateDistance } = require('../utils/distance');

/**
 * Helper to emit socket event safely
 */
const emitSocketEvent = (req, event, data, room = null) => {
  const io = req.app.get('io');
  if (!io) return;

  if (room) {
    io.to(room).emit(event, data);
  } else {
    io.emit(event, data);
  }
};

/**
 * Create a New Assistance Request
 */
const createRequest = async (req, res, next) => {
  try {
    const customerId = req.user.id;
    const {
      category,
      description,
      vehicleId,
      providerId,
      latitude,
      longitude,
      address
    } = req.body;

    if (!category || !description || !latitude || !longitude || !address) {
      return res.status(400).json({
        success: false,
        message: 'Category, description, coordinates, and address are required.'
      });
    }

    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);
    const vId = vehicleId ? parseInt(vehicleId, 10) : null;
    let targetProviderId = providerId ? parseInt(providerId, 10) : null;

    // Check if customer already has an active request in progress
    const [activeRequests] = await db.query(
      `SELECT id, request_code, status FROM assistance_requests
       WHERE customer_id = ? AND status IN ('pending', 'accepted', 'on_the_way', 'in_progress')`,
      [customerId]
    );

    if (activeRequests.length > 0) {
      return res.status(400).json({
        success: false,
        message: `You already have an active request (${activeRequests[0].request_code}) with status '${activeRequests[0].status}'. Please track or cancel it before creating a new one.`,
        activeRequestId: activeRequests[0].id
      });
    }

    // Auto-select nearest matching provider if none specified
    let estimatedCost = 450.00;
    if (!targetProviderId) {
      const [nearby] = await db.query(
        `SELECT id, latitude, longitude, base_charge, per_km_charge, services_offered
         FROM providers
         WHERE verification_status = 'verified' AND is_available = TRUE`
      );

      let bestProvider = null;
      let minDistance = Infinity;

      for (const p of nearby) {
        let services = [];
        try {
          services = typeof p.services_offered === 'string' ? JSON.parse(p.services_offered) : p.services_offered;
        } catch (e) {
          services = [];
        }
        if (!services.includes(category)) continue;

        const dist = calculateDistance(lat, lng, p.latitude, p.longitude);
        if (dist !== null && dist < minDistance) {
          minDistance = dist;
          bestProvider = p;
        }
      }

      if (bestProvider) {
        targetProviderId = bestProvider.id;
        estimatedCost = Math.round(parseFloat(bestProvider.base_charge) + (minDistance * parseFloat(bestProvider.per_km_charge)));
      }
    } else {
      // Calculate estimated cost for the selected provider
      const [pRows] = await db.query('SELECT latitude, longitude, base_charge, per_km_charge FROM providers WHERE id = ?', [targetProviderId]);
      if (pRows.length > 0) {
        const p = pRows[0];
        const dist = calculateDistance(lat, lng, p.latitude, p.longitude) || 5;
        estimatedCost = Math.round(parseFloat(p.base_charge) + (dist * parseFloat(p.per_km_charge)));
      }
    }

    // Generate unique Request Code (e.g. REQ-7482)
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const requestCode = `REQ-${randomSuffix}`;

    // Handle image upload path
    let imageUrl = null;
    if (req.file) {
      imageUrl = `/uploads/${req.file.filename}`;
    }

    const conn = await db.getConnection();
    await conn.beginTransaction();

    try {
      const [result] = await conn.query(
        `INSERT INTO assistance_requests
         (request_code, customer_id, provider_id, vehicle_id, category, description, image_url, latitude, longitude, address, status, estimated_cost, final_cost)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', ?, ?)`,
        [
          requestCode,
          customerId,
          targetProviderId,
          vId,
          category,
          description.trim(),
          imageUrl,
          lat,
          lng,
          address.trim(),
          estimatedCost,
          estimatedCost
        ]
      );

      const requestId = result.insertId;

      // Insert audit update
      await conn.query(
        `INSERT INTO request_updates (request_id, status, notes, updated_by)
         VALUES (?, 'pending', 'Assistance request initiated by customer.', ?)`,
        [requestId, customerId]
      );

      // Create notification for target provider (or admin if no provider)
      if (targetProviderId) {
        const [provUser] = await conn.query('SELECT user_id, business_name FROM providers WHERE id = ?', [targetProviderId]);
        if (provUser.length > 0) {
          await conn.query(
            `INSERT INTO notifications (user_id, title, message, type, data)
             VALUES (?, 'New Assistance Request!', ?, 'new_request', ?)`,
            [
              provUser[0].user_id,
              `New ${category} breakdown request ${requestCode} nearby at ${address}.`,
              JSON.stringify({ requestId, requestCode, category })
            ]
          );
        }
      }

      await conn.commit();
      conn.release();

      const [newReq] = await db.query(
        `SELECT ar.*, u.name as customer_name, u.phone as customer_phone,
                p.business_name as provider_name, p.phone as provider_phone,
                v.make, v.model, v.registration_number
         FROM assistance_requests ar
         JOIN users u ON ar.customer_id = u.id
         LEFT JOIN providers p ON ar.provider_id = p.id
         LEFT JOIN vehicles v ON ar.vehicle_id = v.id
         WHERE ar.id = ?`,
        [requestId]
      );

      const createdPayload = newReq[0];

      // Emit real-time Socket.IO notification
      if (targetProviderId) {
        emitSocketEvent(req, 'new_assistance_request', createdPayload, `provider_${targetProviderId}`);
      }
      emitSocketEvent(req, 'request_created', createdPayload);

      return res.status(201).json({
        success: true,
        message: 'Assistance request submitted successfully! A nearby provider has been notified.',
        request: createdPayload
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
 * Get all requests of the logged-in customer
 */
const getCustomerRequests = async (req, res, next) => {
  try {
    const customerId = req.user.id;

    const [requests] = await db.query(
      `SELECT ar.*,
              p.business_name as provider_name, p.phone as provider_phone, p.rating as provider_rating,
              p.latitude as provider_lat, p.longitude as provider_lng,
              v.make, v.model, v.registration_number, v.vehicle_type,
              r.rating as customer_review_rating, r.comment as customer_review_comment
       FROM assistance_requests ar
       LEFT JOIN providers p ON ar.provider_id = p.id
       LEFT JOIN vehicles v ON ar.vehicle_id = v.id
       LEFT JOIN reviews r ON ar.id = r.request_id
       WHERE ar.customer_id = ?
       ORDER BY ar.id DESC`,
      [customerId]
    );

    return res.json({
      success: true,
      requests
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get Request Details & Audit Timeline by ID
 */
const getRequestById = async (req, res, next) => {
  try {
    const requestId = req.params.id;
    const user = req.user;

    const [rows] = await db.query(
      `SELECT ar.*,
              u.name as customer_name, u.phone as customer_phone, u.emergency_contact_name, u.emergency_contact_phone,
              p.business_name as provider_name, p.owner_name as provider_owner, p.phone as provider_phone,
              p.address as provider_address, p.rating as provider_rating,
              pa.current_latitude as provider_current_lat, pa.current_longitude as provider_current_lng,
              v.make, v.model, v.year, v.registration_number, v.vehicle_type, v.color,
              r.rating as review_rating, r.comment as review_comment
       FROM assistance_requests ar
       JOIN users u ON ar.customer_id = u.id
       LEFT JOIN providers p ON ar.provider_id = p.id
       LEFT JOIN provider_availability pa ON p.id = pa.provider_id
       LEFT JOIN vehicles v ON ar.vehicle_id = v.id
       LEFT JOIN reviews r ON ar.id = r.request_id
       WHERE ar.id = ?`,
      [requestId]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Assistance request not found.'
      });
    }

    const request = rows[0];

    // Authorization check: Customer owns it, or Assigned Provider, or Admin
    if (
      user.role === 'customer' && request.customer_id !== user.id &&
      user.role !== 'admin'
    ) {
      return res.status(403).json({
        success: false,
        message: 'Access denied.'
      });
    }

    // Fetch audit timeline
    const [timeline] = await db.query(
      `SELECT ru.*, u.name as updated_by_name, u.role as updated_by_role
       FROM request_updates ru
       JOIN users u ON ru.updated_by = u.id
       WHERE ru.request_id = ?
       ORDER BY ru.created_at ASC`,
      [requestId]
    );

    return res.json({
      success: true,
      request: {
        ...request,
        timeline
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update Request Status (Accept, On The Way, In Progress, Complete, Reject)
 */
const updateRequestStatus = async (req, res, next) => {
  try {
    const requestId = req.params.id;
    const { status, notes, finalCost } = req.body;
    const user = req.user;

    const validStatuses = ['accepted', 'on_the_way', 'in_progress', 'completed', 'rejected', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Allowed values: ${validStatuses.join(', ')}`
      });
    }

    const [rows] = await db.query('SELECT * FROM assistance_requests WHERE id = ?', [requestId]);
    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Request not found.' });
    }

    const request = rows[0];

    // Permission checks
    if (user.role === 'provider') {
      // If accepting a pending request that has no provider assigned, assign it to this provider
      if (!request.provider_id && status === 'accepted') {
        await db.query('UPDATE assistance_requests SET provider_id = ? WHERE id = ?', [user.provider_id, requestId]);
        request.provider_id = user.provider_id;
      } else if (request.provider_id !== user.provider_id && user.role !== 'admin') {
        return res.status(403).json({ success: false, message: 'You are not assigned to this request.' });
      }
    }

    const conn = await db.getConnection();
    await conn.beginTransaction();

    try {
      let costToSet = request.final_cost;
      if (finalCost && !isNaN(parseFloat(finalCost))) {
        costToSet = parseFloat(finalCost);
      }

      let paymentStatus = request.payment_status;
      if (status === 'completed') {
        paymentStatus = 'paid';
      }

      await conn.query(
        `UPDATE assistance_requests
         SET status = ?, final_cost = ?, payment_status = ?
         WHERE id = ?`,
        [status, costToSet, paymentStatus, requestId]
      );

      // Insert audit update
      const defaultNotes = {
        accepted: 'Assistance request accepted by service provider.',
        on_the_way: 'Technician is en-route to breakdown location.',
        in_progress: 'Technician has arrived on-site and assistance is in progress.',
        completed: `Service completed successfully. Total charges: ₹${costToSet}`,
        rejected: 'Request declined by service provider.',
        cancelled: 'Request cancelled.'
      };

      await conn.query(
        `INSERT INTO request_updates (request_id, status, notes, updated_by)
         VALUES (?, ?, ?, ?)`,
        [requestId, status, notes || defaultNotes[status] || `Status updated to ${status}`, user.id]
      );

      // If completed, update provider statistics
      if (status === 'completed' && request.provider_id) {
        await conn.query(
          `UPDATE providers
           SET total_services_completed = total_services_completed + 1,
               total_earnings = total_earnings + ?
           WHERE id = ?`,
          [costToSet, request.provider_id]
        );
      }

      // Create notification for customer
      const notifTitles = {
        accepted: 'Request Accepted!',
        on_the_way: 'Provider On The Way!',
        in_progress: 'Assistance In Progress',
        completed: 'Service Completed!',
        rejected: 'Request Declined'
      };

      if (notifTitles[status]) {
        await conn.query(
          `INSERT INTO notifications (user_id, title, message, type, data)
           VALUES (?, ?, ?, 'request_update', ?)`,
          [
            request.customer_id,
            notifTitles[status],
            `Your assistance request ${request.request_code} is now '${status.replace(/_/g, ' ')}'.`,
            JSON.stringify({ requestId, requestCode: request.request_code, status })
          ]
        );
      }

      await conn.commit();
      conn.release();

      // Fetch fresh updated request
      const [updatedRows] = await db.query(
        `SELECT ar.*,
                u.name as customer_name, u.phone as customer_phone,
                p.business_name as provider_name, p.phone as provider_phone
         FROM assistance_requests ar
         JOIN users u ON ar.customer_id = u.id
         LEFT JOIN providers p ON ar.provider_id = p.id
         WHERE ar.id = ?`,
        [requestId]
      );

      const updatedPayload = updatedRows[0];

      // Emit real-time Socket.IO events to all relevant rooms
      emitSocketEvent(req, 'request_status_updated', {
        requestId,
        status,
        request: updatedPayload
      }, `request_${requestId}`);

      emitSocketEvent(req, 'customer_request_updated', {
        requestId,
        status,
        request: updatedPayload
      }, `user_${request.customer_id}`);

      return res.json({
        success: true,
        message: `Assistance request status updated to '${status}'.`,
        request: updatedPayload
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
 * Cancel Request (by Customer)
 */
const cancelRequest = async (req, res, next) => {
  try {
    const requestId = req.params.id;
    const customerId = req.user.id;
    const { reason = 'Cancelled by customer' } = req.body;

    const [rows] = await db.query('SELECT * FROM assistance_requests WHERE id = ?', [requestId]);
    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Request not found.' });
    }

    const request = rows[0];

    if (request.customer_id !== customerId && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'You are not authorized to cancel this request.' });
    }

    if (['completed', 'cancelled', 'rejected'].includes(request.status)) {
      return res.status(400).json({ success: false, message: `Cannot cancel a request that is already ${request.status}.` });
    }

    await db.query(
      `UPDATE assistance_requests
       SET status = 'cancelled', cancellation_reason = ?
       WHERE id = ?`,
      [reason, requestId]
    );

    await db.query(
      `INSERT INTO request_updates (request_id, status, notes, updated_by)
       VALUES (?, 'cancelled', ?, ?)`,
      [requestId, `Request cancelled by customer: ${reason}`, customerId]
    );

    // Notify provider if one was assigned
    if (request.provider_id) {
      const [prov] = await db.query('SELECT user_id FROM providers WHERE id = ?', [request.provider_id]);
      if (prov.length > 0) {
        await db.query(
          `INSERT INTO notifications (user_id, title, message, type, data)
           VALUES (?, 'Request Cancelled', ?, 'request_update', ?)`,
          [
            prov[0].user_id,
            `Assistance request ${request.request_code} was cancelled by customer.`,
            JSON.stringify({ requestId, requestCode: request.request_code })
          ]
        );
      }
    }

    emitSocketEvent(req, 'request_status_updated', {
      requestId,
      status: 'cancelled'
    }, `request_${requestId}`);

    return res.json({
      success: true,
      message: 'Request cancelled successfully.'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createRequest,
  getCustomerRequests,
  getRequestById,
  updateRequestStatus,
  cancelRequest
};
