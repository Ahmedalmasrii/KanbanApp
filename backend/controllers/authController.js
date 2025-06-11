const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Skapa ny användare (admin)
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

// Hämta alla användare (utan lösenord)
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

// Hämta användare som är inaktiva eller låsta
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
    console.error('Fel vid hämtning av inaktiva/utlåsta:', err);
    res.status(500).json({ msg: 'Kunde inte hämta inaktiva/utlåsta användare' });
  }
};

// Massåtgärd: Återställ alla inaktiva konton
exports.unlockAllUsers = async (req, res) => {
  try {
    await User.updateMany(
      {
        companyName: req.user.companyName,
        $or: [
          { active: false },
          { lockUntil: { $ne: null, $gt: new Date() } }
        ]
      },
      {
        $set: { active: true, loginAttempts: 0, lockUntil: null }
      }
    );
    res.json({ msg: 'Alla inaktiva/utlåsta konton har återaktiverats' });
  } catch (err) {
    console.error('Fel vid upplåsning:', err);
    res.status(500).json({ msg: 'Kunde inte låsa upp konton' });
  }
};

// Uppdatera användarroll/aktiv status
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

// Radera användare
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

// Registrera användare (frontend)
exports.register = async (req, res) => {
  try {
    const { username, email, password, role, companyName } = req.body;

    if (!username || !email || !password || !role || !companyName) {
      return res.status(400).json({ msg: 'Alla fält krävs' });
    }

    const existingUser = await User.findOne({ email, companyName });
    if (existingUser) {
      return res.status(400).json({ msg: 'Användare finns redan' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      username,
      email,
      password: hashedPassword,
      role,
      active: true,
      tempPassword: true,
      companyName
    });

    await newUser.save();
    res.status(201).json({ msg: 'Användare registrerad' });
  } catch (err) {
    console.error('Fel vid registrering:', err);
    res.status(500).json({ msg: 'Serverfel vid registrering' });
  }
};

// Logga in användare
exports.login = async (req, res) => {
  const { email, password, companyName } = req.body;

  try {
    const user = await User.findOne({ email, companyName });
    if (!user) {
      return res.status(400).json({ msg: 'Fel e-post, lösenord eller företag' });
    }

    if (!user.active) {
      return res.status(400).json({ msg: 'Kontot är inaktivt. Kontakta administratör.' });
    }

    if (user.lockUntil && user.lockUntil > Date.now()) {
      return res.status(400).json({ msg: 'Kontot är låst. Kontakta administratör.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      user.loginAttempts += 1;
      if (user.loginAttempts >= 3) {
        user.lockUntil = Date.now() + 60 * 60 * 1000;
      }
      await user.save();
      return res.status(400).json({ msg: 'Fel e-post eller lösenord' });
    }

    user.loginAttempts = 0;
    user.lockUntil = null;
    await user.save();

    const payload = {
      id: user._id,
      role: user.role,
      companyName: user.companyName
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1d' });

    res.json({
      token,
      mustChangePassword: user.tempPassword,
      companyName: user.companyName
    });
  } catch (err) {
    console.error('Fel vid inloggning:', err);
    res.status(500).json({ msg: 'Serverfel vid inloggning' });
  }
};

// Placeholder för ändra lösenord
exports.changePassword = async (req, res) => {
  res.send('Change password fungerar (placeholder)');
};
