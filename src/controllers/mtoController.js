const Mto = require("../models/mtoModel");
const responseHandler = require("../helpers/responseHandler");
const validations = require("../validations");
const { Parser } = require('json2csv');
const fs = require('fs');
const Log = require("../models/logModel");


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
    const mto = await Mto.find({project:req.params.id});
    if (!mto) {
      return responseHandler(res, 404, "MTO entry not found");
    }
    return responseHandler(res, 200, "MTO entry retrieved successfully", mto);
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
    })

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

    const fields = ["unit", "lineNo", "lineLocation", "areaLineSheetIdent", "area", "line", "sheet", "identCode", "uom", "size", "sizeTwo", "specCode", "shortCode", "cat", "shortDesc", "mtoRev", "sf", "scopeQty", "issuedQtyAss", "issuedDate", "balToIssue", "consumedQty", "balanceStock"]; 
    const json2csvParser = new Parser({ fields });
    const csv = json2csvParser.parse(mtos);

    const downloadsDir = './downloads';
    if (!fs.existsSync(downloadsDir)) {
      fs.mkdirSync(downloadsDir);
    }

    const filePath = `${downloadsDir}/mto_data_${Date.now()}.csv`;
    fs.writeFileSync(filePath, csv);

    res.download(filePath, 'mto_data.csv', (err) => {
      if (err) {
        return responseHandler(res, 500, `File Download Error: ${err.message}`);
      }

      fs.unlinkSync(filePath);
    });
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
