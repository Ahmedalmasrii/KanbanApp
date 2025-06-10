const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const User = require('../models/User');
const auth = require('../middleware/auth');
const checkLicense = require('../middleware/checkLicense');

// Hämta statistik
router.get('/', auth, checkLicense, async (req, res) => {
  try {
    const totalOrders = await Order.countDocuments();
    const toOrder = await Order.countDocuments({ status: 'todo' });
    const ordered = await Order.countDocuments({ status: 'ordered' });
    const delivered = await Order.countDocuments({ status: 'delivered' });

    const activeUsers = await User.countDocuments({ active: true });
    const lockedUsers = await User.countDocuments({
      $or: [
        { active: false },
        { lockUntil: { $gt: new Date() } }
      ]
    });

    res.json({
      totalOrders,
      toOrder,
      ordered,
      delivered,
      activeUsers,
      lockedUsers
    });
  } catch (err) {
    console.error('Fel vid hämtning av statistik:', err);
    res.status(500).json({ msg: 'Kunde inte hämta statistik' });
  }
});

module.exports = router;
