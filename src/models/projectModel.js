const { date } = require("joi");
const mongoose = require("mongoose");

const projectSchema = mongoose.Schema(
  {
    project: { type: String },
    code: { type: String },
    description: { type: String },
    owner: { type: String },
    consultant: { type: String },
    headers: [{ type: String }],
    collectonName:{type: String},
    pk: { type: String },
    issuedQty: { type: String},
    consumedQty: { type: String},
    dateName: {type :String },
  },
  {
    timestamps: true,
  }
);

const Project = mongoose.model("Project", projectSchema);

module.exports = Project;
