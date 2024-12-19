const Mto = require("../models/mtoModel");
const responseHandler = require("../helpers/responseHandler");
const validations = require("../validations");
const { Parser } = require('json2csv');
const fs = require('fs');


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
    const mto = await Mto.findById(req.params.id);
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
 
