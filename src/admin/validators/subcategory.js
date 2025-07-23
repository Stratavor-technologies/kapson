const Joi = require("joi");
const { objectId, pageSchema } = require("../../../validators/common.validation");

const createSubcategory = {
  body: Joi.object().keys({
    name: Joi.string().required(),
    image: Joi.string().required(),
    category: Joi.string().required().custom(objectId),  // Reference to the parent category
    // createdBy: Joi.string().required().custom(objectId),  // Reference to the user who created the subcategory
  }),
};

const updateSubcategory = {
  body: Joi.object().keys({
    name: Joi.string(),
    image: Joi.string(),
    category: Joi.string().custom(objectId),
  }),
};

const searchSubcategories = {
  query: Joi.object().keys({
    search: Joi.string(),
    categoryId: Joi.string().regex(/^[0-9a-fA-F]{24}$/),
    ...pageSchema,  // Assuming pageSchema includes pagination parameters
  }),
};


const removeSubcategory = {
  params: Joi.object().keys({
    id: Joi.string().required().custom(objectId),  // Assuming id is ObjectId
  }),
};


module.exports = {
  createSubcategory,
  updateSubcategory,
  searchSubcategories,
  removeSubcategory,
};
