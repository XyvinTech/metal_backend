const express = require("express");
const projectController = require("../controllers/projectController");
const projectRoute = express.Router();
const authVerify = require("../middlewares/authVerify");

projectRoute.use(authVerify);
projectRoute.post("/", projectController.createProject);


projectRoute
  .route("/single/:id")
  .get(projectController.getProjectById)
  .put(projectController.updateProject)
  .delete(projectController.deleteProject);

projectRoute.get("/list", projectController.getProjects);


module.exports = projectRoute;
