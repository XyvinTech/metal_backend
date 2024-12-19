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

module.exports = mtoRoute;
