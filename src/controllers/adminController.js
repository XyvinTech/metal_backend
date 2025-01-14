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
const { generateRandomPassword } = require("../utils/generateRandomPassword");
const sendMail = require("../utils/sendMail");
const { generateOTP } = require("../utils/generateOTP");

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
    const mappedData = {
      superAdmin: findAdmin.superAdmin,
      token: token,
    };
    return responseHandler(res, 200, "Login successfully", mappedData);
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

    const generatedPassword = generateRandomPassword();

    const hashedPassword = await hashPassword(generatedPassword);
    req.body.password = hashedPassword;

    const data = {
      to: req.body.email,
      subject: "Admin Registration Notification",
      text: `Hello, ${req.body.name}. 
      You have been registered as an admin on the platform. 
      Please use the following credentials to log in: Email: ${req.body.email} Password: ${generatedPassword} 
      Thank you for joining us! 
      Best regards, The Admin Team`,
    };

    await sendMail(data);

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

    const adminId = req.userId; 
    const isSuperAdmin = req.isSuperAdmin;


    let filter = { _id: { $ne: "66cef136282563d7bb086e30" } };

    if (!isSuperAdmin) {
      filter.admin = adminId;
    }

    const totalCount = await Log.countDocuments(filter);

    const data = await Log.find(filter)
      .populate("admin", "name email")
      .populate("project", "project")
      .skip(skipCount)
      .limit(Number(limit))
      .sort({ createdAt: -1, _id: 1 })
      .lean();

    const mappedData = data.map((logs) => {
      return {
        ...logs,
        adminName: logs?.admin?.name || "",
        projectName: logs?.project?.project || "",
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

    const project = await Project.findById(req.params.id);
    if (!project) {
      return responseHandler(res, 404, "Project not found");
    }

    const MtoDynamic = await dynamicCollection(project.collectionName);

    const alerts = await Alert.find({ project: req.params.id })
      .skip(skipCount)
      .sort({ createdAt: -1, _id: 1 })
      .populate("project", "project")
      .lean();


    const mappedData = await Promise.all(
      alerts.map(async (alert) => {
        const mto = await MtoDynamic.findById(alert.mto);
        return {
          ...alert,
          projectname: alert.project.project || "",
          mto,
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

exports.getDashboardData = async (req, res) => {
  try {
    const adminId = req.userId;
    const isSuperAdmin = req.isSuperAdmin;

    const adminFilter = isSuperAdmin ? {} : { admin: adminId };
    const alertFilter = isSuperAdmin ? {} : { admin: adminId };

    let projectCount = await Project.countDocuments();

    if (!isSuperAdmin) {
      projectCount = await req.user.project?.length
    }

    const adminCount = await Admin.countDocuments();

    const recentLogs = await Log.find(adminFilter)
      .populate("admin", "name email")
      .populate("project", "project code")
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();

    const recentActivity = recentLogs.map((data) => {
      return {
        ...data,
        adminName: data?.admin?.name || "",
        adminMail: data?.admin?.email || "",
        projectName: data?.project?.project || "",
        projectCode: data?.project?.code || "",
      };
    });

    const changesCount = await Log.countDocuments(adminFilter);
    const filter = isSuperAdmin ? {} : { project: { $in: req.user.project } };
    const alertCount = await Alert.countDocuments(filter);

    const recentAlerts = await Alert.find(adminFilter)
      .populate("project", "project code")
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();

    const alertData = recentAlerts.map((data) => {
      return {
        ...data,
        projectName: data?.project?.project || "",
        projectCode: data?.project?.code || "",
      };
    });

    const responsePayload = {
      projectCount,
      adminCount,
      changesCount,
      alertCount,
      recentActivity,
      alertData,
    };

    res.status(200).json({
      message: "Dashboard data fetched successfully",
      data: responsePayload,
    });
  } catch (error) {
    console.error("Error fetching dashboard data:", error.message);
    res.status(500).json({
      message: `Internal Server Error: ${error.message}`,
    });
  }
};



exports.forgetPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return responseHandler(res, 400, "Email is required");
    }
    const admin = await Admin.findOne({ email: email });
    if (!admin) {
      return responseHandler(res, 404, "Admin not found");
    }
    const generatedOTP = generateOTP(5);

    admin.otp = generatedOTP;
    await admin.save();

    const data = {
      to: email,
      subject: "Password Reset OTP",
      text: `Hello, ${admin.name}. 
      We have received a request to reset your password. 
      Your OTP is: ${generatedOTP}
      Thank you for joining us! 
      Best regards, The Admin Team`,
    };

    await sendMail(data);

    return responseHandler(res, 200, "OTP sent successfully");
  } catch (error) {
    console.error("Error sending email:", error.message);
    return responseHandler(res, 500, `Internal Server Error: ${error.message}`);
  }
};

exports.changePassword = async (req, res) => {
  try {
    const { email, otp, password } = req.body;
    if (!otp || !password) {
      return responseHandler(res, 400, "Email, OTP, and password are required");
    }
    const admin = await Admin.findOne({ email: email });
    if (!admin) {
      return responseHandler(res, 404, "Admin not found");
    }
    if (admin.otp !== otp) {
      return responseHandler(res, 400, "Invalid OTP");
    }
    admin.password = await hashPassword(password);
    admin.otp = null;
    await admin.save();
    return responseHandler(res, 200, "Password changed successfully");
  } catch (error) {
    return responseHandler(res, 500, `Internal Server Error: ${error.message}`);
  }
};