const mongoose = require("mongoose");
const Project = require("../models/projectModel");
const Mto = require("../models/mtoModel");
const responseHandler = require("../helpers/responseHandler");
const validations = require("../validations");
const fs = require("fs");
const Log = require("../models/logModel");
const xlsx = require("xlsx");
const Alert = require("../models/alertModel");
const { snakeCase } = require("lodash");
const { generateUniqueDigit } = require("../utils/generateUniqueDigit");

exports.createProject = async (req, res) => {
  try {
    if (req.user.superAdmin != true) {
      return responseHandler(
        res,
        403,
        `You are not authorized to create Project`
      );
    }
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
    const newProject = await Project.create(req.body);
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
      return responseHandler(
        res,
        400,
        "Uploaded file is empty or has insufficient data"
      );
    }

    data = data.slice(2).map((record) => ({
      ...record,
      project: newProject._id,
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

    for (const record of data) {
      const findMto = await Mto.findOne({
        areaLineSheetIdent: record.areaLineSheetIdent,
        project: newProject._id,
      });

      if (findMto && findMto.issuedQtyAss < record.consumedQty) {
        await Alert.create({
          project: findMto.project,
          mto: findMto._id,
          areaLineSheetIdent: findMto.areaLineSheetIdent,
          issuedQtyAss: findMto.issuedQtyAss,
          consumedQty: record.consumedQty,
        });
      }
    }

    const existingRecords = await Mto.find({
      areaLineSheetIdent: { $in: data.map((d) => d.areaLineSheetIdent) },
      project: newProject._id,
    });

    const logs = [];
    const recordsToInsert = [];

    for (const newRecord of data) {
      const oldRecord = existingRecords.find(
        (existing) =>
          existing.areaLineSheetIdent === newRecord.areaLineSheetIdent
      );

      if (oldRecord) {
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

        await Mto.findByIdAndUpdate(oldRecord._id, newRecord);
      } else {
        recordsToInsert.push(newRecord);
      }
    }

    if (recordsToInsert.length > 0) {
      await Mto.insertMany(recordsToInsert);
    }

    if (logs.length > 0) {
      await Log.insertMany(logs);
    }

    fs.unlinkSync(filePath);

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

    if (req.user.superAdmin !== true) {
      filter._id = req.user.project;
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
    if (!project) {
      return responseHandler(res, 404, "Project not found");
    }
    return responseHandler(res, 200, "Project deleted successfully");
  } catch (error) {
    return responseHandler(res, 500, `Internal Server Error: ${error.message}`);
  }
};

exports.createProjectHead = async (req, res) => {
  try {
    if (req.user.superAdmin !== true) {
      return responseHandler(
        res,
        403,
        `You are not authorized to create Project`
      );
    }

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
    const workbook = xlsx.readFile(filePath, { cellDates: true });
    const sheetName = workbook.SheetNames[0];

    const dataRows = xlsx.utils
      .sheet_to_json(workbook.Sheets[sheetName], {
        header: 1,
      })
      .slice(1); // Skip the header row

    const rawHeaders = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName], {
      header: 1,
    })[0]; // Get the header row

    if (!rawHeaders || rawHeaders.length === 0) {
      fs.unlinkSync(filePath);
      return responseHandler(res, 400, "Excel file has no headers");
    }

    req.body.headers = rawHeaders;
    const pk = snakeCase(req.body.pk); 
    req.body.pk = pk; 
    const issuedQty = snakeCase(req.body.issuedQty); 
    req.body.issuedQty = issuedQty; 
    const consumedQty = snakeCase(req.body.consumedQty); 
    req.body.consumedQty = consumedQty; 
    const dateName = snakeCase(req.body.dateName); 
    req.body.dateName = dateName; 

    const mtoCollectionName = await generateUniqueDigit(6);
    req.body.collectonName = `mto_${mtoCollectionName}`; 


    // Create the project
    const newProject = await Project.create(req.body);

    if (newProject && newProject.headers) {
      const mtoSchemaDefinition = {};

      // We will only convert Date fields, others will remain as String
      newProject.headers.forEach((header) => {
        const fieldName = snakeCase(header); // Convert header to snake_case

        // Assume all fields are strings unless they are recognized as Date
        mtoSchemaDefinition[fieldName] = { type: String }; // Default type

        // Check if the header corresponds to a known date field
        if (header.toLowerCase().includes("date")) {
          mtoSchemaDefinition[fieldName] = { type: Date }; // Override type to Date if header includes "date"
        }
      });

      // Add a reference to the project
      mtoSchemaDefinition.project = {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Project",
        required: true,
      };

     

      // Create the schema and model
      const mtoSchema = new mongoose.Schema(mtoSchemaDefinition, {
        timestamps: true,
      });
      const MtoDynamic = mongoose.model(`mto_${mtoCollectionName}`, mtoSchema);

      console.log(`Dynamic MTO model created with name: ${mtoCollectionName}`);

      // Prepare data for insertion
      const dataToInsert = dataRows.map((row) => {
        const rowData = { project: newProject._id };

        newProject.headers.forEach((header, index) => {
          const fieldName = snakeCase(header);
          let value = row[index];

          // Convert the value to Date if it's a Date column
          if (mtoSchemaDefinition[fieldName].type === Date && value) {
            value = new Date(value);
            if (isNaN(value.getTime())) {
              value = null; // Invalid date
            }
          }

          rowData[fieldName] = value;
        });

        return rowData;
      });

      try {
        const insertedData = await MtoDynamic.insertMany(dataToInsert);
        console.log(
          `Inserted ${insertedData.length} rows into ${mtoCollectionName}`
        );
      } catch (insertError) {
        console.error("Error inserting data into dynamic model:", insertError);
        throw insertError;
      }
    }

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
