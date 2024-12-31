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



mtoRoute.get("/download/:id", mtoController.downloadMtoCsv);
mtoRoute.get("/summery/:id", mtoController.fetchSummaryByProjectId);

mtoRoute.get("/summery/download/:id", mtoController.downloadSummaryByProjectId);
mtoRoute.put("/update", upload.single("file"), mtoController.bulkUpdate);

module.exports = mtoRoute;
