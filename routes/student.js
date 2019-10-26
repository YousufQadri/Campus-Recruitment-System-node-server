const express = require("express");
const router = express.Router();
const Joi = require("@hapi/joi");
const mongoose = require("mongoose");

const Student = require("../models/Student");
const auth = require("../middlewares/auth");

// create API params schema for validation
const postApiParamsSchema = Joi.object({
  qualification: Joi.array().required(),
  cgpa: Joi.number().required(),
  appliedJobs: Joi.array()
});

// @route    GET api/v1/student/get-students
// @desc     Get students
// @access   Private
router.get("/get-students", auth, async (req, res) => {
  try {
    const students = await Student.find({});

    if (students.length < 1) {
      return res.json({
        success: true,
        message: "No students found"
      });
    }
    res.json({
      success: true,
      students
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

// @route    POST api/v1/student/create-profile
// @desc     Create student profile
// @access   Private
router.post("/create-profile", auth, async (req, res) => {
  // destructure body
  const { qualification, cgpa, appliedJobs } = req.body;

  // validate api params
  const { error } = postApiParamsSchema.validate({
    qualification,
    cgpa,
    appliedJobs
  });

  if (error) {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }

  try {
    // Check if student exist
    let student = await Student.findOne({ studentID: req.user.id });
    if (student) {
      return res.status(400).json({
        success: false,
        message: "Student already exists"
      });
    }

    // create student profile
    student = await new Student({
      qualification,
      cgpa,
      appliedJobs,
      studentID: req.user.id
    });

    // save company to database
    await student.save();
    // populate created company
    student = await student
      .populate("studentID", { password: 0 })
      .execPopulate();

    return res.json({
      success: true,
      message: "Student profile created successfully",
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

// @route    DELETE api/v1/student/delete-profile
// @desc     Delete student profile
// @access   Private
router.delete("/delete-student/:id", auth, async (req, res) => {
  // validate object ID
  const isValidObjectId = mongoose.Types.ObjectId.isValid(req.params.id);
  if (!isValidObjectId) {
    return res
      .status(400)
      .json({ success: false, message: "Invalid Object ID" });
  }

  try {
    // search student in database
    const studentToDelete = await Student.findByIdAndDelete(req.params.id);
    if (!studentToDelete) {
      return res
        .status(400)
        .json({ success: false, message: "Student not found" });
    }

    return res.json({
      success: true,
      message: "Student deleted successfully!"
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
