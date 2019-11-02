const express = require("express");
const router = express.Router();
const Joi = require("@hapi/joi");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const config = require("config");
const mongoose = require("mongoose");
const Student = require("../models/Student");
const Jobs = require("../models/Job");
const Company = require("../models/Company");
const AppliedJobs = require("../models/AppliedJob");
const auth = require("../middlewares/auth");

const JWT_SECRET = process.env.JWT_SECRET || config.get("JWT_SECRET");

// create API params schema for validation
const postApiParamsSchema = Joi.object({
  studentName: Joi.string().required(),
  password: Joi.string()
    .min(4)
    .required(),
  email: Joi.string()
    .email()
    .required(),
  qualification: Joi.string().required(),
  cgpa: Joi.number().required()
});

// @route    POST api/v1/student/register
// @desc     Register student
// @access   Public
router.post("/register", async (req, res) => {
  // Destructure data from request body
  let { studentName, email, password, qualification, cgpa } = req.body;

  // Lowercase email
  email = email.toLowerCase();
  studentName = studentName.trim();

  if (!studentName || !email || !password || !qualification || !cgpa) {
    return res.status(400).json({
      success: false,
      message: "Please fill all fields"
    });
  }

  try {
    // validate api params
    const { error } = postApiParamsSchema.validate({
      studentName,
      email,
      password,
      qualification,
      cgpa
    });
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }

    // Check if email already exist in DB
    let student = await Student.findOne({ email });
    if (student) {
      return res.status(400).json({
        success: false,
        message: "Email already exists!"
      });
    }

    // Create student
    student = await new Student({
      studentName,
      email,
      password,
      qualification,
      cgpa
    });

    // Hashing password
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);

    // Replace plain pass with hash pass
    student.password = hash;

    await student.save();

    // create jsonwebtoken
    const payload = {
      student: {
        email,
        id: student.id
      }
    };

    const token = await jwt.sign(payload, JWT_SECRET, {
      expiresIn: "365d"
    });

    // Response
    return res.json({
      success: true,
      token,
      student,
      message: "Student registered successfully"
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

// @route    POST api/v1/stduent/login
// @desc     Login stduent
// @access   Public
router.post("/login", async (req, res) => {
  // Destructure email & password
  let { email, password } = req.body;

  // Lowercase email
  email = email.toLowerCase();

  // Empty fields
  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: "Please fill all fields"
    });
  }

  try {
    // Find student
    const student = await Student.findOne({ email });
    if (!student) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid email"
      });
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, student.password);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Invalid password"
      });
    }

    // Create JWT
    const payload = {
      student: {
        email: student.email,
        id: student._id
      }
    };

    const token = await jwt.sign(payload, JWT_SECRET, { expiresIn: "365d" });

    // Send response
    return res.json({
      success: true,
      message: "Logged-in successfully!",
      token,
      email: student.email,
      id: student._id
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

// @route    GET api/v1/student/get-profile
// @desc     Get students
// @access   Private
router.get("/get-profile", auth.studentAuth, async (req, res) => {
  try {
    const student = await Student.find(
      { _id: req.student.id },
      { password: 0 }
    );

    if (student.length < 1) {
      return res.json({
        success: true,
        message: "No students found"
      });
    }
    res.json({
      success: true,
      student
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

// @route    GET api/v1/student/get-data
// @desc     Get jobs and companies data
// @access   Private
router.get("/get-data", auth.studentAuth, async (req, res) => {
  try {
    const allJobs = await Jobs.find({});
    const appliedJobs = await AppliedJobs.find({
      studentId: { $in: req.student.id }
    })
      .populate("companyId", { password: 0 })
      .populate("studentId", { password: 0 })
      .populate("jobId");
    // await appliedJobs.populate("companyId", { password: 0 }).execPopulate();
    const companies = await Company.find({});

    return res.status(200).send({
      success: true,
      message: "Jobs and companies record",
      allJobs,
      appliedJobs,
      companies
    });
  } catch (error) {
    return res.status(500).send({
      success: false,
      message: "Internal server error",
      error: error.message
    });
  }
});

// // @route    POST api/v1/student/create-profile
// // @desc     Create student profile
// // @access   Private
// router.post("/create-profile", auth, async (req, res) => {
//   // destructure body
//   const { qualification, cgpa, appliedJobs } = req.body;

//   // validate api params
//   const { error } = postApiParamsSchema.validate({
//     qualification,
//     cgpa,
//     appliedJobs
//   });

//   if (error) {
//     return res.status(400).json({
//       success: false,
//       message: error.message
//     });
//   }

//   try {
//     // Check if student exist
//     let student = await Student.findOne({ studentID: req.user.id });

//     // Grab user type from id
//     let userType = await User.findOne(
//       { _id: req.user.id },
//       { type: 1, _id: 0 }
//     );
//     // console.log(userType);

//     // Authorize only company to access this route
//     if (userType.type !== "Student") {
//       return res.status(401).json({
//         success: false,
//         message: "No privileges to access API"
//       });
//     }

//     if (student) {
//       return res.status(400).json({
//         success: false,
//         message: "Student already exists"
//       });
//     }

//     // create student profile
//     student = await new Student({
//       qualification,
//       cgpa,
//       appliedJobs,
//       studentID: req.user.id
//     });

//     // save company to database
//     await student.save();
//     // populate created company
//     student = await student
//       .populate("studentID", { password: 0 })
//       .execPopulate();

//     return res.json({
//       success: true,
//       message: "Student profile created successfully",
//       student
//     });
//   } catch (error) {
//     console.log("Error:", error.message);
//     res.status(500).json({
//       message: "Internal server error",
//       success: false,
//       error: error.message
//     });
//   }
// });

// // @route    DELETE api/v1/student/delete-profile
// // @desc     Delete student profile
// // @access   Private
// router.delete("/delete-student/:id", auth, async (req, res) => {
//   // validate object ID
//   const isValidObjectId = mongoose.Types.ObjectId.isValid(req.params.id);
//   if (!isValidObjectId) {
//     return res
//       .status(400)
//       .json({ success: false, message: "Invalid Object ID" });
//   }

//   try {
//     // search student in database
//     const studentToDelete = await Student.findByIdAndDelete(req.params.id);
//     if (!studentToDelete) {
//       return res
//         .status(400)
//         .json({ success: false, message: "Student not found" });
//     }

//     return res.json({
//       success: true,
//       message: "Student deleted successfully!"
//     });
//   } catch (error) {
//     console.log("Error:", error.message);
//     res.status(500).json({
//       message: "Internal server error",
//       success: false,
//       error: error.message
//     });
//   }
// });

module.exports = router;
