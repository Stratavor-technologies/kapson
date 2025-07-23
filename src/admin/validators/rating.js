const Joi = require("joi");
const { objectId, pageSchema } = require("../../../validators/common.validation");

const createRating = {
  body: Joi.object().keys({
    medicineId: Joi.string().required().custom(objectId),
    rating: Joi.number().required().min(1).max(5),
    review: Joi.string().required(),
  }),
};

const updateRating = {
  body: Joi.object().keys({
    rating: Joi.number().optional().min(1).max(5),
    review: Joi.string().optional(),
  }),
};

const searchRating = {
  query: Joi.object().keys({
    search: Joi.string(),
     medicineId: Joi.string().regex(/^[0-9a-fA-F]{24}$/),
     userId: Joi.string().regex(/^[0-9a-fA-F]{24}$/),
    ...pageSchema,
  }),
};

const getRatingById = {
  params: Joi.object().keys({
    id: Joi.string().required().custom(objectId),
  }),
};

const removeRating = {
  params: Joi.object().keys({
    id: Joi.string().required().custom(objectId),
  }),
};

module.exports = {
  createRating,
  updateRating,
  searchRating,
  getRatingById,
  removeRating,
};
