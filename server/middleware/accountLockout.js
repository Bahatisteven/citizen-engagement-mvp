const { logSecurityEvent } = require('./requestLogger');

// In-memory store for failed attempts (in production, use Redis or database)
const failedAttempts = new Map();
const lockedAccounts = new Map();

const MAX_ATTEMPTS = parseInt(process.env.MAX_LOGIN_ATTEMPTS) || 5;
const LOCKOUT_TIME = parseInt(process.env.LOCKOUT_TIME) || 15 * 60 * 1000; // 15 minutes
const ATTEMPT_WINDOW = 15 * 60 * 1000; // 15 minutes

// Check if account is locked
const isAccountLocked = (identifier) => {
  const lockInfo = lockedAccounts.get(identifier);
  if (!lockInfo) return false;

  // Check if lockout period has expired
  if (Date.now() > lockInfo.lockedUntil) {
    lockedAccounts.delete(identifier);
    failedAttempts.delete(identifier);
    return false;
  }

  return true;
};

// Record failed login attempt
const recordFailedAttempt = (identifier, req) => {
  const now = Date.now();
  const attempts = failedAttempts.get(identifier) || [];

  // Remove attempts older than the window
  const recentAttempts = attempts.filter(timestamp => now - timestamp < ATTEMPT_WINDOW);
  recentAttempts.push(now);

  failedAttempts.set(identifier, recentAttempts);

  // Check if max attempts exceeded
  if (recentAttempts.length >= MAX_ATTEMPTS) {
    const lockUntil = now + LOCKOUT_TIME;
    lockedAccounts.set(identifier, {
      lockedAt: now,
      lockedUntil: lockUntil,
      attemptCount: recentAttempts.length
    });

    logSecurityEvent('Account locked due to multiple failed login attempts', {
      identifier,
      attemptCount: recentAttempts.length,
      lockDuration: LOCKOUT_TIME / 1000 / 60 // minutes
    }, req);

    return true; // Account is now locked
  }

  logSecurityEvent('Failed login attempt recorded', {
    identifier,
    attemptCount: recentAttempts.length,
    remainingAttempts: MAX_ATTEMPTS - recentAttempts.length
  }, req);

  return false; // Not locked yet
};

// Clear failed attempts on successful login
const clearFailedAttempts = (identifier) => {
  failedAttempts.delete(identifier);
  lockedAccounts.delete(identifier);
};

// Get lockout info
const getLockoutInfo = (identifier) => {
  const lockInfo = lockedAccounts.get(identifier);
  if (!lockInfo) return null;

  const remainingTime = Math.max(0, lockInfo.lockedUntil - Date.now());
  return {
    isLocked: remainingTime > 0,
    remainingMinutes: Math.ceil(remainingTime / 1000 / 60),
    attemptCount: lockInfo.attemptCount
  };
};

// Middleware to check account lockout
const checkAccountLockout = (req, res, next) => {
  const identifier = req.body.email || req.ip; // Use email or IP as identifier

  if (isAccountLocked(identifier)) {
    const lockoutInfo = getLockoutInfo(identifier);

    logSecurityEvent('Blocked login attempt - Account locked', {
      identifier,
      remainingMinutes: lockoutInfo.remainingMinutes
    }, req);

    return res.status(423).json({
      error: 'Account temporarily locked due to multiple failed login attempts',
      lockoutInfo: {
        remainingMinutes: lockoutInfo.remainingMinutes,
        maxAttempts: MAX_ATTEMPTS
      },
      timestamp: new Date().toISOString()
    });
  }

  next();
};

// Clean up expired entries periodically
setInterval(() => {
  const now = Date.now();

  // Clean up expired lockouts
  for (const [identifier, lockInfo] of lockedAccounts.entries()) {
    if (now > lockInfo.lockedUntil) {
      lockedAccounts.delete(identifier);
      failedAttempts.delete(identifier);
    }
  }

  // Clean up old failed attempts
  for (const [identifier, attempts] of failedAttempts.entries()) {
    const recentAttempts = attempts.filter(timestamp => now - timestamp < ATTEMPT_WINDOW);
    if (recentAttempts.length === 0) {
      failedAttempts.delete(identifier);
    } else if (recentAttempts.length !== attempts.length) {
      failedAttempts.set(identifier, recentAttempts);
    }
  }
}, 5 * 60 * 1000); // Clean up every 5 minutes

module.exports = {
  checkAccountLockout,
  recordFailedAttempt,
  clearFailedAttempts,
  isAccountLocked,
  getLockoutInfo
};