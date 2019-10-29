const jwt = require("jsonwebtoken");
const config = require("config");

const Company = require("../models/Company");
const Student = require("../models/Student");
const Admin = require("../models/Admin");

// Environment variable setup
const JWT_SECRET = process.env.JWT_SECRET || config.get("JWT_SECRET");

// Student Authentication Middleware
const studentAuth = async (req, res, next) => {
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

    // Check student in DB
    let studentExist = await Student.findOne({ _id: decoded.student._id });
    if (!studentExist) {
      res.status(401).json({
        success: false,
        message: "Invalid token!"
      });
    }

    // Set use object in req body
    req.student = decoded.student;
    next();
  } catch (error) {
    console.log("Error: ", error.message);
    res.status(401).json({
      success: false,
      message: "Token is not valid"
    });
  }
};

// Company Authentication Middleware
const companyAuth = async (req, res, next) => {
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

    // Check company in DB
    let companyExist = await Company.findOne({ _id: decoded.company._id });
    if (!companyExist) {
      res.status(401).json({
        success: false,
        message: "Invalid token!"
      });
    }

    // Set use object in req body
    req.company = decoded.company;
    next();
  } catch (error) {
    console.log("Error: ", error.message);
    res.status(401).json({
      success: false,
      message: "Token is not valid"
    });
  }
};

// Admin Authentication Middleware
const adminAuth = async (req, res, next) => {
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

    // Check admin in DB
    let adminExist = await Company.findOne({ _id: decoded.admin._id });
    if (!adminExist) {
      res.status(401).json({
        success: false,
        message: "Invalid token!"
      });
    }

    // Set use object in req body
    req.admin = decoded.admin;
    next();
  } catch (error) {
    console.log("Error: ", error.message);
    res.status(401).json({
      success: false,
      message: "Token is not valid"
    });
  }
};

module.exports = {
  studentAuth,
  companyAuth,
  adminAuth
};
