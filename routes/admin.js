const express = require("express");
const router = express.Router();
const Joi = require("@hapi/joi");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const config = require("config");
const mongoose = require("mongoose");

const Admin = require("../models/Admin");
const Company = require("../models/Company");
const Student = require("../models/Student");
const Jobs = require("../models/Job");
const AppliedJobs = require("../models/AppliedJob");
const auth = require("../middlewares/auth");

const JWT_SECRET = process.env.JWT_SECRET || config.get("JWT_SECRET");

// @route    GET api/v1/admin/auth
// @desc     Get student data
// @access   Private
router.get("/auth", auth.adminAuth, async (req, res) => {
  try {
    const authUser = await Admin.findById(req.admin.id, { password: 0 });

    if (!authUser)
      return res.status(401).json({
        success: false,
        message: "Unauthorized access. Please login again"
      });

    return res.status(200).json(authUser);
  } catch (error) {
    console.log("Error:", error.message);
    res.status(500).json({
      message: "Internal server error",
      success: false,
      error: error.message
    });
  }
});

// @route    POST api/v1/admin/login
// @desc     Admin company
// @access   Public
router.post("/login", async (req, res) => {
  // Destructure email & password
  let { email, password } = req.body;

  // Empty fields
  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: "Please fill all fields"
    });
  }
  // Lowercase email
  email = email.toLowerCase();

  try {
    // Find admin
    const admin = await Admin.findOne({ email });
    if (!admin) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid email"
      });
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Invalid password"
      });
    }

    // Create JWT
    const payload = {
      admin: {
        email: admin.email,
        id: admin._id
      }
    };

    const token = await jwt.sign(payload, JWT_SECRET, { expiresIn: "365d" });

    // Send response
    return res.json({
      success: true,
      message: "Logged-in successfully!",
      token,
      email: admin.email,
      id: admin._id
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

// @route    GET api/v1/admin/get-data
// @desc     Get Students, jobs and companies data
// @access   Private
router.get("/get-data", auth.adminAuth, async (req, res) => {
  try {
    const students = await Student.find({}, { password: 0 });
    const companies = await Company.find({}, { password: 0 });
    const jobs = await Jobs.find({}).populate("companyId", { password: 0 });

    return res.status(200).send({
      success: true,
      message: "Students, jobs and companies record",
      students,
      companies,
      jobs
    });
  } catch (error) {
    return res.status(500).send({
      success: false,
      message: "Internal server error",
      error: error.message
    });
  }
});

// @route    DELETE api/v1/admin/delete-company
// @desc     Delete company
// @access   Private
router.delete("/delete-company/:id", auth.adminAuth, async (req, res) => {
  // validate object ID
  const isValidObjectId = mongoose.Types.ObjectId.isValid(req.params.id);
  if (!isValidObjectId) {
    return res
      .status(400)
      .json({ success: false, message: "Invalid Object ID" });
  }

  try {
    // search company in database
    const companyToDelete = await Company.findByIdAndDelete(req.params.id);
    console.log(companyToDelete);

    if (companyToDelete === null) {
      return res
        .status(400)
        .json({ success: false, message: "Company not found" });
    }
    const companyJobs = await Jobs.deleteMany({
      companyId: req.params.id
    });
    console.log(companyJobs);

    console.log(companyJobs);

    return res.json({
      success: true,
      message: "Company and jobs deleted successfully!"
    });
  } catch (error) {
    console.log("Error:", error.message);
    res.status(500).json({
      message: "Internal server error",
      success: false,
      error: error.message
    });
  }
  // try {
  //   // search company in database
  //   const companyToDelete = await Company.find({ _id: req.params.id });
  //   const companyJobs
  //   console.log(req.params.id);
  //   console.log(companyToDelete);

  //   if (!companyToDelete) {
  //     return res
  //       .status(400)
  //       .json({ success: false, message: "Company not found" });
  //   }

  //   return res.json({
  //     success: true,
  //     message: "Company deleted successfully!"
  //   });
  // } catch (error) {
  //   console.log("Error:", error.message);
  //   res.status(500).json({
  //     message: "Internal server error",
  //     success: false,
  //     error: error.message
  //   });
  // }
});

module.exports = router;
