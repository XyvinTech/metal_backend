const mongoose = require("mongoose");

const projectSchema = mongoose.Schema(
  {
    project: { type: String },
    code: { type: String },
    description: { type: String },
    owner: { type: String },
    consultant: { type: String },
  },
  {
    timestamps: true,
  }
);

const Project = mongoose.model("Project", projectSchema);

module.exports = Project;
