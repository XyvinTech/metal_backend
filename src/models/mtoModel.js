const mongoose = require("mongoose");

const mtoSchema = mongoose.Schema(
  {
    unit: { type: String },
    lineNo: { type: String },
    lineLocation: { type: String },
    areaLineSheetIdent: { type: String },
    area: { type: String },
    line: { type: String },
    sheet: { type: Number },
    identCode: { type: String },
    uom: { type: String },
    size: { type: Number },
    sizeTwo: { type: Number },
    specCode: { type: String },
    shortCode: { type: String },
    cat: { type: String },
    shortDesc: { type: String },
    mtoRev: { type: String },
    sf: { type: String },
    scopeQty: { type: Number },
    issuedQtyAss: { type: Number },
    issuedDate: { type: Date },
    sizeTwo: { type: Number },
    balToIssue: { type: Number },
    consumedQty: { type: Number },
    balanceStock: { type: Number },
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
    },
  },
  {
    timestamps: true,
  }
);

const Mto = mongoose.model("Mto", mtoSchema);

module.exports = Mto;
