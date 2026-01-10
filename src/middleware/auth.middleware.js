const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  try {

    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        message: "Token lipsă sau invalid."
      });
    }

    const token = authHeader.split(" ")[1];

    if (!token.startsWith("fake-jwt-token-for-")) {
      return res.status(401).json({
        message: "Token invalid."
      });
    }

    const userId = token.replace("fake-jwt-token-for-", "");

    req.user = {
      id: userId
    };

    next();
  } catch (err) {
    console.error("AUTH MIDDLEWARE ERROR:", err);
    return res.status(401).json({
      message: "Autentificare eșuată."
    });
  }
};
