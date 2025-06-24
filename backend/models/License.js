const mongoose = require('mongoose');

const licenseSchema = new mongoose.Schema({
  licenseKey: { type: String, required: true, unique: true },
  companyName: { type: String, required: true },
  maxUsers: { type: Number, required: true },
  validUntil: { type: Date, required: true },
  active: { type: Boolean, default: true },
  urlPath: { type: String, required: true } // t.ex. "/c3"
});

module.exports = mongoose.model('License', licenseSchema);
