const mongoose = require("mongoose");
const Project = require("../models/projectModel");
const responseHandler = require("../helpers/responseHandler");
const validations = require("../validations");
const fs = require("fs");
const xlsx = require("xlsx");
const { snakeCase } = require("lodash");
const { generateUniqueDigit } = require("../utils/generateUniqueDigit");
const { dynamicCollection } = require("../helpers/dynamicCollection");

exports.createProject = async (req, res) => {
  try {
    console.log("I am in line number 13");
    
    const { error } = validations.createProjectSchema.validate(req.body, {
      abortEarly: true,
    });

    if (error) {
      return responseHandler(res, 400, `Invalid input: ${error.message}`);
    }

    if (!req.file) {
      return responseHandler(res, 400, "No file uploaded");
    }

    console.log("I am in line number 27");
    
    req.body.createdBy = req.userId;

    console.log("I am in line number 31");
    const filePath = req.file.path;
    console.log("I am in line number 33");
    const workbook = xlsx.readFile(filePath, { cellDates: true });
    const sheetName = workbook.SheetNames[0];

    console.log("I am in line number 37");
    const dataRows = xlsx.utils
      .sheet_to_json(workbook.Sheets[sheetName], {
        header: 1,
      })
      .slice(1);
      console.log("I am in line number 43");
    const rawHeaders = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName], {
      header: 1,
    })[0];

    if (!rawHeaders || rawHeaders.length === 0) {
      fs.unlinkSync(filePath);
      return responseHandler(res, 400, "Excel file has no headers");
    }
    console.log("I am in line number 52");
    req.body.headers = rawHeaders;
    req.body.pk = snakeCase(req.body.pk);
    req.body.issuedQty = snakeCase(req.body.issuedQty);
    req.body.consumedQty = snakeCase(req.body.consumedQty);
    req.body.reqQty = snakeCase(req.body.reqQty);
    req.body.balanceQty = snakeCase(req.body.balanceQty);
    req.body.balanceToIssue = snakeCase(req.body.balanceToIssue);
    req.body.dateName = snakeCase(req.body.dateName);

    const mtoCollectionName = await generateUniqueDigit(6);
    req.body.collectionName = `mto_${mtoCollectionName}`;
    console.log("I am in line number 63");
    
    const newProject = await Project.create(req.body);

    console.log("I am in line number 67");
    if (newProject && newProject.headers) {
      const mtoSchemaDefinition = {};

      newProject.headers.forEach((header) => {
        const fieldName = snakeCase(header);
        if (header.toLowerCase().includes("date")) {
          mtoSchemaDefinition[fieldName] = { type: Date };
        } else if (!isNaN(Number(header))) {
          mtoSchemaDefinition[fieldName] = { type: Number };
        }
        mtoSchemaDefinition[fieldName] = { type: String };
      });
      console.log("I am in line number 81");
      mtoSchemaDefinition.project = {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Project",
        required: true,
      };
      console.log("I am in line number 87");
      const mtoSchema = new mongoose.Schema(mtoSchemaDefinition, {
        timestamps: true,
      });
      const MtoDynamic = mongoose.model(`mto_${mtoCollectionName}`, mtoSchema);
      console.log("I am in line number 92");
      const dataToInsert = dataRows.map((row) => {
        const rowData = { project: newProject._id };

        newProject.headers.forEach((header, index) => {
          const fieldName = snakeCase(header);
          let value = row[index];

          if (mtoSchemaDefinition[fieldName].type === Date && value) {
            value = new Date(value);
            if (isNaN(value.getTime())) {
              value = null;
            }
          }

          rowData[fieldName] = value;
        });

        return rowData;
      });
      console.log("I am in line number 112");
      await MtoDynamic.insertMany(dataToInsert);
    }
    console.log("I am in line number 115");
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
