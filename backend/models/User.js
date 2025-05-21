const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: String,
  email: String,
  password: String,
  role: { type: String, enum: ['admin', 'manager', 'user', 'viewer'], default: 'user' },
  tempPassword: { type: Boolean, default: true },
  active: { type: Boolean, default: true },
  loginAttempts: { type: Number, default: 0 },
  lockUntil: { type: Date, default: null }
});

module.exports = mongoose.model('User', userSchema);
