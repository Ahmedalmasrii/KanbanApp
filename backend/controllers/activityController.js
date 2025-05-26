const ActivityLog = require('../models/ActivityLog');
const User = require('../models/User');

exports.getAuditTrail = async (req, res) => {
    try {
      const logs = await ActivityLog.find()
        .sort({ timestamp: -1 })
        .populate('user', 'username role'); 
      res.json(logs);
    } catch (err) {
      res.status(500).json({ msg: 'Kunde inte hämta audit trail' });
    }
  };