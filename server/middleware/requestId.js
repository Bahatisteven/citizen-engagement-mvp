const crypto = require('crypto');

/**
 * Middleware to generate unique request IDs for tracking and debugging
 */
const requestIdMiddleware = (req, res, next) => {
  // Generate a unique request ID if not provided
  const requestId = req.headers['x-request-id'] ||
                   req.headers['x-correlation-id'] ||
                   crypto.randomUUID();

  // Add request ID to request headers
  req.headers['x-request-id'] = requestId;

  // Add request ID to response headers for client tracking
  res.setHeader('x-request-id', requestId);

  // Store request ID in req object for easy access
  req.requestId = requestId;

  next();
};

module.exports = { requestIdMiddleware };