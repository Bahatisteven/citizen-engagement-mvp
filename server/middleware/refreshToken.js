const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../model/User');
const { APIError } = require('./errorHandler');

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET;
const ACCESS_TOKEN_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '15m';
const REFRESH_TOKEN_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || '7d';

// Generate access token
const generateAccessToken = (user) => {
  return jwt.sign(
    {
      sub: user._id,
      role: user.role,
      category: user.category || null,
      type: 'access'
    },
    JWT_SECRET,
    { expiresIn: ACCESS_TOKEN_EXPIRES_IN }
  );
};

// Generate refresh token
const generateRefreshToken = () => {
  return crypto.randomBytes(64).toString('hex');
};

// Create token pair
const createTokenPair = async (user) => {
  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken();

  // Calculate expiry date for refresh token
  const expiresAt = new Date();
  const days = parseInt(REFRESH_TOKEN_EXPIRES_IN.replace('d', ''));
  expiresAt.setDate(expiresAt.getDate() + days);

  // Store refresh token in user document
  await User.findByIdAndUpdate(user._id, {
    $push: {
      refreshTokens: {
        token: refreshToken,
        expiresAt,
        isActive: true
      }
    }
  });

  return {
    accessToken,
    refreshToken,
    accessTokenExpiresIn: ACCESS_TOKEN_EXPIRES_IN,
    refreshTokenExpiresIn: REFRESH_TOKEN_EXPIRES_IN
  };
};

// Validate and refresh access token
const refreshAccessToken = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      throw new APIError('Refresh token is required', 400);
    }

    // Find user with this refresh token
    const user = await User.findOne({
      'refreshTokens.token': refreshToken,
      'refreshTokens.isActive': true,
      'refreshTokens.expiresAt': { $gt: new Date() }
    });

    if (!user) {
      throw new APIError('Invalid or expired refresh token', 401);
    }

    // Generate new token pair
    const tokens = await createTokenPair(user);

    // Deactivate the used refresh token
    await User.updateOne(
      { _id: user._id, 'refreshTokens.token': refreshToken },
      { $set: { 'refreshTokens.$.isActive': false } }
    );

    res.json({
      ...tokens,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        category: user.category
      }
    });
  } catch (error) {
    next(error);
  }
};

// Revoke refresh token (logout)
const revokeRefreshToken = async (userId, refreshToken = null) => {
  const updateQuery = { _id: userId };
  const updateOperation = refreshToken
    ? { $set: { 'refreshTokens.$.isActive': false } }
    : { $set: { 'refreshTokens.$[].isActive': false } };

  if (refreshToken) {
    updateQuery['refreshTokens.token'] = refreshToken;
  }

  await User.updateOne(updateQuery, updateOperation);
};

// Clean up expired refresh tokens
const cleanupExpiredTokens = async () => {
  await User.updateMany(
    { 'refreshTokens.expiresAt': { $lt: new Date() } },
    { $pull: { refreshTokens: { expiresAt: { $lt: new Date() } } } }
  );
};

// Middleware to extract user from access token
const extractUserFromToken = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7);

    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      req.auth = decoded;
    } catch (error) {
      // Token is invalid or expired, but we don't throw here
      // Let other middleware handle it
    }
  }

  next();
};

// Run cleanup every hour
setInterval(cleanupExpiredTokens, 60 * 60 * 1000);

module.exports = {
  createTokenPair,
  refreshAccessToken,
  revokeRefreshToken,
  generateAccessToken,
  extractUserFromToken,
  cleanupExpiredTokens,
  ACCESS_TOKEN_EXPIRES_IN,
  REFRESH_TOKEN_EXPIRES_IN
};