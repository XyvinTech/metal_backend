const Project = require("../models/projectModelTest");

exports.generateUniqueDigit = async (length) => {
  function generateRandom6Digits() {
    return Math.floor(100000 + Math.random() * 900000);
  }

  let uniqueNumber;
  let isUnique = false;

  while (!isUnique) {
    uniqueNumber = generateRandom6Digits();

    const existingUser = await Project.findOne({ collectionName: uniqueNumber });

    if (!existingUser) {
      isUnique = true;
    }
  }

  return uniqueNumber;
};
