const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const AppliedJobSchema = new Schema(
  {
    experience: {
      type: String,
      required: true
    },
    skills: {
      type: String,
      required: true
    },
    jobId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Job",
      required: true
    },
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      required: true
    },
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("AppliedJobs", AppliedJobSchema);
