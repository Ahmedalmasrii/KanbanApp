const User = require('../models/User');
const bcrypt = require('bcryptjs');

// Skapa en ny användare
exports.createUser = async (req, res) => {
  try {
    const { username, email, password, role } = req.body;
    const companyName = req.user.companyName;

    if (!username || !email || !password || !role || !companyName) {
      return res.status(400).json({ msg: 'Alla fält krävs inklusive företagsnamn' });
    }

    const existingUser = await User.findOne({ email, companyName });
    if (existingUser) {
      return res.status(400).json({ msg: 'Användare finns redan' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      username,
      email,
      password: hashedPassword,
      role,
      active: true,
      tempPassword: true,
      companyName
    });

    await user.save();
    res.status(201).json(user);
  } catch (err) {
    console.error('Fel vid skapande:', err);
    res.status(500).json({ msg: 'Serverfel vid skapande av användare' });
  }
};

// Hämta alla användare
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find(
      { companyName: req.user.companyName },
      '-password'
    );
    res.json(users);
  } catch (err) {
    res.status(500).json({ msg: 'Kunde inte hämta användare' });
  }
};

// Uppdatera användarroll och aktiv status
exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { role, active } = req.body;

    const updated = await User.findOneAndUpdate(
      { _id: id, companyName: req.user.companyName },
      { role, active },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ msg: 'Användare hittades inte' });
    }

    res.json(updated);
  } catch (err) {
    res.status(500).json({ msg: 'Kunde inte uppdatera användare' });
  }
};

// Radera användare permanent
exports.deleteUser = async (req, res) => {
  try {
    const deleted = await User.findOneAndDelete({
      _id: req.params.id,
      companyName: req.user.companyName
    });

    if (!deleted) {
      return res.status(404).json({ msg: 'Användare hittades inte' });
    }

    res.json({ message: 'Användare raderad' });
  } catch (err) {
    res.status(500).json({ msg: 'Kunde inte radera användare' });
  }
};

// Återställ lösenord
exports.resetPassword = async (req, res) => {
  try {
    const { id } = req.params;
    const { newPassword } = req.body;

    if (!newPassword) {
      return res.status(400).json({ msg: 'Nytt lösenord krävs' });
    }

    const user = await User.findOne({ _id: id, companyName: req.user.companyName });
    if (!user) {
      return res.status(404).json({ msg: 'Användare hittades inte' });
    }

    const hashed = await bcrypt.hash(newPassword, 10);
    user.password = hashed;
    user.tempPassword = true;
    user.loginAttempts = 0;
    user.active = true;
    user.lockUntil = null;

    await user.save();
    res.json({ msg: 'Lösenord återställdes' });
  } catch (err) {
    console.error('Fel vid återställning:', err);
    res.status(500).json({ msg: 'Serverfel vid återställning' });
  }
};

// Hämta inaktiva eller låsta användare
exports.getInactiveOrLockedUsers = async (req, res) => {
  try {
    const now = new Date();
    const users = await User.find(
      {
        companyName: req.user.companyName,
        $or: [
          { active: false },
          { lockUntil: { $ne: null, $gt: now } }
        ]
      },
      '-password'
    );
    res.json(users);
  } catch (err) {
    console.error('Fel vid hämtning:', err);
    res.status(500).json({ msg: 'Kunde inte hämta användare' });
  }
};

// Återaktivera alla konton
exports.reactivateAllUsers = async (req, res) => {
  try {
    const result = await User.updateMany(
      {
        companyName: req.user.companyName,
        $or: [
          { active: false },
          { lockUntil: { $gt: new Date() } }
        ]
      },
      {
        $set: { active: true, loginAttempts: 0, lockUntil: null }
      }
    );

    res.json({ message: `Återställde ${result.modifiedCount} konton` });
  } catch (err) {
    console.error('Fel vid återställning:', err);
    res.status(500).json({ msg: 'Kunde inte återställa konton' });
  }
};
