const mongoose = require("mongoose");

exports.dynamicCollection = async (collectionName) => {
  if (mongoose.models[collectionName]) {
    return mongoose.models[collectionName];
  }

  const MtoDynamic = mongoose.model(
    collectionName,
    new mongoose.Schema({}, { strict: false })
  );

  return MtoDynamic;
};
