const { verifyToken } = require('../config/jwt');
const db = require('../config/db');

function initializeSocketIO(io) {
  // Authentication middleware for socket connections
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token || socket.handshake.query?.token;
      if (token) {
        try {
          const decoded = verifyToken(token);
          const [users] = await db.query('SELECT id, name, role FROM users WHERE id = ?', [decoded.id]);
          if (users.length > 0) {
            socket.user = users[0];
            if (users[0].role === 'provider') {
              const [prov] = await db.query('SELECT id FROM providers WHERE user_id = ?', [users[0].id]);
              if (prov.length > 0) {
                socket.user.provider_id = prov[0].id;
              }
            }
          }
        } catch (e) {
          // Token invalid, proceed as guest
        }
      }
      return next();
    } catch (err) {
      return next();
    }
  });

  io.on('connection', (socket) => {
    const user = socket.user;
    if (user) {
      socket.join(`user_${user.id}`);
      socket.join(`role_${user.role}`);
      if (user.provider_id) {
        socket.join(`provider_${user.provider_id}`);
      }
      console.log(`[Socket] Authenticated user connected: ${user.name} (${user.role}), socket ID: ${socket.id}`);
    } else {
      console.log(`[Socket] Guest client connected: ${socket.id}`);
    }

    // Join a specific assistance request room for real-time tracking
    socket.on('join_request', (requestId) => {
      if (requestId) {
        const roomName = `request_${requestId}`;
        socket.join(roomName);
        console.log(`[Socket] Client ${socket.id} joined room: ${roomName}`);
      }
    });

    // Leave assistance request room
    socket.on('leave_request', (requestId) => {
      if (requestId) {
        const roomName = `request_${requestId}`;
        socket.leave(roomName);
        console.log(`[Socket] Client ${socket.id} left room: ${roomName}`);
      }
    });

    // Provider live GPS stream to active request room
    socket.on('provider_location_ping', async (data) => {
      const { requestId, providerId, latitude, longitude } = data;
      if (requestId && latitude && longitude) {
        io.to(`request_${requestId}`).emit('provider_location_updated', {
          providerId,
          latitude,
          longitude,
          timestamp: new Date().toISOString()
        });
      }
    });

    socket.on('disconnect', () => {
      // Clean disconnect
    });
  });
}

module.exports = initializeSocketIO;
