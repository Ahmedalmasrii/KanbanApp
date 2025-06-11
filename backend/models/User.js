const mongoose = require('mongoose');

// Definierar användarschemat
const userSchema = new mongoose.Schema({
  username: String,
  email: String,
  password: String,
  role: { 
    type: String, 
    enum: ['admin', 'manager', 'user', 'viewer'],
    default: 'user'
  },
  active: { type: Boolean, default: true },
  loginAttempts: { type: Number, default: 0 },
  lockUntil: { type: Date, default: null },
  companyName: { type: String, required: true } // KNYTER användaren till företaget
});

module.exports = mongoose.model('User', userSchema);
