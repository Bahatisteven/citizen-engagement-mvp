require('dotenv').config();
const jwt = require('jsonwebtoken');
const { expressjwt: jwtMiddleware } = require('express-jwt');

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error('JWT_SECRET is not defined in environment variables');
}

exports.requireAuth = jwtMiddleware({
  secret: JWT_SECRET,
  algorithms: ['HS256']
});

exports.requireRole = (role) => (req, res, next) => {
  if (req.auth.role !== role) {
    return res.status(403).json({ error: 'Access denied' });
  }
  next();
};

exports.requireRoles = (...roles) => (req, res, next) => {
  if (!roles.includes(req.auth.role)) {
    return res.status(403).json({ error: 'Access denied' });
  }
  next();
};

exports.signToken = (user) => {
  return jwt.sign({
    sub: user._id,
    role: user.role,
    category: user.category || null
  }, JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '15m'
  });
};
