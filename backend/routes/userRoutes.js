const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const userCtrl = require('../controllers/userController');
const checkPermission = require('../middleware/permissions');

// Middleware för admin-roll
const isAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Endast admin' });
  next();
};

// Hämtar alla managers
router.get('/managers', auth, async (req, res) => {
  try {
    const managers = await User.find({ role: 'manager' }).select('username email _id');
    res.json(managers);
  } catch (err) {
    res.status(500).json({ msg: 'Kunde inte hämta managers' });
  }
});

// Hämtar inaktiva/låsta konton
router.get('/inactive-or-locked', auth, isAdmin, async (req, res) => {
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
router.put('/reactivate-all', auth, isAdmin, async (req, res) => {
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
router.put('/:id/reset-password', auth, checkPermission('manage_users'), userCtrl.resetPassword);

//  Radera användare
router.delete('/:id', auth, isAdmin, userCtrl.deleteUser);

// Uppdatera användare
router.put('/:id', auth, isAdmin, userCtrl.updateUser);

// Skapa användare
router.post('/', auth, isAdmin, async (req, res) => {
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
router.get('/', auth, isAdmin, userCtrl.getAllUsers);

module.exports = router;
