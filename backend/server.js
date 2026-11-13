
const express = require('express');
const http = require('http');
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const { Server } = require('socket.io');

require('dotenv').config({
  path: path.join(__dirname, '.env')
});

const db = require('./config/db');
const initializeSocketIO = require('./sockets/socketHandler');
const errorHandler = require('./middleware/errorHandler');

// Route imports
const authRoutes = require('./routes/authRoutes');
const vehicleRoutes = require('./routes/vehicleRoutes');
const serviceRoutes = require('./routes/serviceRoutes');
const providerRoutes = require('./routes/providerRoutes');
const requestRoutes = require('./routes/requestRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const adminRoutes = require('./routes/adminRoutes');

const app = express();
const server = http.createServer(app);

// Allowed frontend origins
const allowedOrigins = (
  process.env.CLIENT_URL || 'http://localhost:5174'
)
  .split(',')
  .map(origin => origin.trim());

// CORS configuration
const corsOptions = {
  origin: allowedOrigins,
  credentials: true,
  methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS']
};

// Initialize Socket.IO
const io = new Server(server, {
  cors: corsOptions
});

initializeSocketIO(io);

// Make Socket.IO accessible in controllers
app.set('io', io);

// Security middleware
app.use(helmet({
  crossOriginResourcePolicy: {
    policy: 'cross-origin'
  }
}));

app.use(cors(corsOptions));

app.use(morgan('combined'));

app.use(express.json({ limit: '10mb' }));

app.use(express.urlencoded({
  extended: true,
  limit: '10mb'
}));

// Rate limiter
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 500,
  message: {
    success: false,
    message: 'Too many requests. Please try again later.'
  }
});

app.use('/api/', limiter);

// Static uploads
app.use(
  '/uploads',
  express.static(path.join(__dirname, 'uploads'))
);

// Health check
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    platform: 'RoadAssist - Smart Roadside Assistance API',
    timestamp: new Date().toISOString()
  });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/vehicles', vehicleRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/providers', providerRoutes);
app.use('/api/requests', requestRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/admin', adminRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `API endpoint '${req.method} ${req.originalUrl}' not found.`
  });
});

// Error handler
app.use(errorHandler);

// Render port configuration
const PORT = process.env.PORT || 5000;

server.listen(PORT, '0.0.0.0', () => {
  console.log('==============================================');
  console.log('RoadAssist Backend Started Successfully');
  console.log(`Server Port: ${PORT}`);
  console.log('Socket.IO Real-Time Engine Active');
  console.log(`Health Check: /api/health`);
  console.log('==============================================');
});

