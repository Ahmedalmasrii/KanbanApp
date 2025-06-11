const jwt = require("jsonwebtoken");
const User = require("../models/User");

module.exports = async (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "No token" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    if (!user) return res.status(401).json({ error: "User not found" });

    req.user = {
      id: user._id,
      username: user.username,
      role: user.role,
      companyName: user.companyName // Viktigt för filtrering!
    };

    next();
  } catch (err) {
    res.status(401).json({ error: "Invalid token" });
  }
};
