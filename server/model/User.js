const mongoose = require('mongoose');
const argon2 = require('argon2');

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
  }
}, { timestamps: true });

userSchema.pre('save', async function(next){
  if (!this.isModified('password')) return next();
  this.password = await argon2.hash(this.password);
  next();
});
userSchema.methods.verifyPassword = function(pw){ return argon2.verify(this.password, pw); };
module.exports = mongoose.model('User', userSchema);
