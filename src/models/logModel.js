const mongoose = require("mongoose");

const logSchema = mongoose.Schema(
  {
    admin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
    },
    host: { type: String },
    agent: { type: String },
    oldIssuedQtyAss: { type: Number },
    oldIssuedDate: { type: Date },
    oldConsumedQty: { type: Number },
    newIssuedQtyAss: { type: Number },
    newIssuedDate: { type: Date },
    newConsumedQty: { type: Number },
    description: { type: String },
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true,
    },
    areaLineSheetIdent: { type: String },
    

  },
  {
    timestamps: true,
  }
);

const Log = mongoose.model("Log", logSchema);

module.exports = Log;
