const User = require('../models/User');
const bcrypt = require('bcryptjs');

// Skapa en ny användare
exports.createUser = async (req, res) => {
  try {
    const { username, email, password, role } = req.body;

    // Kontrollera att alla fält är ifyllda
    if (!username || !email || !password || !role) {
      return res.status(400).json({ msg: 'Alla fält krävs' });
    }

    // Kontrollera om användaren redan finns
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ msg: 'Användare finns redan' });
    }

    // Kryptera lösenordet
    const hashedPassword = await bcrypt.hash(password, 10);

    // Skapa ny användare
    const user = new User({
      username,
      email,
      password: hashedPassword,
      role,
      active: true,
      tempPassword: true, // flaggar för att användaren ska byta lösenord vid första inloggning
    });

    await user.save();
    res.status(201).json(user);
  } catch (err) {
    console.error('Fel vid skapande:', err);
    res.status(500).json({ msg: 'Serverfel vid skapande av användare' });
  }
};

// Hämta alla användare (utan att visa lösenord)
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}, '-password'); // exkluderar lösenordet
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

    // Uppdaterar användarroll och status
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

// Radera användare permanent
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

// Återställ lösenord för användare
exports.resetPassword = async (req, res) => {
  try {
    const { id } = req.params;
    const { newPassword } = req.body;

    if (!newPassword) {
      return res.status(400).json({ msg: 'Nytt lösenord krävs' });
    }

    // Krypterar det nya lösenordet
    const hashed = await bcrypt.hash(newPassword, 10);

    // Uppdaterar användaren med nytt lösenord och nollställer låsningen
    const updatedUser = await User.findByIdAndUpdate(id, {
      password: hashed,
      tempPassword: true,  // flaggar för att lösenordet är nytt
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

    // Hämta alla användare som är inaktiva eller har kontolåsning
    const users = await User.find(
      {
        $or: [
          { active: false },
          { lockUntil: { $ne: null, $gt: now } }
        ]
      },
      '-password' // exkluderar lösenord
    );
    res.json(users);
  } catch (err) {
    console.error('Fel vid hämtning av inaktiva/utlåsta:', err);
    res.status(500).json({ msg: 'Kunde inte hämta inaktiva/utlåsta användare' });
  }
};

// Återaktivera alla inaktiva eller låsta konton
exports.reactivateAllUsers = async (req, res) => {
  try {
    const result = await User.updateMany(
      {
        $or: [
          { active: false },
          { lockUntil: { $gt: new Date() } }
        ]
      },
      {
        $set: {
          active: true,
          loginAttempts: 0,
          lockUntil: null
        }
      }
    );

    res.json({ message: `Återställde ${result.modifiedCount} konton` });
  } catch (err) {
    console.error('Fel vid återställning:', err);
    res.status(500).json({ msg: 'Kunde inte återställa konton' });
  }
};
