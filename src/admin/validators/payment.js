  const Joi = require("joi");
const { objectId, pageSchema } = require("../../../validators/common.validation");

const createPayment = {
    body: Joi.object().keys({
        orderId: Joi.string().required(),
        paymentMethod: Joi.string().required(),
        paymentStatus: Joi.string().required(),
        paymentDate: Joi.date().required(),
        amount: Joi.number().required(),
        dueDate: Joi.date().optional()
    }), 
};
const updatePayment = {
    body: Joi.object().keys({
        paymentMethod: Joi.string().optional(),
        status: Joi.string().optional(),
        paymentDate: Joi.date().optional(),
        amount: Joi.number().optional(),
    }),
};

const searchPayment = {
    query: Joi.object().keys({
      search: Joi.string(),
      userId: Joi.string().regex(/^[0-9a-fA-F]{24}$/),
       type: Joi.string().optional(),
      ...pageSchema,  // Assuming pageSchema includes pagination parameters
    }),
  };
  
  const getPaymentById = {
    params: Joi.object().keys({
      id: Joi.string().required().custom(objectId),  // Assuming id is ObjectId
    }),
  };
  
  const removePayment = {
    params: Joi.object().keys({
      id: Joi.string().required().custom(objectId),  // Assuming id is ObjectId
    }),
  };
  
  
  module.exports = {
    createPayment,
    updatePayment,
    searchPayment,
    getPaymentById,
    removePayment,
  };