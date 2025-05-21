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

// Massåtgärd: Återställ alla inaktiva konton
exports.unlockAllUsers = async (req, res) => {
  try {
    await User.updateMany(
      {
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
// Registrera användare
exports.register = async (req, res) => {
  // Du kan återanvända din createUser-logik här om du vill
  const { username, email, password, role } = req.body;

  if (!username || !email || !password || !role) {
    return res.status(400).json({ msg: "Alla fält krävs" });
  }

  const existingUser = await User.findOne({ email });
  if (existingUser) return res.status(400).json({ msg: "Användare finns redan" });

  const hashedPassword = await bcrypt.hash(password, 10);

  const newUser = new User({
    username,
    email,
    password: hashedPassword,
    role,
    active: true,
    tempPassword: true
  });

  await newUser.save();
  res.status(201).json({ msg: "Användare registrerad" });
};

// Logga in användare
const jwt = require("jsonwebtoken");

exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ msg: "Fel e-post eller lösenord" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ msg: "Fel e-post eller lösenord" });

    // Token skapad med user-id och role
    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    res.json({
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    res.status(500).json({ msg: "Serverfel vid inloggning" });
  }
};


// Ändra lösenord
exports.changePassword = async (req, res) => {
  // Placeholder – implementera med auth-token osv
  res.send("Change password fungerar (placeholder)");
};
