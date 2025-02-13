const Joi = require("joi");

exports.createAdminSchema = Joi.object({
  name: Joi.string().required(),
  email: Joi.string().required(),
  phone: Joi.string().required(),
  active: Joi.boolean(),
  project: Joi.array().required(),
  password: Joi.string().required(),
});

exports.updateAdminSchema = Joi.object({
  name: Joi.string(),
  email: Joi.string(),
  phone: Joi.string(),
  active: Joi.boolean(),
  project: Joi.array(),
});

exports.createProjectSchema = Joi.object({
  project: Joi.string().required(),
  code: Joi.string().required(),
  description: Joi.string().required(),
  owner: Joi.string().required(),
  consultant: Joi.string().required(),
  pk: Joi.string().required(),
  issuedQty: Joi.string().required(),
  consumedQty: Joi.string().required(),
  transOtherQty: Joi.string().required(),
  dateName: Joi.string().required(),
  workOrder: Joi.string().required(),
  poDate: Joi.date().required(),
  balanceQty: Joi.string().required(),
  reqQty: Joi.string().required(),
  balanceToIssue: Joi.string().required(),
  finishedDate: Joi.date().required(),
});

exports.updateProjectSchema = Joi.object({
  project: Joi.string(),
  code: Joi.string(),
  description: Joi.string(),
  owner: Joi.string(),
  consultant: Joi.string(),
  workOrder: Joi.string().required(),
  poDate: Joi.date().required(),
  finishedDate: Joi.date().required(),
});

exports.updateMtoSchema = Joi.object({
  issued_qty_ass: Joi.number().required(),
  issue_date: Joi.date().required(),
  consumed_qty: Joi.number().required(),
});
