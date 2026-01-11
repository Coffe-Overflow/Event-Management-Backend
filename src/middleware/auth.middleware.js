const User = require("../models/User");

module.exports = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Token lipsă sau invalid." });
    }

    const token = authHeader.split(" ")[1];

    if (!token.startsWith("fake-jwt-token-for-")) {
      return res.status(401).json({ message: "Token invalid." });
    }

    const userId = token.replace("fake-jwt-token-for-", "");

    const user = await User.findById(userId).select("_id role email");

    if (!user) {
      return res.status(401).json({ message: "User inexistent." });
    }

    // 🔥 AICI ESTE CHEIA
    req.user = {
      id: user._id,
      role: user.role,
      email: user.email
    };

    next();
  } catch (err) {
    console.error("AUTH MIDDLEWARE ERROR:", err);
    return res.status(401).json({ message: "Autentificare eșuată." });
  }
};
