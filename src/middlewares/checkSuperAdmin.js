const checkSuperAdmin = (req, res, next) => {
  if (req.user?.superAdmin !== true) {
    return responseHandler(
      res,
      403,
      "You are not authorized to create Project"
    );
  }
  next();
};

module.exports = checkSuperAdmin;
