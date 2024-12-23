const express = require("express");
const mtoController = require("../controllers/mtoController");
const authVerify = require("../middlewares/authVerify");
const mtoRoute = express.Router();
const multer = require("multer");
const upload = multer({ dest: "uploads/" });

// mtoRoute.use(authVerify);
mtoRoute.post("/", mtoController.createMto);

mtoRoute
  .route("/single/:id")
  .get(mtoController.getMtoById)
  .put(mtoController.updateMto);
// .delete(mtoController.deleteMto);

mtoRoute.get("/list", mtoController.getMtos);
mtoRoute.get("/download", mtoController.downloadMtoCsv);
mtoRoute.get("/summery/:id", mtoController.fetchSummaryByProjectId);

mtoRoute.get("/summery/download/:id", mtoController.downloadSummaryByProjectId);

mtoRoute.post("/upload", upload.single("file"), mtoController.bulkUpload);

module.exports = mtoRoute;
