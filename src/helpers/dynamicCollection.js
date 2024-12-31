const mongoose = require("mongoose");

exports.dynamicCollection = async (collectionName) => {
  const MtoDynamic = mongoose.model(
    collectionName,
    new mongoose.Schema({}, { strict: false })
  );

  return MtoDynamic;
};