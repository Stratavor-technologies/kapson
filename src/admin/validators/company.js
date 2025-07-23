const Joi = require("joi");
const { objectId, pageSchema } = require("../../../validators/common.validation");

const createCompany = {
  body: Joi.object().keys({
    companyName: Joi.string().required(),
    logo: Joi.string().required(),
    revenue: Joi.number().min(0).default(0),
    numberOfProducts: Joi.number().min(0).default(0),
    customerRating: Joi.number().min(0),
  }),
};

const updateCompany = {
  body: Joi.object().keys({
    companyName: Joi.string().optional(),
    logo: Joi.string().optional(),
    revenue: Joi.number().min(0).optional(),
    numberOfProducts: Joi.number().min(0).optional(),
    customerRating: Joi.number().optional(),
  }),
};

const searchCompanies = {
  query: Joi.object().keys({
    search: Joi.string(),
    sortBy: Joi.boolean().optional(),
    sortBySale:Joi.boolean().optional(),
    ...pageSchema,  // Assuming pageSchema includes pagination parameters
  }),
};


const getCompany = {
  params: Joi.object().keys({
    id: Joi.string().required().custom(objectId),
  }),
};

const deleteCompany = {
  params: Joi.object().keys({
    id: Joi.string().required().custom(objectId),
  }),
};

module.exports = {
  createCompany,
  updateCompany,
  searchCompanies,
  getCompany,
  deleteCompany,
};