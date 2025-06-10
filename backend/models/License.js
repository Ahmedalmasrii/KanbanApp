const mongoose = require('mongoose');

const licenseSchema = new mongoose.Schema({
  licenseKey: { type: String, required: true, unique: true },
  companyName: { type: String, required: true },
  maxUsers: { type: Number, required: true },
  validUntil: { type: Date, required: true },
  active: { type: Boolean, default: true },
});

module.exports = mongoose.model('License', licenseSchema);
