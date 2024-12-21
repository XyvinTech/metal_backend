const Project = require("../models/projectModel");
const Mto = require("../models/mtoModel");
const responseHandler = require("../helpers/responseHandler");
const validations = require("../validations");
const fs = require("fs");

const xlsx = require("xlsx");
const Log = require("../models/logModel");

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


exports.uploadExcelFile = async (req, res) => {
  try {
    if (!req.file) {
      return responseHandler(res, 400, "No file uploaded");
    }

    const { project } = req.body;

    if (!project) {
      fs.unlinkSync(req.file.path);
      return responseHandler(res, 400, "Project ID is required");
    }

    const filePath = req.file.path;
    const workbook = xlsx.readFile(filePath, { cellDates: true });
    const sheetName = workbook.SheetNames[0];

    let data = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName], {
      header: [
        "unit",
        "lineNo",
        "lineLocation",
        "areaLineSheetIdent",
        "area",
        "line",
        "sheet",
        "identCode",
        "uom",
        "size",
        "sizeTwo",
        "specCode",
        "shortCode",
        "cat",
        "shortDesc",
        "mtoRev",
        "sf",
        "scopeQty",
        "issuedQtyAss",
        "issuedDate",
        "balToIssue",
        "consumedQty",
        "balanceStock",
      ],
      defval: "",
    });

    if (data.length <= 2) {
      fs.unlinkSync(filePath);
      return responseHandler(res, 400, "Uploaded file is empty or has insufficient data");
    }

    data = data.slice(2).map((record) => ({
      ...record,
      project,
      sheet: Number(record.sheet) || 0,
      size: Number(record.size) || 0,
      sizeTwo: Number(record.sizeTwo) || 0,
      scopeQty: Number(record.scopeQty) || 0,
      issuedQtyAss: Number(record.issuedQtyAss) || 0,
      issuedDate: record.issuedDate,
      balToIssue: Number(record.balToIssue) || 0,
      consumedQty: Number(record.consumedQty) || 0,
      balanceStock: Number(record.balanceStock) || 0,
    }));

    // Fetch existing records by areaLineSheetIdent
    const existingRecords = await Mto.find({
      areaLineSheetIdent: { $in: data.map((d) => d.areaLineSheetIdent) },
      project,
    });

    // Prepare records for insertion and logging
    const logs = [];
    const recordsToInsert = [];

    for (const newRecord of data) {
      const oldRecord = existingRecords.find(
        (existing) => existing.areaLineSheetIdent === newRecord.areaLineSheetIdent
      );

      if (oldRecord) {
        // Log changes for updated records
        logs.push({
          admin: req.userId,
          description: "Bulk update",
          oldIssuedQtyAss: oldRecord.issuedQtyAss,
          oldIssuedDate: oldRecord.issuedDate,
          oldConsumedQty: oldRecord.consumedQty,
          newIssuedQtyAss: newRecord.issuedQtyAss,
          newIssuedDate: newRecord.issuedDate,
          newConsumedQty: newRecord.consumedQty,
          project: oldRecord.project,
          areaLineSheetIdent: oldRecord.areaLineSheetIdent,
          host: req.headers.host,
          agent: req.headers["user-agent"],
        });

        // Update existing record in database
        await Mto.findByIdAndUpdate(oldRecord._id, newRecord);
      } else {
        // New record to insert
        recordsToInsert.push(newRecord);
      }
    }

    // Insert new records
    if (recordsToInsert.length > 0) {
      await Mto.insertMany(recordsToInsert);
    }

    // Log the changes
    if (logs.length > 0) {
      await Log.insertMany(logs);
    }

    fs.unlinkSync(filePath);

    return responseHandler(
      res,
      201,
      "Excel file uploaded and data saved/updated successfully",
      { updated: logs.length, inserted: recordsToInsert.length }
    );
  } catch (error) {
    if (fs.existsSync(req.file?.path)) {
      fs.unlinkSync(req.file.path);
    }
    return responseHandler(res, 500, `Internal Server Error: ${error.message}`);
  }
};
