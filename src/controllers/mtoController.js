const responseHandler = require("../helpers/responseHandler");
const path = require("path");
const fs = require("fs");
const Log = require("../models/logModel");
const Alert = require("../models/alertModel");
const Project = require("../models/projectModel");
const xlsx = require("xlsx");
const { snakeCase } = require("lodash");
const { dynamicCollection } = require("../helpers/dynamicCollection");
const moment = require("moment-timezone");
const Admin = require("../models/adminModel");
const { Transform } = require("stream");
const zlib = require('zlib');


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
      host: req.headers["x-forwarded-for"] || req.connection.remoteAddress,
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
    if (!project) {
      return responseHandler(res, 404, "Project not found");
    }

    const MtoDynamic = await dynamicCollection(project.collectionName);

    const totalCount = await MtoDynamic.countDocuments();
    if (totalCount === 0) {
      return responseHandler(res, 404, "No MTO data found");
    }

    const fields = project.headers.map((header) => snakeCase(header));

    const folderPath = path.join(__dirname, "../excel_report");
    if (!fs.existsSync(folderPath)) {
      fs.mkdirSync(folderPath, { recursive: true });
    }
    const fileName = `${project.project}_mto_data_${Date.now()}.csv.gz`;
    const filePath = path.join(folderPath, fileName);

    const gzip = zlib.createGzip({ level: 6, memLevel: 8 });

    const transformStream = new Transform({
      objectMode: true,
      transform(doc, encoding, callback) {
        const row = fields.map((field) => {
          const value = doc[field];
          return value !== undefined && value !== null ? `"${value}"` : "";
        });
        callback(null, row.join(",") + "\n");
      }
    });

    let processedCount = 0;
    const progressInterval = setInterval(() => {
      console.log(`Processed ${processedCount}/${totalCount} records`);
    }, 5000);

    const cursor = MtoDynamic.find().lean().cursor({ batchSize: 1000 });

    const writeStream = fs.createWriteStream(filePath);

    cursor.on("data", (doc) => {
      processedCount++;
      transformStream.write(doc);
    });

    cursor.on("end", () => {
      transformStream.end();
      clearInterval(progressInterval);
      console.log("Processing completed");
    });

    cursor.on("error", (error) => {
      console.error("Stream error:", error);
      transformStream.destroy();
      gzip.destroy();
      writeStream.destroy();
      return responseHandler(res, 500, `Internal Server Error: ${error.message}`);
    });

    transformStream
      .pipe(gzip)
      .pipe(writeStream)
      .on("finish", () => {
        clearInterval(progressInterval);
        console.log("File saved successfully");

        const fileUrl = `${req.protocol}://${req.get("host")}/images/${fileName}`;

        setTimeout(() => {
          fs.unlink(filePath, (err) => {
            if (err) console.error("Error deleting file:", err);
            else console.log("File deleted:", filePath);
          });
        }, 60 * 60 * 1000);

        return responseHandler(res, 200, "File created successfully", { fileUrl });
      })
      .on("error", (error) => {
        console.error("File write error:", error);
        return responseHandler(res, 500, `Internal Server Error: ${error.message}`);
      });
  } catch (error) {
    console.error("Error downloading MTO data:", error.message);
    return responseHandler(res, 500, `Internal Server Error: ${error.message}`);
  }
};



exports.getSummery = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { page = 1, limit = 10, download = false } = req.query;

    const skipCount = (page - 1) * limit;

    let { selectedHeaders = [] } = req.query;

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

    if (selectedHeaders.length === 0) {
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
      .skip(skipCount)
      .limit(limit)
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
        "No MTO entries found for the selected headers.",
        responsePayload
      );
    }

    if (download === "true") {
      res.header("Content-Type", "text/csv");
      res.attachment(`${project.project}_mto_data.csv`);
      res.write(selectedHeadersSnakeCase.join(",") + "\n");

      const BATCH_SIZE = 10000;
      let processedCount = 0;

      while (processedCount < totalCount) {
        const batch = await MtoDynamic.find({}, projection)
          .skip(processedCount)
          .limit(BATCH_SIZE)
          .lean();

        batch.forEach((doc) => {
          const row = selectedHeadersSnakeCase.map((field) => {
            const value = doc[field];
            return value !== undefined && value !== null ? `"${value}"` : "";
          });
          res.write(row.join(",") + "\n");
        });

        processedCount += batch.length;
        console.log(`Processed ${processedCount}/${totalCount} records`);
      }

      return res.end();
    }

    return responseHandler(
      res,
      200,
      "Headers and MTO data retrieved successfully.",
      responsePayload
    );
  } catch (error) {
    console.error("Error fetching summary:", error.message);
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
          host: req.headers["x-forwarded-for"] || req.connection.remoteAddress,
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

exports.downloadSummery = async (req, res) => {
  try {
    const { projectId } = req.params;
    let { selectedHeaders = [] } = req.query;

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

    if (selectedHeaders.length === 0) {
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

    const mtoData = await MtoDynamic.find({}, projection).lean();

    if (!selectedHeadersSnakeCase.length) {
      return responseHandler(
        res,
        200,
        "Headers retrieved successfully. Please select headers to fetch data."
      );
    }

    if (!mtoData || mtoData.length === 0) {
      return responseHandler(
        res,
        404,
        "No MTO entries found for the selected headers."
      );
    }

    res.header("Content-Type", "text/csv");
    res.attachment(`${project.project}_mto_data.csv`);

    res.write(selectedHeadersSnakeCase.join(",") + "\n");

    mtoData.forEach((doc) => {
      const row = selectedHeadersSnakeCase.map((field) => {
        const value = doc[field];
        return value !== undefined && value !== null ? `"${value}"` : "";
      });
      res.write(row.join(",") + "\n");
    });

    return res.end();
  } catch (error) {
    console.error("Error downloading summary:", error.message);
    return responseHandler(res, 500, `Internal Server Error: ${error.message}`);
  }
};
