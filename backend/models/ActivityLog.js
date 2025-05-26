const mongoose = require('mongoose');

const activityLogSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    action: String,
    target: String,
    timestamp: { type: Date, default: Date.now }
  });
  

module.exports = mongoose.model('ActivityLog', activityLogSchema);
