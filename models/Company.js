const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const CompanySchema = new Schema(
  {
    name: {
      type: String,
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
    },
    companyID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("Company", CompanySchema);
