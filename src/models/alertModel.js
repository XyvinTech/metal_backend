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
    areaLineSheetIdent: { type: String },
    issuedQtyAss: { type: Number },
    consumedQty: { type: Number },
   

  },
  {
    timestamps: true,
  }
);

const Alert = mongoose.model("Alert", alertSchema);

module.exports = Alert;
