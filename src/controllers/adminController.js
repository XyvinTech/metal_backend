const Admin = require("../models/adminModel");
const responseHandler = require("../helpers/responseHandler");
const validations = require("../validations");
const { comparePasswords, hashPassword } = require("../utils/bcrypt");
const { generateToken } = require("../utils/generateToken");
const Log = require("../models/logModel");
const Alert = require("../models/alertModel");
const { createObjectCsvStringifier } = require("csv-writer");
const Project = require("../models/projectModel");
const { dynamicCollection } = require("../helpers/dynamicCollection");

exports.loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return responseHandler(res, 400, "Email and password are required");
    }

    const findAdmin = await Admin.findOne({ email });
    if (!findAdmin) {
      return responseHandler(res, 404, "Admin not found");
    }

    const comparePassword = await comparePasswords(
      password,
      findAdmin.password
    );
    if (!comparePassword) {
      return responseHandler(res, 401, "Invalid password");
    }

    const token = generateToken(findAdmin._id);

    return responseHandler(res, 200, "Login successfully", token);
  } catch (error) {
    return responseHandler(res, 500, `Internal Server Error ${error.message}`);
  }
};

exports.createAdmin = async (req, res) => {
  try {
    if (req.user.superAdmin !== true) {
      return responseHandler(
        res,
        403,
        `You are not authorized to create admin`
      );
    }
    const { error } = validations.createAdminSchema.validate(req.body, {
      abortEarly: true,
    });

    if (error) {
      return responseHandler(res, 400, `Invalid input: ${error.message}`);
    }

    const findAdmin = await Admin.findOne({
      $or: [{ email: req.body.email }, { phone: req.body.phone }],
    });
    if (findAdmin)
      return responseHandler(
        res,
        409,
        `Admin with this email or phone already exists`
      );

    const hashedPassword = await hashPassword(req.body.password);
    req.body.password = hashedPassword;

    const newAdmin = await Admin.create(req.body);

    if (newAdmin) {
      return responseHandler(
        res,
        201,
        `New Admin created successfullyy..!`,
        newAdmin
      );
    } else {
      return responseHandler(res, 400, `Admin creation failed...!`);
    }
  } catch (error) {
    return responseHandler(res, 500, `Internal Server Error ${error.message}`);
  }
};

exports.getAdmin = async (req, res) => {
  try {
    const id = req.userId;
    if (!id) {
      return responseHandler(res, 400, "Admin ID is required");
    }
    const findAdmin = await Admin.findById(id).select("-password").lean();
    if (!findAdmin) {
      return responseHandler(res, 404, "Admin not found");
    }

    return responseHandler(res, 200, "Admin found", findAdmin);
  } catch (error) {
    errorMessage = error.message;
    return responseHandler(res, 500, `Internal Server Error ${error.message}`);
  }
};

exports.getAllAdmins = async (req, res) => {
  try {
    const { pageNo = 1, status, limit = 10 } = req.query;
    const skipCount = 10 * (pageNo - 1);
    const filter = {
      _id: { $ne: "66cef136282563d7bb086e30" },
    };
    const totalCount = await Admin.countDocuments(filter);
    const data = await Admin.find(filter)
      .skip(skipCount)
      .limit(limit)
      .sort({ createdAt: -1, _id: 1 })
      .lean();

    return responseHandler(
      res,
      200,
      `Admins found successfullyy..!`,
      data,
      totalCount
    );
  } catch (error) {
    return responseHandler(res, 500, `Internal Server Error ${error.message}`);
  }
};

exports.fetchAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      return responseHandler(res, 400, "Admin ID is required");
    }
    const findAdmin = await Admin.findById(id).select("-password").lean();

    if (!findAdmin) {
      return responseHandler(res, 404, "Admin not found");
    }
    return responseHandler(res, 200, "Admin found", findAdmin);
  } catch (error) {
    return responseHandler(res, 500, `Internal Server Error ${error.message}`);
  }
};

exports.updateAdmin = async (req, res) => {
  try {
    const { error } = validations.updateAdminSchema.validate(req.body, {
      abortEarly: true,
    });

    if (error) {
      return responseHandler(res, 400, `Invalid input: ${error.message}`);
    }

    const adminId = req.params.id;
    const findAdmin = await Admin.findById(adminId);
    if (!findAdmin) {
      return responseHandler(res, 404, `Admin not found`);
    }

    if (req.body.password) {
      req.body.password = await hashPassword(req.body.password);
    }

    const updatedAdmin = await Admin.findByIdAndUpdate(adminId, req.body, {
      new: true,
      runValidators: true,
    });

    if (updatedAdmin) {
      return responseHandler(
        res,
        200,
        "Admin updated successfully",
        updatedAdmin
      );
    } else {
      return responseHandler(res, 400, "Admin update failed");
    }
  } catch (error) {
    return responseHandler(res, 500, `Internal Server Error: ${error.message}`);
  }
};

exports.deleteAdmin = async (req, res) => {
  try {
    const adminId = req.params.id;
    const findAdmin = await Admin.findById(adminId);
    if (!findAdmin) {
      return responseHandler(res, 404, `Admin not found`);
    }

    const deletedAdmin = await Admin.findByIdAndDelete(adminId);

    if (deletedAdmin) {
      return responseHandler(res, 200, "Admin deleted successfully");
    } else {
      return responseHandler(res, 400, "Admin deletion failed");
    }
  } catch (error) {
    return responseHandler(res, 500, `Internal Server Error: ${error.message}`);
  }
};

exports.getAllLogs = async (req, res) => {
  try {
    const { pageNo = 1, limit = 10 } = req.query;
    const skipCount = limit * (pageNo - 1);

    const filter = {
      _id: { $ne: "66cef136282563d7bb086e30" },
    };

    const totalCount = await Log.countDocuments(filter);

    const data = await Log.find(filter)
      .populate("admin", "name email")
      .populate("project", "title")
      .skip(skipCount)
      .limit(Number(limit))
      .sort({ createdAt: -1, _id: 1 })
      .lean();
    const mappedData = data.map((logs) => {
      return {
        ...logs,
        adminName: logs?.admin?.name || "",
      };
    });
    return responseHandler(
      res,
      200,
      `Logs retrieved successfully..!`,
      mappedData,
      totalCount
    );
  } catch (error) {
    return responseHandler(res, 500, `Internal Server Error: ${error.message}`);
  }
};

exports.getAlerts = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skipCount = (page - 1) * limit;

    // Find the project by its ID to get the collection name
    const project = await Project.findById(req.params.id);
    if (!project) {
      return responseHandler(res, 404, "Project not found");
    }

    // Get the dynamic collection for MTO
    const MtoDynamic = await dynamicCollection(project.collectionName);

    // Fetch alerts for the given project
    const alerts = await Alert.find({ project: req.params.id })
      .skip(skipCount)
      .sort({ createdAt: -1, _id: 1 })
      .populate("project", "project")
      .lean();

    // Retrieve MTO data dynamically and map the alerts
    const mappedData = await Promise.all(
      alerts.map(async (alert) => {
        return {
          ...alert,
          projectname: alert.project.project || "",
          mtoIdentCode,
        };
      })
    );

    const totalCount = await Alert.countDocuments({ project: req.params.id });

    if (!alerts || alerts.length === 0) {
      return responseHandler(res, 404, "No alerts found");
    }

    return responseHandler(
      res,
      200,
      "Alerts fetched successfully",
      mappedData,
      totalCount
    );
  } catch (error) {
    return responseHandler(res, 500, `Internal Server Error: ${error.message}`);
  }
};

exports.downloadAlerts = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return responseHandler(res, 404, "Project not found");
    }

    // Get the dynamic collection for MTO
    const MtoDynamic = await dynamicCollection(project.collectionName);

    // Fetch alerts for the given project
    const alerts = await Alert.find({ project: req.params.id })
      .sort({ createdAt: -1, _id: 1 })
      .populate("project", "project")
      .lean();

    if (!alerts || alerts.length === 0) {
      return responseHandler(res, 404, "No alerts found for CSV export");
    }

    // Retrieve MTO data dynamically and map the alerts
    const mappedData = await Promise.all(
      alerts.map(async (alert) => {
        let mtoIdentCode = "";
        let areaLineSheetIdent = "";

        if (alert.mto) {
          const mtoData = await MtoDynamic.findById(alert.mto).lean();
          mtoIdentCode = mtoData?.identCode || "";
          areaLineSheetIdent = mtoData?.areaLineSheetIdent || "";
        }

        return {
          id: alert._id || "",
          projectName: alert.project?.project || "",
          issuedQtyAss: alert.issuedQty || "",
          consumedQty: alert.consumedQty || "",
          issuedDate: alert.issuedDate || "",
        };
      })
    );

    const csvStringifier = createObjectCsvStringifier({
      header: [
        { id: "projectName", title: "Project" },
        { id: "issuedQtyAss", title: "Issued Qty Ass" },
        { id: "consumedQty", title: "Consumed Qty" },
        { id: "issuedDate", title: "Issued Date" },

      ],
    });

    const csvData =
      csvStringifier.getHeaderString() +
      csvStringifier.stringifyRecords(mappedData);

    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", 'attachment; filename="alerts.csv"');

    return res.status(200).send(csvData);
  } catch (error) {
    console.error("Error generating CSV:", error.message);
    return responseHandler(res, 500, `Internal Server Error: ${error.message}`);
  }
};
