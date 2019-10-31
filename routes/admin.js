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

// @route    GET api/v1/company/get-profile
// @desc     Get company profile
// @access   Private
router.get("/get-profile", auth.companyAuth, async (req, res) => {
  try {
    const company = await Company.find(
      { _id: req.company.id },
      { password: 0 }
    );

    if (company.length < 1) {
      return res.json({
        success: true,
        message: "No company found"
      });
    }
    res.json({
      success: true,
      company
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
    const allStudents = await Student.find({}, { password: 0 });
    const companies = await Company.find({}, { password: 0 });
    const companyJobs = await Jobs.find({});

    return res.status(200).send({
      success: true,
      message: "Students, jobs and companies record",
      allStudents,
      companies,
      companyJobs
    });
  } catch (error) {
    return res.status(500).send({
      success: false,
      message: "Internal server error",
      error: error.message
    });
  }
});
// const express = require("express");
// const router = express.Router();
// const Joi = require("@hapi/joi");
// const mongoose = require("mongoose");

// const Company = require("../models/Company");
// const auth = require("../middlewares/auth");

// // create API params schema for validation
// const postApiParamsSchema = Joi.object({
//   name: Joi.string().required(),
//   description: Joi.string().required(),
//   website: Joi.string().required()
// });

// // @route    GET api/v1/company/get-companies
// // @desc     Get companies
// // @access   Private

// router.get("/get-companies/", auth, async (req, res) => {
//   try {
//     // console.log(req.param.id);

//     const companies = await Company.find({});

//     if (companies.length < 1) {
//       return res.json({
//         success: true,
//         message: "No companies found"
//       });
//     }
//     res.json({
//       success: true,
//       companies
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

// // @route    GET api/v1/company/get-companies/:id
// // @desc     Get company by ID
// // @access   Private

// router.get("/get-companies/:id", auth, async (req, res) => {
//   try {
//     const cID = req.params.id;
//     console.log(req.params.id);

//     const companies = await Company.findOne({ companyID: cID });

//     if (companies.length < 1) {
//       return res.json({
//         success: true,
//         message: "No companies found"
//       });
//     }
//     res.json({
//       success: true,
//       companies
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

// // @route    POST api/v1/company/create-company
// // @desc     Create company
// // @access   Private
// router.post("/create-company", auth, async (req, res) => {
//   // destructure body
//   const { name, description, website } = req.body;

//   // validate api params
//   const { error } = postApiParamsSchema.validate({
//     name,
//     description,
//     website
//   });

//   if (error) {
//     return res.status(400).json({
//       success: false,
//       message: error.message
//     });
//   }

//   try {
//     // Check if company exist
//     let company = await Company.findOne({ name });
//     if (company) {
//       return res.status(400).json({
//         success: false,
//         message: "Company already exists"
//       });
//     }

//     // create company profile
//     company = await new Company({
//       name,
//       description,
//       website,
//       companyID: req.user.id
//     });

//     // save company to database
//     await company.save();
//     // populate created company
//     company = await company
//       .populate("companyID", { password: 0 })
//       .execPopulate();

//     return res.json({
//       success: true,
//       message: "Company profile created successfully",
//       company
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

// // @route    DELETE api/v1/company/delete-company
// // @desc     Delete company
// // @access   Private
// router.delete("/delete-company/:id", auth, async (req, res) => {
//   // validate object ID
//   const isValidObjectId = mongoose.Types.ObjectId.isValid(req.params.id);
//   if (!isValidObjectId) {
//     return res
//       .status(400)
//       .json({ success: false, message: "Invalid Object ID" });
//   }

//   try {
//     // search company in database
//     const companyToDelete = await Company.findByIdAndDelete(req.params.id);
//     if (!companyToDelete) {
//       return res
//         .status(400)
//         .json({ success: false, message: "Company not found" });
//     }

//     return res.json({
//       success: true,
//       message: "Company deleted successfully!"
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
