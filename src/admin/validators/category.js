const Joi = require("joi");
const { objectId, pageSchema } = require("../../../validators/common.validation");

const createCategory = {
  body: Joi.object().keys({
    name: Joi.string().required(),
    categoryImage:Joi.string().required(),
    //subCategory: Joi.array().items(Joi.string().required().custom(objectId)).required(),
  }),
};

const updateCategory = {
  body: Joi.object().keys({
    name: Joi.string().optional(),
    categoryImage: Joi.string().optional(),
    //subCategory: Joi.array().items(Joi.string().required().custom(objectId)).required(),

  }),
};

const searchCategories = {
  query: Joi.object().keys({
    search: Joi.string(),
    ...pageSchema,  // Assuming pageSchema includes pagination parameters
  }),
};

const removeCategory = {
  params: Joi.object().keys({
    id: Joi.string().required().custom(objectId),  // Assuming id is ObjectId
  }),
};


module.exports = {
  createCategory,
  updateCategory,
  searchCategories,
  removeCategory,
};
