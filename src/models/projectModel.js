const mongoose = require("mongoose");

const projectSchema = mongoose.Schema(
  {
    project: { type: String },
    code: { type: String },
    description: { type: String },
    owner: { type: String },
    consultant: { type: String },
    headers: [{ type: String }],
    collectionName: { type: String },
    workOrder: { type: String },
    poDate: { type: Date },
    finishedDate: { type: Date },
    pk: { type: String },
    issuedQty: { type: String },
    consumedQty: { type: String },
    balanceQty: { type: String },
    balanceToIssue: { type: String },
    reqQty: { type: String },
    transOtherQty: { type: String },
    dateName: { type: String },
    selectedHeaders: [{ type: String }],
  },
  {
    timestamps: true,
  }
);

const Project = mongoose.model("Project", projectSchema);

module.exports = Project;
