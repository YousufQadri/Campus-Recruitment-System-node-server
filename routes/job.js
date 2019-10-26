const express = require("express");
const router = express.Router();
const Joi = require("@hapi/joi");
const mongoose = require("mongoose");

const Job = require("../models/Job");
const auth = require("../middlewares/auth");

// create API params schema for validation
const postApiParamsSchema = Joi.object({
  title: Joi.string().required(),
  description: Joi.string().required()
});

// @route    GET api/v1/job/get-jobs
// @desc     Get jobs
// @access   Private
router.get("/get-jobs", auth, async (req, res) => {
  try {
    const jobs = await Job.find({});

    if (jobs.length < 1) {
      return res.json({
        success: true,
        message: "No jobs found"
      });
    }
    res.json({
      success: true,
      jobs
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
