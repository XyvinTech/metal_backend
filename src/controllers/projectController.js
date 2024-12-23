const Project = require("../models/projectModel");
const Mto = require("../models/mtoModel");
const responseHandler = require("../helpers/responseHandler");
const validations = require("../validations");
const fs = require("fs");

const xlsx = require("xlsx");
const Log = require("../models/logModel");

exports.createProject = async (req, res) => {
  try {
    if (req.user.superAdmin != true) {
      return responseHandler(
        res,
        403,
        `You are not authorized to create admin`
      );
    }
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
    const filter = {};
    console.log(req.user);
    if (req.user.superAdmin !== true) {
      filter._id = req.user.project;
    }
    const projects = await Project.find(filter);
    return responseHandler(
      res,
      200,
      "Projects retrieved successfully",
      projects
    );
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
    return responseHandler(res, 200, "Project updated successfully", project);
  } catch (error) {
    return responseHandler(res, 500, `Internal Server Error: ${error.message}`);
  }
};
