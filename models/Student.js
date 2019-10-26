const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const StudentSchema = new Schema(
  {
    qualification: {
      type: Array,
      required: true
    },
    cgpa: {
      type: Number,
      required: true
    },
    appliedJobs: {
      type: Array,
      required: true,
      default: []
    },
    studentID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("Student", StudentSchema);
