const Joi = require("joi");
const { objectId, pageSchema } = require("../../../validators/common.validation");

const createCart = {
  body: Joi.object().keys({
    items: Joi.array().items(Joi.object({
      productId: Joi.string().required(),
      quantity: Joi.number().required(),
      price: Joi.number()
    })).required(),
    totalAmount: Joi.number()
  })
}

const updateCart = {  
  body: Joi.object().keys({
    item: Joi.array().items(Joi.object({
      productId: Joi.string().optional(),
      quantity: Joi.number().optional()
    })).optional()
  })
  };
 

const searchCart = {
    query: Joi.object().keys({
      search: Joi.string(),
      ...pageSchema,  // Assuming pageSchema includes pagination parameters
    }),
  };
  
  
  const removeCart = {
    params: Joi.object().keys({
      id: Joi.string().required().custom(objectId),  // Assuming id is ObjectId
    }),
  };
const getCartById = {
  params: Joi.object().keys({
    id: Joi.string().required().custom(objectId),  // Assuming id is ObjectId
  }),
};


  
  module.exports = {
    createCart,
    updateCart,
    removeCart,
    searchCart,
    getCartById
  };
