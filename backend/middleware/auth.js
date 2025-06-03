const jwt = require("jsonwebtoken"); // Importerar JSON Web Token för verifiering
const User = require("../models/User"); // Importerar User-modellen

// Middleware som skyddar routes med token-verifiering
module.exports = async (req, res, next) => {
  // Extraherar token från Authorization-headern (format: Bearer TOKEN)
  const token = req.headers.authorization?.split(" ")[1];
  
  // Om ingen token finns, avvisa anropet
  if (!token) return res.status(401).json({ error: "No token" });

  try {
    // Verifierar token och hämtar decoded payload
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Letar upp användaren i databasen med ID från token
    const user = await User.findById(decoded.id);
    if (!user) return res.status(401).json({ error: "User not found" });

    // Lagrar användarinfo i request-objektet så att det är tillgängligt i alla routes
    req.user = {
      id: user._id,
      username: user.username,
      role: user.role,
    };

    // Går vidare till nästa middleware eller route
    next();
  } catch (err) {
    // Om token är ogiltig, avvisa anropet
    res.status(401).json({ error: "Invalid token" });
  }
};
