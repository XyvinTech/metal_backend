const mongoose = require("mongoose");

const adminSchema = mongoose.Schema(
  {
    name: { type: String },
    superAdmin: {
      type: Boolean,
      default: false,
    },
    project: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
    }],
    email: { type: String },
    phone: { type: String },
    password: { type: String },
    status: {
      type: Boolean,
      default: true,
    },
    otp: { type: String },
  },
  {
    timestamps: true,
  }
);

const Admin = mongoose.model("Admin", adminSchema);

module.exports = Admin;
