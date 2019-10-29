const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const validator = require("validator");

const StudentSchema = new Schema(
  {
    studentName: {
      type: String,
      unique: true,
      required: true
    },
    email: {
      type: String,
      unique: true,
      required: true,
      validate(value) {
        if (!validator.isEmail(value)) {
          throw new Error("Email is invalid");
        }
      }
    },
    password: {
      type: String,
      required: true
    },
    qualification: {
      type: String,
      required: true
    },
    cgpa: {
      type: Number,
      required: true
    },
    appliedJobs: {
      type: Array,
      default: []
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("Student", StudentSchema);
