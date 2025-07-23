const Joi = require("joi");
const { objectId, pageSchema } = require("../../../validators/common.validation");

const createHsnNumber = {
  body: Joi.object().keys({
    hsnNumber: Joi.number().required(),
    gstPercentage: Joi.number().required(),
  }),
};

const updateHsnNumber = {
  body: Joi.object().keys({
    hsnNumber: Joi.number().optional(),
    gstPercentage: Joi.number().optional(),
  }),
};

const searchHsnNumbers = {
  query: Joi.object().keys({
    search: Joi.string(),
    ...pageSchema,  // Assuming pageSchema includes pagination parameters
  }),
};

const removeHsnNumber = {
  params: Joi.object().keys({
    id: Joi.string().required().custom(objectId),  // Assuming id is ObjectId
  }),
};


module.exports = {
  createHsnNumber,
  updateHsnNumber,
  searchHsnNumbers,
  removeHsnNumber,
};
