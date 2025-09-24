const winston = require('winston');
const crypto = require('crypto');

// Configure request logger
const requestLogger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'logs/requests.log' }),
    new winston.transports.File({ filename: 'logs/security.log', level: 'warn' })
  ]
});

// Request logging middleware
const logRequests = (req, res, next) => {
  // Generate unique request ID
  const requestId = crypto.randomUUID();
  req.headers['x-request-id'] = requestId;

  const startTime = Date.now();

  // Log request
  const requestInfo = {
    requestId,
    method: req.method,
    url: req.originalUrl,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    userId: req.auth?.sub || 'anonymous',
    timestamp: new Date().toISOString(),
    headers: {
      'content-type': req.get('Content-Type'),
      'authorization': req.get('Authorization') ? 'Bearer [REDACTED]' : undefined,
      'user-agent': req.get('User-Agent')
    }
  };

  requestLogger.info('Request received', requestInfo);

  // Log response when finished
  res.on('finish', () => {
    const duration = Date.now() - startTime;

    const responseInfo = {
      requestId,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      contentLength: res.get('Content-Length'),
      timestamp: new Date().toISOString()
    };

    // Log security events
    if (res.statusCode === 401 || res.statusCode === 403) {
      requestLogger.warn('Security event - Unauthorized access attempt', {
        ...requestInfo,
        ...responseInfo,
        securityEvent: true
      });
    }

    // Log rate limiting
    if (res.statusCode === 429) {
      requestLogger.warn('Security event - Rate limit exceeded', {
        ...requestInfo,
        ...responseInfo,
        securityEvent: true
      });
    }

    requestLogger.info('Request completed', responseInfo);
  });

  next();
};

// Security event logger
const logSecurityEvent = (event, details, req) => {
  requestLogger.warn(`Security event - ${event}`, {
    event,
    details,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    userId: req.auth?.sub || 'anonymous',
    url: req.originalUrl,
    method: req.method,
    timestamp: new Date().toISOString(),
    requestId: req.headers['x-request-id'] || 'unknown'
  });
};

module.exports = {
  logRequests,
  logSecurityEvent,
  requestLogger
};