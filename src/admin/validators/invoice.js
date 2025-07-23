const Joi = require("joi");
const { objectId, pageSchema } = require("../../../validators/common.validation");


const createInvoice = {
  body: Joi.object().keys({
    invoiceId:Joi.string(),
    userId:Joi.string().required().custom(objectId),
    orderId:Joi.string().required().custom(objectId),
    paymentId:Joi.string().required().custom(objectId),
    invoiceFrom: Joi.string().required(),
    invoiceType:Joi.string().required(),
    userMembership:Joi.string().required().custom(objectId),
    
  })
}
const updateInvoice = {  
  body: Joi.object().keys({
    userId:Joi.string().optional(),
    orderId:Joi.string().optional(),
    paymentId:Joi.string().optional(),
    invoiceFrom: Joi.string().optional(),
    invoiceType:Joi.string().optional(),
    userMembership:Joi.string().optional(),
  })
}
 
const getInvoiceById = {
  params: Joi.object().keys({
    id: Joi.string().required().custom(objectId),  // Assuming id is ObjectId
  }),
};
const searchInvoice = {
    query: Joi.object().keys({
      search: Joi.string(),
       invoiceId: Joi.string().regex(/^[0-9a-fA-F]{24}$/),
       orderId: Joi.string().regex(/^[0-9a-fA-F]{24}$/),
       invoiceType:Joi.string().optional(),
      ...pageSchema,  // Assuming pageSchema includes pagination parameters
    }),
  };
  
  const removeInvoice = {
    params: Joi.object().keys({
      id: Joi.string().required().custom(objectId),  // Assuming id is ObjectId
    }),
  };
  
  
  module.exports = {
   createInvoice,
   updateInvoice,
   searchInvoice,
   removeInvoice,
   getInvoiceById
};

