const express = require("express");
const projectController = require("../controllers/projectController");
const projectRoute = express.Router();
const multer = require('multer');
const authVerify = require("../middlewares/authVerify");
const upload = multer({ dest: 'uploads/' });
// projectRoute.use(authVerify);
projectRoute.post("/", projectController.createProject);


projectRoute
  .route("/single/:id")
  .get(projectController.getProjectById)
  .put(projectController.updateProject)
  .delete(projectController.deleteProject);

projectRoute.get("/list", projectController.getProjects);
projectRoute.post("/upload", upload.single('file'), projectController.uploadExcelFile);

module.exports = projectRoute;
