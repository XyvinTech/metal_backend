const mongoose = require("mongoose");

const projectTestSchema = mongoose.Schema(
  {
    project: { type: String },
    code: { type: String },
    description: { type: String },
    owner: { type: String },
    consultant: { type: String },
    headers: [{ type: String }],
  },
  {
    timestamps: true,
  }
);

const ProjectTest = mongoose.model("Projecttest", projectTestSchema);

module.exports = ProjectTest;
