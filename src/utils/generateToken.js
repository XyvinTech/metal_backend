const jwt = require("jsonwebtoken");
require("dotenv").config();

exports.generateToken = (userId, roleId) => {
  const payload = {
    userId,
    ...(roleId && { roleId }),
  };

  return jwt.sign(payload, process.env.JWT_SECRET, {});
};
