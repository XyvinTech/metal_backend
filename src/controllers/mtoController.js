const Mto = require("../models/mtoModel");
const responseHandler = require("../helpers/responseHandler");
const validations = require("../validations");

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
