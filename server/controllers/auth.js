const User = require('../model/User.js');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const sendEmail = require('../utils/sendEmail.js');
const { createTokenPair, revokeRefreshToken } = require('../middleware/refreshToken');
const { recordFailedAttempt, clearFailedAttempts } = require('../middleware/accountLockout');
const { blacklistToken } = require('../middleware/tokenBlacklist');
const { logSecurityEvent } = require('../middleware/requestLogger');
const { APIError } = require('../middleware/errorHandler');

exports.register = async (req, res) => {
  try {
    // here we register the user 
    const { name, email, password, role, category } = req.body;
    const doesUserExist = await User.findOne({ email });
    if (doesUserExist) return res.status(400).json({ error: 'Email already registered' });

    // here we create the user
    const user = new User({ name, email, password, role, category });
    await user.save();

    // Generate token pair
    const tokens = await createTokenPair(user);

    logSecurityEvent('User registration successful', {
      userId: user._id,
      email: user.email,
      role: user.role
    }, req);

    res.status(201).json({
      ...tokens,
      role: user.role,
      category: user.category || null,
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      }
    });
  } catch (err) {
    console.error('Register Error:', err);
    res.status(500).json({ error: 'Registration failed' });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      recordFailedAttempt(email, req);
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Verify password
    const isPasswordValid = await user.verifyPassword(password);
    if (!isPasswordValid) {
      recordFailedAttempt(email, req);
      logSecurityEvent('Failed login attempt - Invalid password', {
        email,
        userId: user._id
      }, req);
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Clear failed attempts on successful login
    clearFailedAttempts(email);

    // Generate token pair
    const tokens = await createTokenPair(user);

    logSecurityEvent('User login successful', {
      userId: user._id,
      email: user.email,
      role: user.role
    }, req);

    res.json({
      ...tokens,
      role: user.role,
      category: user.category || null,
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      }
    });
  } catch (err) {
    console.error('Login Error:', err);
    res.status(500).json({ error: 'Login failed' });
  }
};

exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ error: 'User not found' });

    const resetToken = crypto.randomBytes(32).toString('hex');
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
    await user.save();

    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
    await sendEmail(
      user.email,
      'Password Reset Request',
      `Click this link to reset your password: ${resetUrl}`,
      `<p>Click this link to reset your password:</p><p><a href="${resetUrl}">${resetUrl}</a></p>`
    );

    res.json({ message: 'Password reset email sent' });
  } catch (err) {
    console.error('Forgot Password Error:', err);
    res.status(500).json({ error: 'Failed to send password reset email' });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) return res.status(400).json({ error: 'Invalid or expired token' });

    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.json({ message: 'Password reset successful' });
  } catch (err) {
    console.error('Reset Password Error:', err);
    res.status(500).json({ error: 'Password reset failed' });
  }
};

exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.auth.sub).select('-password');
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (err) {
    console.error('Get Profile Error:', err);
    res.status(500).json({ error: 'Failed to get profile' });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const { name, email } = req.body;
    const user = await User.findById(req.auth.sub);
    if (!user) return res.status(404).json({ error: 'User not found' });

    if (email && email !== user.email) {
      const emailExists = await User.findOne({ email });
      if (emailExists) return res.status(400).json({ error: 'Email already in use' });
    }

    user.name = name || user.name;
    user.email = email || user.email;
    await user.save();

    res.json({ message: 'Profile updated successfully', user: { name: user.name, email: user.email } });
  } catch (err) {
    console.error('Update Profile Error:', err);
    res.status(500).json({ error: 'Failed to update profile' });
  }
};

exports.logout = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    const authHeader = req.headers.authorization;

    // Revoke refresh token if provided
    if (refreshToken) {
      await revokeRefreshToken(req.auth.sub, refreshToken);
    } else {
      // Revoke all refresh tokens for this user
      await revokeRefreshToken(req.auth.sub);
    }

    // Blacklist the current access token
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const decoded = jwt.decode(token);
      if (decoded && decoded.exp) {
        blacklistToken(token, decoded.exp * 1000);
      }
    }

    logSecurityEvent('User logout successful', {
      userId: req.auth.sub
    }, req);

    res.json({ message: 'Logout successful' });
  } catch (err) {
    console.error('Logout Error:', err);
    res.status(500).json({ error: 'Logout failed' });
  }
};

exports.getPendingInstitutions = async (req, res) => {
  try {
    if (req.auth.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied' });
    }

    const pendingInstitutions = await User.find({ role: 'pending_institution' }).select('-password');
    res.json(pendingInstitutions);
  } catch (err) {
    console.error('Get Pending Institutions Error:', err);
    res.status(500).json({ error: 'Failed to get pending institutions' });
  }
};

exports.approveInstitution = async (req, res) => {
  try {
    if (req.auth.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied' });
    }

    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    if (user.role !== 'pending_institution') {
      return res.status(400).json({ error: 'User is not a pending institution' });
    }

    user.role = 'institution';
    user.status = 'approved';
    await user.save();

    await sendEmail(
      user.email,
      'Institution Approval',
      `Your institution account has been approved. You can now log in and manage complaints.`,
      `<h2>Institution Account Approved</h2><p>Your institution account has been approved. You can now log in and manage complaints.</p>`
    );

    res.json({ message: 'Institution approved successfully' });
  } catch (err) {
    console.error('Approve Institution Error:', err);
    res.status(500).json({ error: 'Failed to approve institution' });
  }
};