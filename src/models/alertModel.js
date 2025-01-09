const mongoose = require("mongoose");

const alertSchema = mongoose.Schema(
  {
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
    },
    mto:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Mto",
    },
    pk: { type: String },
    issuedQty: { type: Number },
    consumedQty: { type: Number },
    issuedDate: { type: Date }
  },
  {
    timestamps: true,
  }
);

const Alert = mongoose.model("Alert", alertSchema);

module.exports = Alert;
