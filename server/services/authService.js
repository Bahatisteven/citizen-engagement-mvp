/**
 * Authentication business logic service
 * @module services/authService
 */

const User = require('../model/User');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const config = require('../config');
const logger = require('../config/logger');

/**
 * Register a new user
 * @param {Object} userData - User registration data
 * @param {string} userData.name - User's name
 * @param {string} userData.email - User's email
 * @param {string} userData.password - User's password
 * @param {string} userData.role - User's role
 * @param {string} [userData.category] - User's category (for institutions)
 * @returns {Promise<Object>} Created user (without password)
 */
exports.register = async (userData) => {
  try {
    const { name, email, password, role, category } = userData;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      const error = new Error('Email already registered');
      error.statusCode = 400;
      throw error;
    }

    // Create new user
    const user = new User({ name, email, password, role, category });
    await user.save();

    logger.logInfo('User registered successfully', {
      userId: user._id,
      email: user.email,
      role: user.role,
    });

    // Return user without password
    const userObj = user.toObject();
    delete userObj.password;

    return userObj;
  } catch (error) {
    logger.logError('Error during user registration', error);
    throw error;
  }
};

/**
 * Authenticate user and return tokens
 * @param {string} email - User's email
 * @param {string} password - User's password
 * @returns {Promise<Object>} User data and authentication tokens
 */
exports.login = async (email, password) => {
  try {
    // Find user with password field
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      logger.logWarn('Login attempt with non-existent email', { email });
      const error = new Error('Invalid credentials');
      error.statusCode = 401;
      throw error;
    }

    // Verify password
    const isPasswordValid = await user.verifyPassword(password);

    if (!isPasswordValid) {
      logger.logSecurity('Failed login attempt - Invalid password', {
        email,
        userId: user._id,
      });
      const error = new Error('Invalid credentials');
      error.statusCode = 401;
      throw error;
    }

    logger.logInfo('User logged in successfully', {
      userId: user._id,
      email: user.email,
      role: user.role,
    });

    // Return user without password
    const userObj = user.toObject();
    delete userObj.password;

    return userObj;
  } catch (error) {
    logger.logError('Error during login', error);
    throw error;
  }
};

/**
 * Generate JWT tokens for user
 * @param {Object} user - User object
 * @returns {Object} Access and refresh tokens
 */
exports.generateTokens = (user) => {
  const payload = {
    sub: user._id,
    email: user.email,
    role: user.role,
  };

  const accessToken = jwt.sign(payload, config.security.jwtSecret, {
    expiresIn: config.security.jwtExpiresIn,
  });

  const refreshToken = jwt.sign(
    { sub: user._id },
    config.security.jwtSecret,
    { expiresIn: config.security.jwtRefreshExpiresIn }
  );

  return {
    accessToken,
    refreshToken,
    expiresIn: config.security.jwtExpiresIn,
  };
};

/**
 * Verify and decode JWT token
 * @param {string} token - JWT token
 * @returns {Object} Decoded token payload
 */
exports.verifyToken = (token) => {
  try {
    return jwt.verify(token, config.security.jwtSecret);
  } catch (error) {
    logger.logWarn('Invalid token verification attempt', {
      error: error.message,
    });
    throw error;
  }
};

/**
 * Generate password reset token
 * @param {string} email - User's email
 * @returns {Promise<Object>} Reset token and user
 */
exports.generateResetToken = async (email) => {
  try {
    const user = await User.findOne({ email });

    if (!user) {
      const error = new Error('User not found');
      error.statusCode = 404;
      throw error;
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour

    await user.save();

    logger.logInfo('Password reset token generated', {
      userId: user._id,
      email: user.email,
    });

    return {
      resetToken,
      user: {
        email: user.email,
        name: user.name,
      },
    };
  } catch (error) {
    logger.logError('Error generating reset token', error);
    throw error;
  }
};

/**
 * Reset user password with token
 * @param {string} token - Reset token
 * @param {string} newPassword - New password
 * @returns {Promise<Object>} Success status
 */
exports.resetPassword = async (token, newPassword) => {
  try {
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      const error = new Error('Invalid or expired token');
      error.statusCode = 400;
      throw error;
    }

    // Update password and clear reset token
    user.password = newPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    await user.save();

    logger.logInfo('Password reset successful', {
      userId: user._id,
      email: user.email,
    });

    return { message: 'Password reset successful' };
  } catch (error) {
    logger.logError('Error resetting password', error);
    throw error;
  }
};

/**
 * Get user profile by ID
 * @param {string} userId - User ID
 * @returns {Promise<Object>} User profile
 */
exports.getProfile = async (userId) => {
  try {
    const user = await User.findById(userId).select('-password');

    if (!user) {
      const error = new Error('User not found');
      error.statusCode = 404;
      throw error;
    }

    return user;
  } catch (error) {
    logger.logError('Error fetching user profile', error);
    throw error;
  }
};

/**
 * Update user profile
 * @param {string} userId - User ID
 * @param {Object} updateData - Profile update data
 * @returns {Promise<Object>} Updated user profile
 */
exports.updateProfile = async (userId, updateData) => {
  try {
    const { name, email } = updateData;

    const user = await User.findById(userId);

    if (!user) {
      const error = new Error('User not found');
      error.statusCode = 404;
      throw error;
    }

    // Check email uniqueness if changing
    if (email && email !== user.email) {
      const emailExists = await User.findOne({ email });
      if (emailExists) {
        const error = new Error('Email already in use');
        error.statusCode = 400;
        throw error;
      }
    }

    // Update fields
    user.name = name || user.name;
    user.email = email || user.email;

    await user.save();

    logger.logInfo('User profile updated', {
      userId: user._id,
      email: user.email,
    });

    // Return user without password
    const userObj = user.toObject();
    delete userObj.password;

    return userObj;
  } catch (error) {
    logger.logError('Error updating user profile', error);
    throw error;
  }
};

module.exports = exports;
