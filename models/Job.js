const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const JobSchema = new Schema(
  {
    jobTitle: {
      type: String,
      required: true
    },
    description: {
      type: String,
      required: true
    },
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      required: true
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("Job", JobSchema);
