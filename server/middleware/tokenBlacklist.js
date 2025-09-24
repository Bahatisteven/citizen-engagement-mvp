// In-memory blacklist (in production, use Redis or database)
const blacklistedTokens = new Set();
const tokenExpiries = new Map();

// Add token to blacklist
const blacklistToken = (token, expiresAt) => {
  blacklistedTokens.add(token);
  tokenExpiries.set(token, expiresAt);
};

// Check if token is blacklisted
const isTokenBlacklisted = (token) => {
  return blacklistedTokens.has(token);
};

// Clean up expired tokens periodically
const cleanupExpiredTokens = () => {
  const now = Date.now();

  for (const [token, expiresAt] of tokenExpiries.entries()) {
    if (now >= expiresAt) {
      blacklistedTokens.delete(token);
      tokenExpiries.delete(token);
    }
  }
};

// Middleware to check token blacklist
const checkTokenBlacklist = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7);

    if (isTokenBlacklisted(token)) {
      return res.status(401).json({
        error: 'Token has been revoked. Please log in again.',
        timestamp: new Date().toISOString()
      });
    }
  }

  next();
};

// Clean up every hour
setInterval(cleanupExpiredTokens, 60 * 60 * 1000);

module.exports = {
  blacklistToken,
  isTokenBlacklisted,
  checkTokenBlacklist,
  cleanupExpiredTokens
};