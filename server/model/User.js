const mongoose = require('mongoose');
const argon2 = require('argon2');

// here we define the User model for the database 
const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true, select: false },
  role: {
    type: String,
    enum: ['citizen','pending_institution','institution','admin'],
    required: true
  },
  category: { type: String, enum: ['Road','Water','Electricity','Health','Other'], required: function(){ return this.role==='institution' || this.role==='pending_institution'}},
    status: {
    type: String,
    enum: ['pending','approved'],
    default: function() {
      return this.role === 'citizen' ? 'approved' : 'pending';
    }
  },
  resetPasswordToken: { type: String },
  resetPasswordExpires: { type: Date },
  refreshTokens: [{
    token: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
    expiresAt: { type: Date, required: true },
    isActive: { type: Boolean, default: true }
  }]
}, { timestamps: true });

// hash password using argon2
userSchema.pre('save', async function(next){
  if (!this.isModified('password')) return next();
  this.password = await argon2.hash(this.password);
  next();
});

// here we verify password using argon2
userSchema.methods.verifyPassword = function(pw){ return argon2.verify(this.password, pw); };
module.exports = mongoose.model('User', userSchema);
