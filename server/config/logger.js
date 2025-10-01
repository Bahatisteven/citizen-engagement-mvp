/**
 * Centralized logging configuration using Winston
 * @module config/logger
 */

const winston = require('winston');
const path = require('path');
const config = require('./index');

// Define log levels
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

// Define colors for each level
const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'blue',
};

winston.addColors(colors);

// Define format for logs
const format = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.json()
);

// Define format for console logs in development
const consoleFormat = winston.format.combine(
  winston.format.colorize({ all: true }),
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.printf(
    (info) => `${info.timestamp} ${info.level}: ${info.message}${info.stack ? '\n' + info.stack : ''}`
  )
);

// Define transports
const transports = [
  // Write all logs with level 'error' to error.log
  new winston.transports.File({
    filename: path.join(__dirname, '../logs/error.log'),
    level: 'error',
    maxsize: 5242880, // 5MB
    maxFiles: 5,
  }),

  // Write all logs to combined.log
  new winston.transports.File({
    filename: path.join(__dirname, '../logs/combined.log'),
    maxsize: 5242880, // 5MB
    maxFiles: 5,
  }),
];

// Add console transport in development
if (config.server.isDevelopment) {
  transports.push(
    new winston.transports.Console({
      format: consoleFormat,
    })
  );
}

// Create the logger
const logger = winston.createLogger({
  level: config.logging.level,
  levels,
  format,
  transports,
  exitOnError: false,
});

/**
 * Stream for Morgan HTTP logger
 */
logger.stream = {
  write: (message) => {
    logger.http(message.trim());
  },
};

/**
 * Enhanced logging methods with metadata support
 */

/**
 * Log an info message
 * @param {string} message - Log message
 * @param {Object} [meta] - Additional metadata
 */
logger.logInfo = (message, meta = {}) => {
  logger.info(message, meta);
};

/**
 * Log an error message
 * @param {string} message - Log message
 * @param {Error|Object} [error] - Error object or metadata
 */
logger.logError = (message, error = {}) => {
  if (error instanceof Error) {
    logger.error(message, { error: error.message, stack: error.stack });
  } else {
    logger.error(message, error);
  }
};

/**
 * Log a warning message
 * @param {string} message - Log message
 * @param {Object} [meta] - Additional metadata
 */
logger.logWarn = (message, meta = {}) => {
  logger.warn(message, meta);
};

/**
 * Log a debug message
 * @param {string} message - Log message
 * @param {Object} [meta] - Additional metadata
 */
logger.logDebug = (message, meta = {}) => {
  logger.debug(message, meta);
};

/**
 * Log a security event
 * @param {string} event - Security event name
 * @param {Object} [meta] - Additional metadata
 */
logger.logSecurity = (event, meta = {}) => {
  logger.warn(`SECURITY: ${event}`, {
    ...meta,
    timestamp: new Date().toISOString(),
    type: 'security',
  });
};

module.exports = logger;
