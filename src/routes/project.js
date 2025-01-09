const express = require("express");
const projectController = require("../controllers/projectController");
const projectRoute = express.Router();
const authVerify = require("../middlewares/authVerify");
const multer = require("multer");
const checkSuperAdmin = require("../middlewares/checkSuperAdmin");
const upload = multer({ dest: "uploads/" });

projectRoute.use(authVerify);
projectRoute.post(
  "/",
  upload.single("file"),
  checkSuperAdmin,
  projectController.createProject
);

projectRoute
  .route("/single/:id")
  .get(projectController.getProjectById)
  .put(checkSuperAdmin, projectController.updateProject)
  .delete(checkSuperAdmin, projectController.deleteProject);

projectRoute.get("/list", projectController.getProjects);


module.exports = projectRoute;
