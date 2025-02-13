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
      .sheet_to_json(workbook.Sheets[sheetName], { header: 1 })
      .slice(1)
      .filter((row) =>
        row.some(
          (cell) =>
            cell !== undefined && cell !== null && String(cell).trim() !== ""
        )
      );

    const rawHeaders = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName], {
      header: 1,
    })[0];

    if (!rawHeaders || rawHeaders.length === 0) {
      fs.unlinkSync(filePath);
      return responseHandler(res, 400, "Excel file has no headers");
    }

    req.body.headers = rawHeaders;
    req.body.pk = snakeCase(req.body.pk);
    req.body.issuedQty = snakeCase(req.body.issuedQty);
    req.body.consumedQty = snakeCase(req.body.consumedQty);
    req.body.reqQty = snakeCase(req.body.reqQty);
    req.body.balanceQty = snakeCase(req.body.balanceQty);
    req.body.balanceToIssue = snakeCase(req.body.balanceToIssue);
    req.body.transOtherQty = snakeCase(req.body.transOtherQty);
    req.body.dateName = snakeCase(req.body.dateName);

    const mtoCollectionName = await generateUniqueDigit(6);
    req.body.collectionName = `mto_${mtoCollectionName}`;

    const newProject = await Project.create(req.body);

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

      mtoSchemaDefinition.project = {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Project",
        required: true,
      };

      const mtoSchema = new mongoose.Schema(mtoSchemaDefinition, {
        timestamps: true,
      });
      const MtoDynamic = mongoose.model(`mto_${mtoCollectionName}`, mtoSchema);

      const BATCH_SIZE = 10000;
      let processedRows = 0;

      while (processedRows < dataRows.length) {
        const currentBatch = dataRows.slice(
          processedRows,
          processedRows + BATCH_SIZE
        );
        // const currentBatch = dataRows
        //   .slice(processedRows, processedRows + BATCH_SIZE)
        //   .filter((row) => {
        //     return row.some(
        //       (cell) =>
        //         cell !== undefined &&
        //         cell !== null &&
        //         String(cell).trim() !== ""
        //     );
        //   });
        const dataToInsert = currentBatch.map((row) => {
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

        await MtoDynamic.insertMany(dataToInsert);
        console.log(`Inserted batch of ${dataToInsert.length} rows`);
        processedRows += BATCH_SIZE;
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
