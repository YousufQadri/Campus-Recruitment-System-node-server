const express = require("express");
const router = express.Router();
const Joi = require("@hapi/joi");
const mongoose = require("mongoose");
const auth = require("../middlewares/auth");

const Job = require("../models/Job");
const AppliedJob = require("../models/AppliedJob");

const jobApiParamsSchema = Joi.object({
  jobTitle: Joi.string().required(),
  description: Joi.string().required()
});
const applyJobApiParamsSchema = Joi.object({
  experience: Joi.string().required(),
  skills: Joi.string().required()
});

// @route    POST api/v1/job/create-job
// @desc     Create job
// @access   Private
router.post("/create-job", auth.companyAuth, async (req, res) => {
  let { jobTitle, description } = req.body;

  if (!jobTitle || !description) {
    return res.status(400).json({
      success: false,
      message: "Please fill all fields"
    });
  }
  // Remove whitespaces
  jobTitle = jobTitle.trim();
  description = description.trim();
  const { error } = jobApiParamsSchema.validate({
    jobTitle,
    description
  });

  if (error) {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
  try {
    let job = await new Job({
      jobTitle,
      description,
      companyId: req.company.id
    });
    await job.save();
    job = await job.populate("companyId", { password: 0 }).execPopulate();
    return res.status(200).json({
      success: true,
      job,
      message: "Job created!"
    });
  } catch (error) {
    return res.status(500).send({
      success: false,
      message: "Internal server error"
    });
  }
});

// @route    POST api/v1/job/apply
// @desc     Apply for job
// @access   Private
router.post("/apply/:id", auth.studentAuth, async (req, res) => {
  let { experience, skills } = req.body;

  // Check empty body
  if (!experience || !skills) {
    return res.status(400).json({
      success: false,
      message: "Please fill all fields!"
    });
  }
  experience = experience.trim();
  skills = skills.trim();

  // Check valid object ID
  const jobID = mongoose.Types.ObjectId.isValid(req.params.id);
  if (!jobID) {
    return res.status(400).json({
      success: false,
      message: "Invalid job id!"
    });
  }

  // Check body matching param schema
  const { error } = applyJobApiParamsSchema.validate({
    experience,
    skills
  });
  if (error) {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
  try {
    // Check if job id exist
    const findJob = await Job.findOne({ _id: req.params.id });
    if (!findJob) {
      return res.status(400).json({
        success: false,
        message: "No job found against this ID"
      });
    }

    // Check if already applied
    const appliedJobs = await AppliedJob.find({ studentId: req.student.id });
    const specificJob = appliedJobs.filter(job => {
      return req.params.id !== job.jobId;
    });
    if (specificJob.length !== 0) {
      return res.status(400).json({
        success: false,
        message: "You already applied for this job!"
      });
    }

    // Grab company to display job creator
    const company = await findJob
      .populate("companyId", { password: 0 })
      .execPopulate();

    const job = await new AppliedJob({
      experience,
      skills,
      jobId: req.params.id,
      companyId: company.companyId._id,
      studentId: req.student.id
    });
    await job.save();
    jobWithDetails = await job
      .populate("studentId", { password: 0 })
      .execPopulate();
    return res.status(200).json({
      success: true,
      message: "Successfully applied for job",
      jobWithDetails
    });
  } catch (error) {
    return res.status(500).send({
      success: false,
      message: "Internal server error",
      error: error.message
    });
  }
});
// const User = require("../models/User");
// const auth = require("../middlewares/auth");

// // create API params schema for validation
// const postApiParamsSchema = Joi.object({
//   title: Joi.string().required(),
//   description: Joi.string().required()
// });

// // @route    GET api/v1/job/get-jobs
// // @desc     Get jobs
// // @access   Private
// router.get("/get-jobs", auth, async (req, res) => {
//   try {
//     const jobs = await Job.find({});

//     if (jobs.length < 1) {
//       return res.json({
//         success: true,
//         message: "No jobs found"
//       });
//     }
//     res.json({
//       success: true,
//       jobs
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

// // @route    POST api/v1/job/create-job
// // @desc     Create job
// // @access   Private
// router.post("/create-job", auth, async (req, res) => {
//   // destructure body
//   const { title, description } = req.body;

//   // validate api params
//   const { error } = postApiParamsSchema.validate({
//     title,
//     description
//   });

//   if (error) {
//     return res.status(400).json({
//       success: false,
//       message: error.message
//     });
//   }

//   try {
//     // Check if job exist
//     let job = await Job.findOne({
//       $and: [{ companyID: req.user.id }, { title }]
//     });

//     // Grab user type from id
//     let userType = await User.findOne(
//       { _id: req.user.id },
//       { type: 1, _id: 0 }
//     );
//     // console.log(userType);

//     // Authorize only company to access this route
//     if (userType.type !== "Company") {
//       return res.status(401).json({
//         success: false,
//         message: "No privileges to access API"
//       });
//     }

//     if (job) {
//       return res.status(400).json({
//         success: false,
//         message: "Job already exists"
//       });
//     }

//     // create job
//     job = await new Job({
//       title,
//       description,
//       companyID: req.user.id
//     });

//     // save job to database
//     await job.save();
//     // populate created job
//     job = await job
//       .populate("companyID", { name: 1, description: 1, website: 1 })
//       .execPopulate();

//     return res.json({
//       success: true,
//       message: "Job created successfully",
//       job
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

// // @route    DELETE api/v1/job/delete-job
// // @desc     Delete job
// // @access   Private
// router.delete("/delete-job/:id", auth, async (req, res) => {
//   // validate object ID
//   const isValidObjectId = mongoose.Types.ObjectId.isValid(req.params.id);
//   if (!isValidObjectId) {
//     return res
//       .status(400)
//       .json({ success: false, message: "Invalid Object ID" });
//   }

//   try {
//     // search job in database
//     const jobToDelete = await Job.findByIdAndDelete(req.params.id);
//     if (!jobToDelete) {
//       return res.status(400).json({ success: false, message: "Job not found" });
//     }

//     return res.json({
//       success: true,
//       message: "job deleted successfully!"
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
