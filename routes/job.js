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

// @route    POST api/v1/job/create-job
// @desc     Create job
// @access   Private
router.post("/create-job", auth, async (req, res) => {
  // destructure body
  const { title, description } = req.body;

  // validate api params
  const { error } = postApiParamsSchema.validate({
    title,
    description
  });

  if (error) {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }

  try {
    // Check if job exist
    let job = await Job.findOne({
      $and: [{ companyID: req.user.id }, { title }]
    });
    if (job) {
      return res.status(400).json({
        success: false,
        message: "Job already exists"
      });
    }

    // create job
    job = await new Job({
      title,
      description,
      companyID: req.user.id
    });

    // save job to database
    await job.save();
    // populate created job
    job = await job
      .populate("companyID", { name: 1, description: 1, website: 1 })
      .execPopulate();

    return res.json({
      success: true,
      message: "Job created successfully",
      job
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

// @route    DELETE api/v1/job/delete-job
// @desc     Delete job
// @access   Private
router.delete("/delete-job/:id", auth, async (req, res) => {
  // validate object ID
  const isValidObjectId = mongoose.Types.ObjectId.isValid(req.params.id);
  if (!isValidObjectId) {
    return res
      .status(400)
      .json({ success: false, message: "Invalid Object ID" });
  }

  try {
    // search job in database
    const jobToDelete = await Job.findByIdAndDelete(req.params.id);
    if (!jobToDelete) {
      return res.status(400).json({ success: false, message: "Job not found" });
    }

    return res.json({
      success: true,
      message: "job deleted successfully!"
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
