const mongoose = require("mongoose");
const Project = require("../models/projectModel");
const responseHandler = require("../helpers/responseHandler");
const validations = require("../validations");
const fs = require("fs");
const xlsx = require("xlsx");
const ExcelJS = require('exceljs');
const { snakeCase } = require("lodash");
const { generateUniqueDigit } = require("../utils/generateUniqueDigit");
const { dynamicCollection } = require("../helpers/dynamicCollection");

exports.createProject = async (req, res) => {
  try {
    console.log("Processing Excel file...");

    // Ensure file is uploaded
    if (!req.file) {
      return responseHandler(res, 400, "No file uploaded");
    }

    const filePath = req.file.path;
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(filePath);
    const sheet = workbook.worksheets[0];

    if (sheet.rowCount === 0) {
      fs.unlinkSync(filePath);
      return responseHandler(res, 400, "Excel file is empty");
    }

    // Extract headers from the first row
    const headers = sheet.getRow(1).values.slice(1); // Assuming first row contains headers
    req.body.headers = headers.map((header) => snakeCase(header));

    // Generate a unique collection name for the project
    const mtoCollectionName = await generateUniqueDigit(6);
    req.body.collectionName = `mto_${mtoCollectionName}`;

    // Create a new project in the database
    const newProject = await Project.create(req.body);
    console.log("Project created, starting data insertion...");

    // Define MTO schema dynamically based on headers
    const mtoSchemaDefinition = {};
    headers.forEach((header) => {
      const fieldName = snakeCase(header);
      mtoSchemaDefinition[fieldName] = { type: String }; // Default to string
    });
    mtoSchemaDefinition.project = {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true,
    };

    const MtoDynamic = mongoose.model(`mto_${mtoCollectionName}`, new mongoose.Schema(mtoSchemaDefinition, { timestamps: true }));

    // Insert rows in batches
    const batchSize = 1000;
    let batch = [];

    sheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
      if (rowNumber === 1) return; // Skip header row

      const rowData = { project: newProject._id };
      headers.forEach((header, index) => {
        const fieldName = snakeCase(header);
        rowData[fieldName] = row.getCell(index + 1).value || null;
      });

      batch.push(rowData);

      if (batch.length === batchSize) {
        MtoDynamic.insertMany(batch)
          .then(() => console.log(`Inserted ${batchSize} rows`))
          .catch((err) => console.error("Batch insert error:", err));
        batch = []; // Clear batch after insertion
      }
    });

    // Insert remaining rows if any
    if (batch.length > 0) {
      await MtoDynamic.insertMany(batch);
      console.log(`Inserted remaining ${batch.length} rows`);
    }

    console.log("Data inserted successfully");
    return responseHandler(res, 201, "Project created successfully", newProject);
  } catch (error) {
    console.error("Error:", error);
    return responseHandler(res, 500, `Internal Server Error: ${error.message}`);
  } finally {
    if (req.file && req.file.path) {
      fs.unlinkSync(req.file.path); // Clean up uploaded file
    }
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
