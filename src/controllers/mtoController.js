const Mto = require("../models/mtoModel");
const responseHandler = require("../helpers/responseHandler");
const validations = require("../validations");
const { Parser } = require("json2csv");
const fs = require("fs");
const Log = require("../models/logModel");
const Alert = require("../models/alertModel");
exports.createMto = async (req, res) => {
  try {
    const { error } = validations.createMtoSchema.validate(req.body, {
      abortEarly: true,
    });
    if (error) {
      return responseHandler(res, 400, `Invalid input: ${error.message}`);
    }
    req.body.createdBy = req.userId;
    const newMto = await Mto.create(req.body);
    if (newMto) {
      return responseHandler(
        res,
        201,
        "MTO entry created successfully",
        newMto
      );
    }
  } catch (error) {
    return responseHandler(res, 500, `Internal Server Error: ${error.message}`);
  }
};

exports.getMtos = async (req, res) => {
  try {
    const mtos = await Mto.find();
    return responseHandler(
      res,
      200,
      "MTO entries retrieved successfully",
      mtos
    );
  } catch (error) {
    return responseHandler(res, 500, `Internal Server Error: ${error.message}`);
  }
};
exports.getMtoById = async (req, res) => {
  try {
    const { page = 1, limit = 10, ...queryFilters } = req.query;

    const skipCount = 10 * (page - 1);
    const filter = { project: req.params.id };

    Object.keys(queryFilters).forEach((key) => {
      if (queryFilters[key] && key !== "pageNo" && key !== "limit") {
        const isNumberField = [
          "sheet",
          "size",
          "sizeTwo",
          "scopeQty",
          "issuedQtyAss",
          "balToIssue",
          "consumedQty",
          "balanceStock",
        ].includes(key);

        if (isNumberField) {
          filter[key] = Number(queryFilters[key]);
        } else {
          filter[key] = { $regex: queryFilters[key], $options: "i" };
        }
      }
    });

    const sort = { createdAt: -1, _id: 1 };

    const mto = await Mto.find(filter)
      .skip(skipCount)
      .limit(limit)
      .sort(sort)
      .populate("project", "project")
      .lean();

    const totalCount = await Mto.countDocuments(filter);

    if (!mto || mto.length === 0) {
      return responseHandler(res, 404, "MTO entry not found");
    }

    const projectName = mto[0].project?.project || "";

    return responseHandler(res, 200, "MTO entry retrieved successfully", {
      mto,
      totalCount,
      projectName,
    });
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

    const findMto = await Mto.findById(req.params.id);
    if (!findMto) {
      return responseHandler(res, 404, "MTO entry not found");
    }
    await Log.create({
      admin: req.userId,
      description: "Single update",
      oldIssuedQtyAss: findMto.issuedQtyAss,
      oldIssuedDate: findMto.issuedDate,
      oldConsumedQty: findMto.consumedQty,
      newIssuedQtyAss: req.body.issuedQtyAss,
      newIssuedDate: req.body.issuedDate,
      newConsumedQty: req.body.consumedQty,
      project: findMto.project,
      areaLineSheetIdent: findMto.areaLineSheetIdent,
      host: req.headers.host,
      agent: req.headers["user-agent"],
    });

    if (findMto.issuedQtyAss < req.body.consumedQty) {
      await Alert.create({
        project: findMto.project,
        mto: findMto._id,
        areaLineSheetIdent: findMto.areaLineSheetIdent,
        issuedQtyAss: findMto.issuedQtyAss,
        consumedQty: req.body.consumedQty,
      });
    }

    const mto = await Mto.findByIdAndUpdate(req.params.id, req.body, {
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

exports.deleteMto = async (req, res) => {
  try {
    const mto = await Mto.findByIdAndDelete(req.params.id);
    if (!mto) {
      return responseHandler(res, 404, "MTO entry not found");
    }
    return responseHandler(res, 200, "MTO entry deleted successfully");
  } catch (error) {
    return responseHandler(res, 500, `Internal Server Error: ${error.message}`);
  }
};

exports.downloadMtoCsv = async (req, res) => {
  try {
    const mtos = await Mto.find();

    if (!mtos || mtos.length === 0) {
      return responseHandler(res, 404, "No MTO data found");
    }

    const fields = [
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
    ];
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
        return responseHandler(res, 500, `File Download Error: ${err.message}`);
      }

      fs.unlinkSync(filePath);
    });
  } catch (error) {
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

exports.bulkUpload = async (req, res) => {
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
      return responseHandler(
        res,
        400,
        "Uploaded file is empty or has insufficient data"
      );
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

   
    for (const record of data) {
      const findMto = await Mto.findOne({
        areaLineSheetIdent: record.areaLineSheetIdent,
        project,
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
      project,
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