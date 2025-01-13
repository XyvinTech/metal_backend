const Project = require("../models/projectModel");
const responseHandler = require("../helpers/responseHandler");
const validations = require("../validations");
const { generateUniqueDigit } = require("../utils/generateUniqueDigit");
const { dynamicCollection } = require("../helpers/dynamicCollection");
const { processExcelFile } = require("../helpers/excelHelper");

exports.createProject = async (req, res) => {
  try {
    const { error } = validations.createProjectSchema.validate(req.body, {
      abortEarly: true,
    });

    if (error) {
      return responseHandler(res, 400, `Invalid input: ${error.message}`);
    }

    if (!req.file) {
      return responseHandler(res, 400, "No file uploaded");
    }

    req.body.createdBy = req.userId;

    const filePath = req.file.path;
    const projectId = await generateUniqueDigit(6);

    req.body.collectionName = `mto_${projectId}`;

    const { headers, collectionName } = await processExcelFile(filePath, projectId);

    req.body.headers = headers;

    const newProject = await Project.create(req.body);

    return responseHandler(
      res,
      201,
      "Project created successfully",
      newProject
    );
  } catch (error) {
    return responseHandler(res, 500, `Internal Server Error: ${error.message}`);
  }
};

exports.getProjects = async (req, res) => {
  try {
    const filter = {};
    const { search } = req.query;

    if (search) {
      filter.$or = [
        { project: { $regex: search, $options: "i" } },
        { code: { $regex: search, $options: "i" } },
        { owner: { $regex: search, $options: "i" } },
      ]; 
    }

    if (req.user.superAdmin !== true) {
      filter._id = { $in: req.user.project };
    }
    const totalCount = await Project.countDocuments(filter);
    const projects = await Project.find(filter);

    return responseHandler(
      res,
      200,
      "Projects retrieved successfully",
      projects,
      totalCount
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

exports.deleteProject = async (req, res) => {
  try {
    const project = await Project.findByIdAndDelete(req.params.id);

    if (project) {
      const MtoDynamic = await dynamicCollection(project.collectionName);
      await MtoDynamic.deleteMany({ project: project._id });
    }

    if (!project) {
      return responseHandler(res, 404, "Project not found");
    }
    return responseHandler(res, 200, "Project deleted successfully");
  } catch (error) {
    return responseHandler(res, 500, `Internal Server Error: ${error.message}`);
  }
};
