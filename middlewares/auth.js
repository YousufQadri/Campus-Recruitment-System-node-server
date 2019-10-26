const jwt = require("jsonwebtoken");
const config = require("config");

const User = require("../models/User");

// Environment variable setup
const JWT_SECRET = process.env.JWT_SECRET || config.get("JWT_SECRET");

module.exports = async (req, res, next) => {
  // Grab token from header
  const token = req.header("x-auth-token");

  // Check token existense
  if (!token) {
    return res.status(401).json({
      success: false,
      message: "No token, authorization denied"
    });
  }
  try {
    // Verify token
    const decoded = await jwt.verify(token, JWT_SECRET);

    // Check user in DB
    let existingUser = await User.findById(decoded.user.id);
    if (!existingUser) {
      res.status(401).json({
        success: false,
        message: "Token is not valid"
      });
    }

    // Set use object in req body
    req.user = decoded.user;
    next();
  } catch (error) {
    console.log("Error: ", error.message);
    res.status(401).json({
      success: false,
      message: "Token is not valid"
    });
  }
};
