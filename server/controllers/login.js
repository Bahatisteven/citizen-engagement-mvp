const User = require('../model/User.js');
const { signToken } = require('../middleware/auth.js');

const login = async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select('+password');

  if (!user) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const valid = await user.verifyPassword(password);
  if (!valid) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const token = signToken(user);
  res.status(200).json({
    token,
    role: user.role,
    category: user.category || null
});
};

module.exports = login;