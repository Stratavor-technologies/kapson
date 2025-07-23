const Joi = require("joi");
const { objectId, pageSchema } = require("../../../validators/common.validation");

const createAddress = {
  body: Joi.object().keys({
    firstName: Joi.string().optional(),
    lastName: Joi.string().optional(),
     partyDetails: Joi.object({
    partyName: Joi.string().optional(),
    contactNo: Joi.string().optional(),
    email: Joi.string().email().optional(),
    address: Joi.string().optional(),
    gstNo: Joi.string().optional()
  }).optional(),
   // address: Joi.string().optional(),
    country: Joi.string().optional(),
    state: Joi.string().optional(),
    city: Joi.string().optional(),
    zipCode: Joi.string().optional(),
    phoneNumber: Joi.string().optional(),
   // email: Joi.string().optional(),
  })
}

const updateAddress = {  
  body: Joi.object().keys({
    firstName: Joi.string().optional(),
    lastName: Joi.string().optional(),
    companyName: Joi.string().optional(),
    address: Joi.string().optional(),
    country: Joi.string().optional(),
    phoneCode: Joi.string().optional(),
    state: Joi.string().optional(),
    city: Joi.string().optional(),
    zipCode: Joi.string().optional(),
    phoneNumber: Joi.string().optional(),
    email: Joi.string().optional()
  })
  }
 
const searchAddress = {
    query: Joi.object().keys({
      search: Joi.string(),
      userId:Joi.string(),
      ...pageSchema,  // Assuming pageSchema includes pagination parameters
    }),
   
  };
  
const getAddressById = {
  params: Joi.object().keys({
    id: Joi.string().required().custom(objectId),  // Assuming id is ObjectId
  }),
};
  const removeAddress = {
    params: Joi.object().keys({
      id: Joi.string().required().custom(objectId),  // Assuming id is ObjectId
    }),
  };
  
  
  module.exports = {
    getAddressById,
    createAddress,
    updateAddress,
    searchAddress,
    removeAddress,
  };
