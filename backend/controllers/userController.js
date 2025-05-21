const User = require('../models/User');
const bcrypt = require('bcryptjs');

// Skapa ny användare
exports.createUser = async (req, res) => {
  try {
    const { username, email, password, role } = req.body;

    if (!username || !email || !password || !role) {
      return res.status(400).json({ msg: 'Alla fält krävs' });
    }

    const existingUser = await User.findOne({ email });
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
    });

    await user.save();
    res.status(201).json(user);
  } catch (err) {
    console.error('Fel vid skapande:', err);
    res.status(500).json({ msg: 'Serverfel vid skapande av användare' });
  }
};

// Hämta alla användare (utan lösenord)
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}, '-password');
    res.json(users);
  } catch (err) {
    res.status(500).json({ msg: 'Kunde inte hämta användare' });
  }
};

// Uppdatera användarroll/aktiv status
exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { role, active } = req.body;

    const updated = await User.findByIdAndUpdate(
      id,
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

// Radera användare
exports.deleteUser = async (req, res) => {
  try {
    const deleted = await User.findByIdAndDelete(req.params.id);

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

    const hashed = await bcrypt.hash(newPassword, 10);
    const updatedUser = await User.findByIdAndUpdate(id, {
      password: hashed,
      tempPassword: true,
      loginAttempts: 0,
      active: true,
      lockUntil: null
    }, { new: true });

    if (!updatedUser) return res.status(404).json({ msg: 'Användare hittades inte' });

    res.json({ msg: 'Lösenord återställdes' });
  } catch (err) {
    console.error('Fel vid återställning:', err);
    res.status(500).json({ msg: 'Serverfel vid återställning' });
  }
};


// Hämta användare som är inaktiva eller låsta
exports.getInactiveOrLockedUsers = async (req, res) => {
  try {
    const now = new Date();
    const users = await User.find(
      {
        $or: [
          { active: false },
          { lockUntil: { $ne: null, $gt: now } }
        ]
      },
      '-password'
    );
    res.json(users);
  } catch (err) {
    console.error('Fel vid hämtning av inaktiva/utlåsta:', err);
    res.status(500).json({ msg: 'Kunde inte hämta inaktiva/utlåsta användare' });
  }
};


exports.reactivateAllLockedUsers = async (req, res) => {
  try {
    const result = await User.updateMany(
      { $or: [{ active: false }, { lockUntil: { $gt: new Date() } }] },
      { $set: { active: true, lockUntil: null, loginAttempts: 0 } }
    );
    res.json({ message: 'Alla konton återställda', modifiedCount: result.modifiedCount });
  } catch (err) {
    console.error("Fel vid återställning:", err);
    res.status(500).json({ msg: 'Kunde inte återställa konton' });
  }
};

