const express = require("express");
const mtoController = require("../controllers/mtoController");
const mtoRoute = express.Router();

mtoRoute.post("/", mtoController.createMto);

mtoRoute
  .route("/single/:id")
  .get(mtoController.getMtoById)
  .put(mtoController.updateMto)
  .delete(mtoController.deleteMto);

mtoRoute.get("/list", mtoController.getMtos);
mtoRoute.get("/download", mtoController.downloadMtoCsv);

module.exports = mtoRoute;
