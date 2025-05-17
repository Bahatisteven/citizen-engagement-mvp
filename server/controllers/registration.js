const User = require('../model/User.js');
const jwt = require('jsonwebtoken');

const register = async (req, res) => {
  try {
    const { name, email, password, role, category } = req.body;

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    const user = new User({ name, email, password, role, category });
    await user.save();

    const token = jwt.sign(
      { id: user._id, role: user.role, category: user.category || null },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.status(201).json({
      token,
      role: user.role,
      category: user.category || null
    });
  } catch (err) {
    res.status(500).json({ error: 'Registration failed' });
  }
};

module.exports = { register };