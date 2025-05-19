const User = require('../model/User.js');
const jwt = require('jsonwebtoken');

const register = async (req, res) => {
  try {
    // sending name, email, role, category and password in request body 
    const { name, email, password, role, category } = req.body;

    // finding user by email
    const isUserExist = await User.findOne({ email });
    if (isUserExist) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    // create new user
    const user = new User({ name, email, password, role, category });
    await user.save();

    // token generation
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
    console.log("Error registering user:", err);
    res.status(500).json({ error: 'Registration failed' });
  }
};

module.exports = { register };