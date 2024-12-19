const Project = require("../models/projectModel");
const responseHandler = require("../helpers/responseHandler");
const validations = require("../validations");

exports.createProject = async (req, res) => {
  try {
    const { error } = validations.createProjectSchema.validate(req.body, {
      abortEarly: true,
    });
    if (error) {
      return responseHandler(res, 400, `Invalid input: ${error.message}`);
    }
    req.body.createdBy = req.userId;
    const newProject = await Project.create(req.body);
    if (newProject) {
      return responseHandler(
        res,
        201,
        "Project created successfully",
        newProject
      );
    }
  } catch (error) {
    return responseHandler(res, 500, `Internal Server Error: ${error.message}`);
  }
};


exports.getProjects = async (req, res) => {
  try {
    const projects = await Project.find();
    return responseHandler(res, 200, "Projects retrieved successfully", projects);
  } catch (error) {
    return responseHandler(res, 500, `Internal Server Error: ${error.message}`);
  }
};


exports.getProjectById = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return responseHandler(res, 404, "Project not found");
    }
    return responseHandler(res, 200, "Project retrieved successfully", project);
  } catch (error) {
    return responseHandler(res, 500, `Internal Server Error: ${error.message}`);
  }
};


exports.updateProject = async (req, res) => {
  try {
    const { error } = validations.updateProjectSchema.validate(req.body, {
      abortEarly: true,
    });
    if (error) {
      return responseHandler(res, 400, `Invalid input: ${error.message}`);
    }

    const project = await Project.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!project) {
      return responseHandler(res, 404, "Project not found");
    }
    return responseHandler(
      res,
      200,
      "Project updated successfully",
      project
    );
  } catch (error) {
    return responseHandler(res, 500, `Internal Server Error: ${error.message}`);
  }
};

exports.deleteProject = async (req, res) => {
  try {
    const project = await Project.findByIdAndDelete(req.params.id);
    if (!project) {
      return responseHandler(res, 404, "Project not found");
    }
    return responseHandler(res, 200, "Project deleted successfully");
  } catch (error) {
    return responseHandler(res, 500, `Internal Server Error: ${error.message}`);
  }
};
