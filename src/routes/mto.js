const express = require("express");
const mtoController = require("../controllers/mtoController");
const authVerify = require("../middlewares/authVerify");
const mtoRoute = express.Router();
const multer = require("multer");
const upload = multer({ dest: "uploads/" });

mtoRoute.use(authVerify);

mtoRoute
  .route("/single/:id")
  .get(mtoController.getMtoById)
  .put(mtoController.updateMto);

mtoRoute.get("/summery/:projectId", mtoController.getSummery);
mtoRoute.get("/download/:projectId", mtoController.downloadMtoCsv);
mtoRoute.get("/summery/download/:projectId", mtoController.downloadSummery);

mtoRoute.put("/bulkupdate", upload.single("file"), mtoController.bulkUpdate);

module.exports = mtoRoute;
