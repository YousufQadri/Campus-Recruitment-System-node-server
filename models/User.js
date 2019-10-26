const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const validator = require("validator");

const UserSchema = new Schema(
  {
    email: {
      type: String,
      unique: true,
      required: true,
      validate(value) {
        if (!validator.isEmail(value)) {
          throw new Error("Error is invalid");
        }
      }
    },
    password: {
      type: String,
      required: true,
      minlength: 4,
      trim: true
    },
    type: {
      type: String,
      required: true,
      trim: true
    }
    // contact: {
    //   type: Number,
    //   required: true,
    //   trim: true
    // },
  },
  {
    timestamp: true
  }
);
module.exports = mongoose.model("User", UserSchema);
