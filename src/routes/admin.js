const express = require("express");
const adminController = require("../controllers/adminController");
const authVerify = require("../middlewares/authVerify");
const adminRoute = express.Router();

adminRoute.post("/login", adminController.loginAdmin);
adminRoute.post("/forget-password", adminController.forgetPassword);
adminRoute.put("/change-password", adminController.changePassword);

adminRoute.use(authVerify);
adminRoute
  .route("/")
  .post(adminController.createAdmin)
  .get(adminController.getAdmin);


  adminRoute.get("/list", adminController.getAllAdmins);
  adminRoute.get("/log", adminController.getAllLogs);
  adminRoute.get("/alert/:id", adminController.getAlerts);
  adminRoute.get('/alerts/download/:id', adminController.downloadAlerts);
  adminRoute.get('/dashboard', adminController.getDashboardData);

  
  adminRoute
    .route("/profile/:id")
    .get(adminController.fetchAdmin)
    .put(adminController.updateAdmin)
    .delete(adminController.deleteAdmin);

module.exports = adminRoute;
