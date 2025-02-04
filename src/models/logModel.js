const mongoose = require("mongoose");

const logSchema = mongoose.Schema(
  {
    admin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
    },
    host: { type: String },
    agent: { type: String },
    oldPayload: {
      type: Object,
      default: {},
    },
    newPayload: {
      type: Object,
      default: {},
    },
    description: { type: String },
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true,
    },
    pk: { type: String },
  },
  {
    timestamps: true,
  }
);

const Log = mongoose.model("Log", logSchema);

module.exports = Log;
