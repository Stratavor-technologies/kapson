const Joi = require("joi");
const { objectId, pageSchema } = require("../../../validators/common.validation");

const createBanner = {
  body: Joi.object().keys({
    titleBanner: Joi.string().required(),
    placement: Joi.string().required(),
    discription: Joi.string().required(),
    status: Joi.string().required(),
    type: Joi.string().required(),
    imageUrl: Joi.string().required(),
  })
}

const updateBanner = {  
  body: Joi.object().keys({
    titleBanner: Joi.string().optional(),
    placement: Joi.string().optional(),
    description: Joi.string().optional(),
    status: Joi.string().optional(),
    type: Joi.string().optional(),
    imageUrl: Joi.string().optional(),
  })
  }
 

const searchBanner = {
    query: Joi.object().keys({
      search: Joi.string(),
      placement: Joi.string().optional(),
      status: Joi.string().optional(),

      ...pageSchema,  // Assuming pageSchema includes pagination parameters
    }),
  };
  
const getBannerById = {
  params: Joi.object().keys({
    id: Joi.string().required().custom(objectId),  // Assuming id is ObjectId
  }),
};
  const removeBanner = {
    params: Joi.object().keys({
      id: Joi.string().required().custom(objectId),  // Assuming id is ObjectId
    }),
  };
  
  
  module.exports = {
    getBannerById,
    createBanner,
    updateBanner,
    searchBanner,
    removeBanner,
  };
