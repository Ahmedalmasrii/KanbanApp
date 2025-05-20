const User = require('../models/User');
const bcrypt = require('bcryptjs');

// Skapar ny användare
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
