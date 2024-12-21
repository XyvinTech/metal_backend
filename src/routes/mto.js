const express = require("express");
const mtoController = require("../controllers/mtoController");
const authVerify = require("../middlewares/authVerify");
const mtoRoute = express.Router();

// mtoRoute.use(authVerify);
mtoRoute.post("/", mtoController.createMto);

mtoRoute
  .route("/single/:id")
  .get(mtoController.getMtoById)
  .put(mtoController.updateMto)
  .delete(mtoController.deleteMto);

mtoRoute.get("/list", mtoController.getMtos);
mtoRoute.get("/download", mtoController.downloadMtoCsv);

module.exports = mtoRoute;
