const xlsx = require("xlsx");
const fs = require("fs");
const snakeCase = require("lodash.snakecase");
const mongoose = require("mongoose");

const processExcelFile = async (filePath, projectId) => {
  try {
    const workbook = xlsx.readFile(filePath, { cellDates: true });
    const sheetName = workbook.SheetNames[0];

    const dataRows = xlsx.utils
      .sheet_to_json(workbook.Sheets[sheetName], {
        header: 1,
      })
      .slice(1);

    const rawHeaders = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName], {
      header: 1,
    })[0];

    if (!rawHeaders || rawHeaders.length === 0) {
      throw new Error("Excel file has no headers");
    }

    const headers = rawHeaders.map(snakeCase);

    const mtoSchemaDefinition = {};

    headers.forEach((header) => {
      if (header.toLowerCase().includes("date")) {
        mtoSchemaDefinition[header] = { type: Date };
      } else if (!isNaN(Number(header))) {
        mtoSchemaDefinition[header] = { type: Number };
      } else {
        mtoSchemaDefinition[header] = { type: String };
      }
    });

    mtoSchemaDefinition.project = {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true,
    };

    const mtoSchema = new mongoose.Schema(mtoSchemaDefinition, {
      timestamps: true,
    });

    const MtoDynamic = mongoose.model(`mto_${projectId}`, mtoSchema);

    const dataToInsert = dataRows.map((row) => {
      const rowData = { project: projectId };

      rawHeaders.forEach((header, index) => {
        const fieldName = snakeCase(header);
        let value = row[index];

        if (mtoSchemaDefinition[fieldName].type === Date && value) {
          value = new Date(value);
          if (isNaN(value.getTime())) {
            value = null;
          }
        }

        rowData[fieldName] = value;
      });

      return rowData;
    });

    await MtoDynamic.insertMany(dataToInsert);

    return { headers, collectionName: `mto_${projectId}` };
  } catch (error) {
    fs.unlinkSync(filePath);
    throw error;
  }
};

module.exports = {
  processExcelFile,
};
