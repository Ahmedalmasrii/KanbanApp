const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.register = async (req, res) => {
  const { username, email, role } = req.body;
  const tempPass = Math.random().toString(36).slice(-8);
  const hashed = await bcrypt.hash(tempPass, 10);

  const user = new User({ username, email, role, password: hashed, tempPassword: true });
  await user.save();

  res.status(201).json({ message: "User created", tempPassword: tempPass });
};

exports.login = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user) return res.status(401).json({ msg: 'Fel e-post eller lösenord' });

  if (!user.active) return res.status(403).json({ msg: 'Kontot är inaktivt, kontakta admin' });

  if (user.lockUntil && user.lockUntil > Date.now()) {
    return res.status(403).json({ msg: 'Kontot är låst tillfälligt. Försök senare' });
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    user.loginAttempts += 1;

    if (user.loginAttempts >= 3) {
      user.active = false;
      user.lockUntil = new Date(Date.now() + 60 * 60 * 1000); // Lås i 1h
    }

    await user.save();
    return res.status(401).json({ msg: 'Fel lösenord' });
  }

  // Inloggning lyckades – återställ försök
  user.loginAttempts = 0;
  user.lockUntil = null;
  await user.save();

  const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: '1d'
  });

  res.json({
    token,
    user: {
      id: user._id,
      username: user.username,
      role: user.role
    }
  });
};

exports.changePassword = async (req, res) => {
  const { userId, newPassword } = req.body;
  const hashed = await bcrypt.hash(newPassword, 10);
  await User.findByIdAndUpdate(userId, { password: hashed, tempPassword: false });
  res.json({ message: 'Lösenord uppdaterat' });
};

// Hämtar alla användare (admin-only)
exports.getAllUsers = async (req, res) => {
  const users = await User.find({}, '-password'); 
  res.json(users);
};

exports.updateUser = async (req, res) => {
  const { id } = req.params;
  const { role, active } = req.body;
  const updated = await User.findByIdAndUpdate(id, { role, active }, { new: true });
  res.json(updated);
};

exports.deleteUser = async (req, res) => {
  await User.findByIdAndDelete(req.params.id);
  res.json({ message: 'Användare raderad' });
};
