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
const moment = require("moment-timezone");
const Admin = require("../models/adminModel");

exports.getMtoById = async (req, res) => {
  try {
    const {
      pageNo = 1,
      limit = 10,
      sortFields = "createdAt",
      sortOrder = "asc",
      ...queryFilters
    } = req.query;

    const project = await Project.findById(req.params.id);
    if (!project) {
      return responseHandler(res, 404, "Project not found");
    }

    const skipCount = limit * (pageNo - 1);
    const MtoDynamic = await dynamicCollection(project.collectionName);

    const sortObject = {};
    const sortDirection = sortOrder.toLowerCase() === "desc" ? -1 : 1;
    sortFields.split(",").forEach((field) => {
      sortObject[field.trim()] = sortDirection;
    });

    const filter = { project: project._id };

    Object.keys(queryFilters).forEach((key) => {
      if (
        queryFilters[key] &&
        !["pageNo", "limit", "sortFields", "sortOrder"].includes(key)
      ) {
        filter[key] = { $regex: queryFilters[key], $options: "i" };
      }
    });

    let mto = await MtoDynamic.find(filter)
      .skip(skipCount)
      .limit(Number(limit))
      .sort(sortObject)
      .lean();

    const totalCount = await MtoDynamic.countDocuments(filter);

    if (!mto || mto.length === 0) {
      return responseHandler(res, 404, "MTO entries not found");
    }

    mto = mto.map((entry) => {
      if (entry[project.dateName]) {
        entry[project.dateName] = moment
          .tz(entry[project.dateName], "Asia/Kolkata")
          .format("YYYY-MM-DD HH:mm:ss");
      }
      return entry;
    });

    const headers = project.headers.map((header) => snakeCase(header));
    let editableHeaders = [
      project.issuedQty,
      project.consumedQty,
      project.dateName,
    ];

    if (req.user.superAdmin) {
      editableHeaders = [
        project.issuedQty,
        project.consumedQty,
        project.reqQty,
        project.dateName,
      ];
    }

    const balanceQty = project.balanceQty;
    const balanceToIssue = project.balanceToIssue;
    const data = {
      headers,
      data: mto,
      project: project.project,
      editableHeaders,
      balanceQty,
      balanceToIssue,
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
    const project = await Project.findById(req.query.project);
    if (!project) {
      return responseHandler(res, 404, "Project not found");
    }

    const MtoDynamic = await dynamicCollection(project.collectionName);
    const findMto = await MtoDynamic.findById(req.params.id);
    if (!findMto) {
      return responseHandler(res, 404, "MTO entry not found");
    }

    const requiredQty = Number(findMto[project.reqQty]) || 0;
    const issuedQty = Number(req.body[project.issuedQty]) || 0;
    const consumedQty = Number(req.body[project.consumedQty]) || 0;

    const balanceToIssueQty = requiredQty - issuedQty;
    const balanceQty = issuedQty - consumedQty;

    if (balanceQty < 0 || balanceToIssueQty < 0) {
      await Alert.create({
        project: findMto.project,
        pk: findMto[project.pk],
        mto: findMto._id,
        issuedQty: issuedQty,
        consumedQty: consumedQty,
        balanceQty: balanceQty,
        issuedDate: req.body[project.dateName],
      });
    }

    const updatedData = {
      [project.consumedQty]: consumedQty,
      [project.issuedQty]: issuedQty,
      [project.balanceQty]: balanceQty,
      [project.balanceToIssue]: balanceToIssueQty,
      [project.dateName]: req.body[project.dateName],
    };

    if (req.user.superAdmin) {
      updatedData[project.reqQty] =
        Number(req.body[project.reqQty]) || requiredQty;
    }

    const oldPayload = {
      [project.consumedQty]: findMto[project.consumedQty],
      [project.issuedQty]: findMto[project.issuedQty],
      [project.balanceQty]: findMto[project.balanceQty],
      [project.dateName]: findMto[project.dateName],
    };

    await Log.create({
      admin: req.userId,
      description: "Single update",
      project: findMto.project,
      oldPayload,
      newPayload: updatedData,
      host: req.headers['x-forwarded-for'] || req.connection.remoteAddress,
      agent: req.headers["user-agent"],
    });

    const mto = await MtoDynamic.findByIdAndUpdate(req.params.id, updatedData, {
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

      fs.unlinkSync(filePath);
    });
  } catch (error) {
    console.error("Internal Server Error:", error.message);
    return responseHandler(res, 500, `Internal Server Error: ${error.message}`);
  }
};

exports.getSummery = async (req, res) => {
  try {
    const { projectId } = req.params;
    let { selectedHeaders = [], download } = req.query;

    if (!projectId) {
      return responseHandler(res, 400, "Project ID is required");
    }

    const project = await Project.findById(projectId);

    if (!project) {
      return responseHandler(res, 404, "Project not found");
    }

    let headers = project.headers;
    headers = headers.map((header) => snakeCase(header));

    if (!headers || headers.length === 0) {
      return responseHandler(res, 404, "No headers found for the project");
    }

    if (selectedHeaders.length == 0) {
      selectedHeaders = project.selectedHeaders;
    }

    const selectedHeadersArray = Array.isArray(selectedHeaders)
      ? selectedHeaders
      : selectedHeaders.split(",");

    const selectedHeadersSnakeCase = selectedHeadersArray.map(snakeCase);

    const invalidHeaders = selectedHeadersSnakeCase.filter(
      (header) => header && !headers.includes(header)
    );

    if (invalidHeaders.length > 0) {
      return responseHandler(
        res,
        400,
        `Invalid headers selected: ${invalidHeaders.join(", ")}`
      );
    }

    if (selectedHeadersSnakeCase.length > 0) {
      project.selectedHeaders = selectedHeadersSnakeCase;
      await project.save();
    }

    const MtoDynamic = await dynamicCollection(project.collectionName);

    const projection = selectedHeadersSnakeCase.reduce((acc, header) => {
      acc[header] = 1;
      return acc;
    }, {});

    const mtoData = await MtoDynamic.find({}, projection)
      .sort({ createdAt: -1, _id: 1 })
      .lean();

    const totalCount = await MtoDynamic.countDocuments();

    const responsePayload = {
      headers,
      selectedHeaders: project.selectedHeaders,
      mtoData: selectedHeadersSnakeCase.length ? mtoData : [],
      projectName: project.project,
      totalCount: selectedHeadersSnakeCase.length ? totalCount : 0,
    };

    if (!selectedHeadersSnakeCase.length) {
      return responseHandler(
        res,
        200,
        "Headers retrieved successfully. Please select headers to fetch data.",
        responsePayload
      );
    }

    if (!mtoData || mtoData.length === 0) {
      return responseHandler(
        res,
        404,
        "No MTO entries found for the selected headers",
        responsePayload
      );
    }

    if (download === "true") {
      const json2csvParser = new Parser();
      const csv = json2csvParser.parse(mtoData);

      res.header("Content-Type", "text/csv");
      res.attachment(`${project.project}_mto_data.csv`);
      return res.send(csv);
    }

    return responseHandler(
      res,
      200,
      "Headers and MTO data retrieved successfully",
      responsePayload
    );
  } catch (error) {
    console.error("Error fetching headers and MTO data:", error.message);
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

    data = data.slice(1).map((record) => ({
      ...record,
      project: project._id,
      [project.consumedQty]: Number(record[project.consumedQty]) || 0,
      [project.issuedQty]: Number(record[project.issuedQty]) || 0,
      [project.dateName]: record[project.dateName],
    }));

    const MtoDynamic = await dynamicCollection(project.collectionName);

    const existingRecords = await MtoDynamic.find({
      [project.pk]: { $in: data.map((d) => d[project.pk].toString()) },
      project: project._id,
    });

    const logs = [];
    const recordsToInsert = [];
    const alerts = [];

    for (const newRecord of data) {
      const oldRecord = existingRecords.find(
        (existing) =>
          existing[project.pk].toString() === newRecord[project.pk].toString()
      );

      if (oldRecord) {
        if (oldRecord[project.issuedQty] < newRecord[project.consumedQty]) {
          alerts.push({
            project: oldRecord.project,
            pk: oldRecord[project.pk],
            mto: oldRecord._id,
            [project.pk]: oldRecord[project.pk],
            [project.issuedQty]: oldRecord[project.issuedQty],
            [project.consumedQty]: newRecord[project.consumedQty],
            [project.dateName]: newRecord[project.dateName],
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
          host: req.headers['x-forwarded-for'] || req.connection.remoteAddress,
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
