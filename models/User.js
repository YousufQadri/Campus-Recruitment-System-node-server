const mongoose = require(mongoose);
const Schema = mongoose.Schema;
const validator = require(validator);

const UserSchema = new Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true
    },
    password: {
      type: String,
      required: true,
      minlength: 4,
      trim: true
    },
    email: {
      type: String,
      required: true,
      validate(value) {
        if (!validator.isEmail(value)) {
          throw new Error("Error is invalid");
        }
      }
    },
    contact: {
      type: Number,
      required: true,
      trim: true
    },
    type: {
      type: String,
      required: true,
      trim: true
    }
  },
  {
    timestamp: true
  }
);
module.exports = mongoose.model("User", UserSchema);