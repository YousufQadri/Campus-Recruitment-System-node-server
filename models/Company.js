const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const validator = require("validator");

const CompanySchema = new Schema(
  {
    companyName: {
      type: String,
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
    contactNo: {
      type: Number,
      required: true
    },
    description: {
      type: String,
      required: true,
      default: ""
    },
    website: {
      type: String,
      required: true,
      default: ""
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("Company", CompanySchema);
