const Joi = require("joi");

exports.createAdminSchema = Joi.object({
  name: Joi.string().required(),
  email: Joi.string().required(),
  phone: Joi.string().required(),
  active: Joi.boolean(),
  project: Joi.string().required(),
  password: Joi.string().required(),
});

exports.updateAdminSchema = Joi.object({
  name: Joi.string(),
  email: Joi.string(),
  phone: Joi.string(),
  active: Joi.boolean(),
  project: Joi.string(),
});




exports.createProjectSchema = Joi.object({
  project: Joi.string().required(),
  code: Joi.string().required(),
  description: Joi.string().required(),
  owner: Joi.string().required(),
  consultant: Joi.string().required(),
});


exports.updateProjectSchema = Joi.object({
  project: Joi.string(),
  code: Joi.string(),
  description: Joi.string(),
  owner: Joi.string(),
  consultant: Joi.string(),
});


exports.createMtoSchema = Joi.object({
  unit: Joi.string(),
  lineNo: Joi.string(),
  lineLocation: Joi.string(),
  areaLineSheetIdent: Joi.string(),
  area: Joi.string(),
  line: Joi.string(),
  sheet: Joi.number(),
  identCode: Joi.string(),
  uom: Joi.string(),
  size: Joi.number(),
  sizeTwo: Joi.number(),
  specCode: Joi.string(),
  shortCode: Joi.string(),
  cat: Joi.string(),
  shortDesc: Joi.string(),
  mtoRev: Joi.string(),
  sf: Joi.string(),
  scopeQty: Joi.number(),
  issuedQtyAss: Joi.number(),
  issuedDate: Joi.date(),
  balToIssue: Joi.number(),
  consumedQty: Joi.number(),
  balanceStock: Joi.number(),
});

exports.updateMtoSchema = Joi.object({
  issuedQtyAss: Joi.number(),
  issuedDate: Joi.date(),
  consumedQty: Joi.number()
});


