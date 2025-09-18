const User = require('../model/User.js');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const sendEmail = require('../utils/sendEmail.js');

exports.register = async (req, res) => {
  try {
    // here we register the user 
    const { name, email, password, role, category } = req.body;
    const doesUserExist = await User.findOne({ email });
    if (doesUserExist) return res.status(400).json({ error: 'Email already registered' });

    // here we create the user
    const user = new User({ name, email, password, role, category });
    await user.save();

    // token generation
    const token = jwt.sign(
      { id: user._id, role: user.role, category: user.category || null },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );
    res.status(201).json({ token, role: user.role, category: user.category || null });
  } catch (err) {
    console.error('Register Error:', err);
    res.status(500).json({ error: 'Registration failed' });
  }
};

exports.login = async (req, res) => {
  try {
    // sending email and password in request body
    const { email, password } = req.body;

    // find user by email
    const user = await User.findOne({ email }).select('+password');
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });

    // verify password of the user
    const isPasswordValid = await user.verifyPassword(password);
    if (!isPasswordValid) return res.status(401).json({ error: 'Invalid credentials' });

    // token generation for the user
    const token = jwt.sign(
      { id: user._id, role: user.role, category: user.category || null },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );
    res.json({ token, role: user.role, category: user.category || null });
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
    await sendEmail({
      to: user.email,
      subject: 'Password Reset Request',
      text: `Click this link to reset your password: ${resetUrl}`
    });

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
    const user = await User.findById(req.user.id).select('-password');
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
    const user = await User.findById(req.user.id);
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

exports.getPendingInstitutions = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
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
    if (req.user.role !== 'admin') {
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

    await sendEmail({
      to: user.email,
      subject: 'Institution Approval',
      text: `Your institution account has been approved. You can now log in and manage complaints.`
    });

    res.json({ message: 'Institution approved successfully' });
  } catch (err) {
    console.error('Approve Institution Error:', err);
    res.status(500).json({ error: 'Failed to approve institution' });
  }
};