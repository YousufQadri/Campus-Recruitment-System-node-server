const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const validator = require("validator");

const AdminSchema = new Schema(
  {
    username: {
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
      required: true,
      trim: true
    }
  },
  {
    timestamp: true
  }
);
module.exports = mongoose.model("Admin", AdminSchema);
