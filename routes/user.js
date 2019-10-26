const express = require("express");
const router = express.Router();
const Joi = require("@hapi/joi");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const config = require("config");

const User = require("../models/User");

const JWT_SECRET = process.env.JWT_SECRET || config.get("JWT_SECRET");

// API Param schema for validation
const apiParamsSchema = Joi.object({
  password: Joi.string()
    .min(4)
    .required(),
  email: Joi.string()
    .email()
    .required(),
  type: Joi.string().required()
});

// @route    POST api/v1/user/register
// @desc     Register user
// @access   Public
router.post("/register", async (req, res) => {
  // Destructure data from request body
  let { email, password, type } = req.body;

  // Lowercase email
  email = email.toLowerCase();

  try {
    // validate api params
    const { error } = apiParamsSchema.validate({ email, password, type });
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }

    // Check if email already exist in DB
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({
        success: false,
        message: "User already exist with this email"
      });
    }

    // Create user
    user = await new User({
      email,
      password,
      type
    });

    // Hashing password
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);

    // Replace plain pass with hash pass
    user.password = hash;

    await user.save();

    // create jsonwebtoken
    const payload = {
      user: {
        email,
        id: user.id
      }
    };

    const token = await jwt.sign(payload, JWT_SECRET, {
      expiresIn: "365d"
    });

    // Response
    return res.json({
      success: true,
      token,
      message: "User registered successfully"
    });
  } catch (error) {
    console.log("Error: ", error.message);
    res.status(500).json({
      message: "Internal server error",
      success: false,
      error: error.message
    });
  }
});

// @route    POST api/v1/user/login
// @desc     Login user
// @access   Public
router.post("/login", async (req, res) => {
  // Destructure email & password
  let { email, password, type } = req.body;

  // Lowercase email
  email = email.toLowerCase();

  const { error } = apiParamsSchema.validate({ email, password, type });
  if (error) {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
  try {
    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid email"
      });
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Invalid password"
      });
    }

    // Create JWT
    const payload = {
      user: {
        email: user.email,
        id: user._id
      }
    };

    const token = await jwt.sign(payload, JWT_SECRET, { expiresIn: "365d" });

    // Send response

    return res.json({
      success: true,
      token,
      email: user.email,
      _id: user._id
    });
  } catch (error) {
    console.log("Error:", error.message);
    res.status(500).json({
      message: "Internal server error",
      success: false,
      error: error.message
    });
  }
});

module.exports = router;
