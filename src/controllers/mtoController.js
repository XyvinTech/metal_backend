const mongoose = require("mongoose");
const Mto = require("../models/mtoModel");
const responseHandler = require("../helpers/responseHandler");
const validations = require("../validations");
const { Parser } = require("json2csv");
const fs = require("fs");
const Log = require("../models/logModel");
const Alert = require("../models/alertModel");
const Project = require("../models/projectModel");
const xlsx = require("xlsx");
const { snakeCase } = require("lodash");
const { dynamicCollection } = require("../helpers/dynamicCollection");

exports.getMtoById = async (req, res) => {
  try {
    const { page = 1, limit = 10, ...queryFilters } = req.query;

    const project = await Project.findById(req.params.id);
    if (!project) {
      return responseHandler(res, 404, "Project not found");
    }

    const skipCount = limit * (page - 1);

    const MtoDynamic = await dynamicCollection(project.collectionName);

    const sort = { createdAt: -1, _id: 1 };
    const filter = { project: req.params.id };
    Object.keys(queryFilters).forEach((key) => {
      if (queryFilters[key] && key !== "pageNo" && key !== "limit") {
        filter[key] = { $regex: queryFilters[key], $options: "i" };
      }
    });

    const mto = await MtoDynamic.find(filter)
      .skip(skipCount)
      .limit(Number(limit))
      .sort(sort)
      .lean();

    const totalCount = await MtoDynamic.countDocuments(filter);

    if (!mto || mto.length === 0) {
      return responseHandler(res, 404, "MTO entries not found");
    }
    let headers = [];

    project.headers.forEach((header) => {
      headers.push(snakeCase(header));
    });

    const mappedData = mto.map((mtoItem) => {
      return {
        ...mtoItem,
        project: project.project,
      };
    });
    const data = {
      headers,
      data: mappedData,
    };
    return responseHandler(
      res,
      200,
      "MTO entries retrieved successfully",
      data,
      totalCount
    );
  } catch (error) {
    return responseHandler(res, 500, `Internal Server Error: ${error.message}`);
  }
};

exports.updateMto = async (req, res) => {
  try {
    const { error } = validations.updateMtoSchema.validate(req.body, {
      abortEarly: true,
    });
    if (error) {
      return responseHandler(res, 400, `Invalid input: ${error.message}`);
    }
    const project = await Project.findById(req.query.project);
    const MtoDynamic = await dynamicCollection(project.collectonName);
    const findMto = await MtoDynamic.findById(req.params.id);

    if (!findMto) {
      return responseHandler(res, 404, "MTO entry not found");
    }

    const qtyCheck = project.issuedQty;

    if (findMto[qtyCheck] < req.body.consumedQty) {
      await Alert.create({
        project: findMto.project,
        mto: findMto._id,
        issuedQty: findMto[qtyCheck],
        consumedQty: req.body.consumedQty,
      });
    }

    const data = {
      [project.consumedQty]: req.body.consumedQty,
      [project.issuedQty]: req.body.issuedQty,
      [project.dateName]: req.body.issuedDate,
    };

    const oldPayload = {
      [project.consumedQty]: findMto[project.consumedQty],
      [project.issuedQty]: findMto[project.issuedQty],
      [project.dateName]: findMto[project.dateName],
    };
    await Log.create({
      admin: req.userId,
      description: "Single update",
      project: findMto.project,
      oldPayload: oldPayload,
      newPayload: data,
      host: req.headers.host,
      agent: req.headers["user-agent"],
    });

    const mto = await MtoDynamic.findByIdAndUpdate(req.params.id, data, {
      new: true,
      runValidators: true,
    });

    if (!mto) {
      return responseHandler(res, 404, "MTO entry not found");
    }
    return responseHandler(res, 200, "MTO entry updated successfully", mto);
  } catch (error) {
    return responseHandler(res, 500, `Internal Server Error: ${error.message}`);
  }
};
exports.downloadMtoCsv = async (req, res) => {
  try {
    const { projectId } = req.params;

    if (!projectId) {
      return responseHandler(res, 400, "Project ID is required");
    }

    const project = await Project.findById(projectId);
    console.log(project);

    if (!project) {
      return responseHandler(res, 404, "Project not found");
    }

    const MtoDynamic = await dynamicCollection(project.collectionName);

    const mtos = await MtoDynamic.find();

    if (!mtos || mtos.length === 0) {
      return responseHandler(res, 404, "No MTO data found");
    }

    let fields = [];
    project.headers.forEach((header) => {
      fields.push(snakeCase(header));
    });

    const json2csvParser = new Parser({ fields });
    const csv = json2csvParser.parse(mtos);

    const downloadsDir = "./downloads";
    if (!fs.existsSync(downloadsDir)) {
      fs.mkdirSync(downloadsDir);
    }

    const filePath = `${downloadsDir}/mto_data_${Date.now()}.csv`;
    fs.writeFileSync(filePath, csv);

    res.download(filePath, "mto_data.csv", (err) => {
      if (err) {
        console.error("File Download Error:", err.message);
        return responseHandler(res, 500, `File Download Error: ${err.message}`);
      }

      fs.unlinkSync(filePath); // Delete the file after download
    });
  } catch (error) {
    console.error("Internal Server Error:", error.message);
    return responseHandler(res, 500, `Internal Server Error: ${error.message}`);
  }
};

exports.fetchSummaryByProjectId = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skipCount = 10 * (page - 1);

    const mto = await Mto.find({ project: req.params.id })
      .skip(skipCount)
      .limit(limit)
      .sort({ createdAt: -1, _id: 1 });
    const totalCount = await Mto.countDocuments({ project: req.params.id });

    if (!mto || mto.length === 0) {
      return responseHandler(res, 404, "MTO entry not found");
    }

    const summary = mto.map((mtoItem) => ({
      identCode: mtoItem.identCode,
      uom: mtoItem.uom,
      size: mtoItem.size,
      sizeTwo: mtoItem.sizeTwo,
      cat: mtoItem.cat,
      shortDesc: mtoItem.shortDesc,
      scopeQty: mtoItem.scopeQty,
      issuedQtyAss: mtoItem.issuedQtyAss,
      issuedDate: mtoItem.issuedDate,
      consumedQty: mtoItem.consumedQty,
      balanceStock: mtoItem.balanceStock,
    }));

    return responseHandler(
      res,
      200,
      "MTO entry retrieved successfully",
      summary,
      totalCount
    );
  } catch (error) {
    return responseHandler(res, 500, `Internal Server Error: ${error.message}`);
  }
};

exports.downloadSummaryByProjectId = async (req, res) => {
  try {
    const mtos = await Mto.find({ project: req.params.id });

    if (!mtos || mtos.length === 0) {
      return responseHandler(res, 404, "No MTO data found for this project");
    }

    const fields = [
      "identCode",
      "uom",
      "size",
      "sizeTwo",
      "cat",
      "shortDesc",
      "scopeQty",
      "issuedQtyAss",
      "issuedDate",
      "consumedQty",
      "balanceStock",
    ];
    const json2csvParser = new Parser({ fields });
    const csv = json2csvParser.parse(mtos);

    const downloadsDir = "./downloads";
    if (!fs.existsSync(downloadsDir)) {
      fs.mkdirSync(downloadsDir, { recursive: true });
    }

    const filePath = `${downloadsDir}/mto_data_${Date.now()}.csv`;
    fs.writeFileSync(filePath, csv);

    res.download(filePath, "mto_data.csv", (err) => {
      if (err) {
        console.error(`File Download Error: ${err.message}`);
        return responseHandler(res, 500, `File Download Error: ${err.message}`);
      }

      fs.unlink(filePath, (unlinkErr) => {
        if (unlinkErr) {
          console.error(`File Deletion Error: ${unlinkErr.message}`);
        }
      });
    });
  } catch (error) {
    console.error(`Internal Server Error: ${error.message}`);
    return responseHandler(res, 500, `Internal Server Error: ${error.message}`);
  }
};

exports.bulkUpdate = async (req, res) => {
  try {
    if (!req.file) {
      return responseHandler(res, 400, "No file uploaded");
    }

    let { project } = req.body;
    if (!project) {
      fs.unlinkSync(req.file.path);
      return responseHandler(res, 400, "Project ID is required");
    }

    const filePath = req.file.path;
    const workbook = xlsx.readFile(filePath, { cellDates: true });
    const sheetName = workbook.SheetNames[0];
    const myProject = await Project.findById(project);
    project = myProject;

    if (!project) {
      fs.unlinkSync(filePath);
      return responseHandler(res, 404, "Project not found");
    }

    const headerMapping = project.headers.map((header) => snakeCase(header));

    let data = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName], {
      header: headerMapping,
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
      project: project._id,
      [project.consumedQty]: Number(record[project.consumedQty]) || 0,
      [project.issuedQty]: Number(record[project.issuedQty]) || 0,
      [project.dateName]: record[project.dateName],
    }));

    const MtoDynamic = mongoose.model(
      project.collectonName,
      new mongoose.Schema({}, { strict: false })
    );

    const existingRecords = await MtoDynamic.find({
      [project.pk]: { $in: data.map((d) => d[project.pk]) },
      project: project._id,
    });

    const logs = [];
    const recordsToInsert = [];
    const alerts = [];

    for (const newRecord of data) {
      const oldRecord = existingRecords.find(
        (existing) => existing[project.pk] === newRecord[project.pk]
      );

      if (oldRecord) {
        if (oldRecord[project.issuedQty] < newRecord[project.consumedQty]) {
          alerts.push({
            project: oldRecord.project,
            mto: oldRecord._id,
            [project.pk]: oldRecord[project.pk],
            [project.issuedQty]: oldRecord[project.issuedQty],
            [project.consumedQty]: newRecord[project.consumedQty],
          });
        }

        logs.push({
          admin: req.userId,
          description: "Bulk update",
          project: oldRecord.project,
          oldPayload: {
            [project.consumedQty]: oldRecord[project.consumedQty],
            [project.issuedQty]: oldRecord[project.issuedQty],
            [project.dateName]: oldRecord[project.dateName],
          },
          newPayload: {
            [project.consumedQty]: newRecord[project.consumedQty],
            [project.issuedQty]: newRecord[project.issuedQty],
            [project.dateName]: newRecord[project.dateName],
          },
          host: req.headers.host,
          agent: req.headers["user-agent"],
        });

        await MtoDynamic.findByIdAndUpdate(oldRecord._id, newRecord);
      } else {
        recordsToInsert.push(newRecord);
      }
    }

    if (recordsToInsert.length > 0) {
      await MtoDynamic.insertMany(recordsToInsert);
    }

    if (logs.length > 0) {
      await Log.insertMany(logs);
    }

    if (alerts.length > 0) {
      await Alert.insertMany(alerts);
    }

    fs.unlinkSync(filePath);

    return responseHandler(
      res,
      201,
      "Excel file uploaded and data saved/updated successfully",
      {
        updated: logs.length,
        inserted: recordsToInsert.length,
      }
    );
  } catch (error) {
    if (fs.existsSync(req.file?.path)) {
      fs.unlinkSync(req.file.path);
    }
    return responseHandler(res, 500, `Internal Server Error: ${error.message}`);
  }
};
