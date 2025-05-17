const mongoose = require('mongoose');
const argon2 = require('argon2');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    lowercase: true,
    unique: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    select: false // exclude by default
  },
  role: {
    type: String,
    enum: ['citizen', 'institution', 'admin'],
    required: true
  },
  // Only required for institutions:
  category: {
    type: String,
    enum: ['Road', 'Water', 'Electricity', 'Health', 'Other'],
    required: function () { return this.role === 'institution'; }
  }
}, { timestamps: true });

// Pre-save password hashing with Argon2
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  try {
    this.password = await argon2.hash(this.password);
    next();
  } catch (err) {
    next(err);
  }
});

// an instance method to verify password
userSchema.methods.verifyPassword = function (candidatePassword) {
  return argon2.verify(this.password, candidatePassword);
};

module.exports = mongoose.model('User', userSchema);
