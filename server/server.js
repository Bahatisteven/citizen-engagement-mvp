require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const session = require('express-session');
const { generalLimiter } = require('./middleware/rateLimiter');
const { errorHandler } = require('./middleware/errorHandler');
const { logRequests } = require('./middleware/requestLogger');
const { checkTokenBlacklist } = require('./middleware/tokenBlacklist');
const { checkAccountLockout } = require('./middleware/accountLockout');
const { inputSanitizer, profiles } = require('./middleware/inputSanitizer');
const { requestIdMiddleware } = require('./middleware/requestId');
const config = require('./config');
const logger = require('./config/logger');
const path = require('path');
const fs = require('fs');

// import routes
const authRoutes = require('./routes/auth');
const complaintRoutes = require('./routes/complaints');

const app = express();

// Ensure logs directory exists
const logsDir = path.join(__dirname, 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Trust proxy if behind reverse proxy (for accurate IP addresses)
app.set('trust proxy', 1);

// Request ID generation - Apply first for request tracking
app.use(requestIdMiddleware);

// Request logging - Apply early for comprehensive logging
app.use(logRequests);

// Security middleware - Apply first for maximum protection
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
}));

// Session configuration for CSRF token storage
app.use(session({
  secret: config.security.sessionSecret,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: config.server.isProduction,
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    sameSite: 'strict'
  }
}));

// Token blacklist check (before auth routes)
app.use(checkTokenBlacklist);

// Account lockout check for auth routes
app.use('/api/auth/login', checkAccountLockout);

// Apply general rate limiting to all requests
app.use(generalLimiter);

// Parse JSON with size limit for security
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Input sanitization middleware (includes NoSQL injection prevention)
// Note: Removed express-mongo-sanitize due to Express 5 incompatibility
app.use(inputSanitizer(profiles.strict));

// CORS configuration
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or Postman)
    if (!origin) return callback(null, true);

    if (config.cors.allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: config.cors.credentials,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-CSRF-Token'],
  exposedHeaders: ['X-CSRF-Token'],
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));

// API versioning and health check
app.get('/health', async (req, res) => {
  const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';

  res.json({
    status: dbStatus === 'connected' ? 'OK' : 'DEGRADED',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '1.0.0',
    database: dbStatus,
    uptime: process.uptime()
  });
});

// routes to be used for
const adminRoutes = require('./routes/admin');
app.use('/api/auth', authRoutes);
app.use('/api/complaints', complaintRoutes);
app.use('/api/admin', adminRoutes);

// 404 handler for unknown routes
app.use((req, res) => {
  res.status(404).json({
    error: 'Route not found',
    path: req.originalUrl,
    method: req.method,
    timestamp: new Date().toISOString()
  });
});

// Use centralized error handler
app.use(errorHandler);

// Database connection with retry logic
const connectDB = async (retries = 5) => {
  for (let i = 0; i < retries; i++) {
    try {
      await mongoose.connect(config.database.uri, config.database.options);
      logger.logInfo('Connected to MongoDB successfully', {
        attempt: i + 1,
        host: mongoose.connection.host,
        name: mongoose.connection.name
      });
      return;
    } catch (error) {
      logger.logError(`MongoDB connection attempt ${i + 1} failed`, error);

      if (i < retries - 1) {
        const delay = Math.min(1000 * Math.pow(2, i), 30000); // Exponential backoff, max 30s
        logger.logInfo(`Retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      } else {
        logger.logError('Failed to connect to MongoDB after all retries');
        process.exit(1);
      }
    }
  }
};

// Mongoose connection event handlers
mongoose.connection.on('connected', () => {
  logger.logInfo('Mongoose connected to MongoDB');
});

mongoose.connection.on('error', (err) => {
  logger.logError('Mongoose connection error', err);
});

mongoose.connection.on('disconnected', () => {
  logger.logWarn('Mongoose disconnected from MongoDB');
});

// Server instance
let server;

// Start server
const startServer = async () => {
  try {
    // Connect to database
    await connectDB();

    // Start Express server
    server = app.listen(config.server.port, () => {
      logger.logInfo(`Server started successfully`, {
        port: config.server.port,
        env: config.server.env,
        nodeVersion: process.version
      });
    });
  } catch (error) {
    logger.logError('Failed to start server', error);
    process.exit(1);
  }
};

// Graceful shutdown handler
const gracefulShutdown = async (signal) => {
  logger.logInfo(`Received ${signal}, starting graceful shutdown...`);

  // Stop accepting new connections
  if (server) {
    server.close(() => {
      logger.logInfo('HTTP server closed');
    });
  }

  try {
    // Close database connection
    await mongoose.connection.close();
    logger.logInfo('MongoDB connection closed');

    // Exit process
    logger.logInfo('Graceful shutdown completed');
    process.exit(0);
  } catch (error) {
    logger.logError('Error during graceful shutdown', error);
    process.exit(1);
  }
};

// Handle termination signals
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.logError('Uncaught Exception', error);
  gracefulShutdown('uncaughtException');
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  logger.logError('Unhandled Rejection', {
    reason,
    promise
  });
  gracefulShutdown('unhandledRejection');
});

// Start the server
startServer();
