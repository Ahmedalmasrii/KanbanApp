const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const userCtrl = require('../controllers/userController');
const checkPermission = require('../middleware/permissions');
const checkLicense = require('../middleware/checkLicense');

// Middleware för admin-roll
const isAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Endast admin' });
  next();
};

// Hämtar alla managers
router.get('/managers', auth, checkLicense, async (req, res) => {
  try {
    const managers = await User.find({ role: 'manager' }).select('username email _id');
    res.json(managers);
  } catch (err) {
    res.status(500).json({ msg: 'Kunde inte hämta managers' });
  }
});

// Hämtar inaktiva/låsta konton
router.get('/inactive-or-locked', auth, checkLicense, isAdmin, async (req, res) => {
  try {
    const now = new Date();
    const users = await User.find({
      $or: [
        { active: false },
        { lockUntil: { $gt: now } }
      ]
    }, '-password');
    res.json(users);
  } catch (err) {
    res.status(500).json({ msg: 'Kunde inte hämta konton', error: err.message });
  }
});

// Återställ alla konton (låsta/inaktiva)
router.put('/reactivate-all', auth, checkLicense, isAdmin, async (req, res) => {
  try {
    await User.updateMany(
      { $or: [{ active: false }, { lockUntil: { $gt: new Date() } }] },
      { $set: { active: true, loginAttempts: 0, lockUntil: null } }
    );
    res.json({ message: 'Alla konton återställdes' });
  } catch (err) {
    res.status(500).json({ msg: 'Fel vid återställning', error: err.message });
  }
});

// Återställ lösenord
router.put('/:id/reset-password', auth, checkLicense, checkPermission('manage_users'), userCtrl.resetPassword);

// Radera användare
router.delete('/:id', auth, checkLicense, isAdmin, userCtrl.deleteUser);

// Uppdatera användare
router.put('/:id', auth, checkLicense, isAdmin, userCtrl.updateUser);

// Skapa användare
router.post('/', auth, checkLicense, isAdmin, async (req, res) => {
  try {
    const { username, email, password, role, active } = req.body;
    if (!username || !email || !password || !role) {
      return res.status(400).json({ msg: 'Alla fält krävs' });
    }

    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ msg: 'Användare finns redan' });

    const hashed = await bcrypt.hash(password, 10);
    const newUser = new User({
      username,
      email,
      password: hashed,
      role,
      active,
      tempPassword: true
    });

    await newUser.save();
    res.status(201).json({ message: 'Användare skapad' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Något gick fel', error: err.message });
  }
});

// Hämtar alla användare
router.get('/', auth, checkLicense, isAdmin, userCtrl.getAllUsers);

// Admin Stats (kan ev. flyttas till statsRoutes.js)
router.get('/stats', auth, checkLicense, isAdmin, async (req, res) => {
  try {
    const Order = require('../models/Order');
    const User = require('../models/User');

    const [totalOrders, toOrder, ordered, delivered, activeUsers, lockedUsers] = await Promise.all([
      Order.countDocuments(),
      Order.countDocuments({ status: 'Att beställa' }),
      Order.countDocuments({ status: 'Beställd' }),
      Order.countDocuments({ status: 'Levererad' }),
      User.countDocuments({ active: true }),
      User.countDocuments({ $or: [{ active: false }, { lockUntil: { $gt: new Date() } }] }),
    ]);

    res.json({ totalOrders, toOrder, ordered, delivered, activeUsers, lockedUsers });
  } catch (err) {
    res.status(500).json({ msg: 'Fel vid hämtning av statistik', error: err.message });
  }
});

module.exports = router;
