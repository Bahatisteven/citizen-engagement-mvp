const User = require('../model/User.js');
const jwt = require('jsonwebtoken');

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