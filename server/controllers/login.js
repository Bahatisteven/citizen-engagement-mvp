const User = require('../model/User.js');
const { signToken } = require('../middleware/auth.js');

const login = async (req, res) => {
  // sending email and password in request body
  const { email, password } = req.body;

  // find user by email
  const user = await User.findOne({ email }).select('+password');

  if (!user) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  // find institution by email
  const institution = await institution.findOne({ email });

  if (!institution) {
    return res.status(404).json({ message: 'Institution not found' });
  }

  if (institution.status !== 'Approved') {
    return res.status(403).json({ message: 'Your account is pending approval' });
  }

  // verify password of the user
  const verifyPassword = await user.verifyPassword(password);
  if (!verifyPassword) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  // token generation for the user
  const token = signToken(user);
  res.status(200).json({
    token,
    role: user.role,
    category: user.category || null
});
};

module.exports = login;