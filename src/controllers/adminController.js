const Admin = require("../models/adminModel");
const responseHandler = require("../helpers/responseHandler");
const validations = require("../validations");
const { comparePasswords, hashPassword } = require("../utils/bcrypt");
const { generateToken } = require("../utils/generateToken");

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
    if(req.user.superAdmin !== true){
      return responseHandler(res, 403, `You are not authorized to create admin`);
      
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
      const findAdmin = await Admin.findById(id)
        .select("-password")
        .lean();
  

  
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
  
