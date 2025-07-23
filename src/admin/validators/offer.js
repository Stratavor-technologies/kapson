const Joi = require("joi");
const { objectId, pageSchema } = require("../../../validators/common.validation");

const createOffer = {
  body: Joi.object().keys({
    name: Joi.string().required(),
    //subOffer: Joi.array().items(Joi.string().required().custom(objectId)).required(),
  }),
};

const updateOffer = {
  body: Joi.object().keys({
    name: Joi.string().optional(),
    OfferImage: Joi.string().optional(),
    //subOffer: Joi.array().items(Joi.string().required().custom(objectId)).required(),

  }),
};

const searchOffers = {
  query: Joi.object().keys({
    search: Joi.string(),
    ...pageSchema,  // Assuming pageSchema includes pagination parameters
  }),
};

const removeOffer = {
  params: Joi.object().keys({
    id: Joi.string().required().custom(objectId),  // Assuming id is ObjectId
  }),
};


module.exports = {
  createOffer,
  updateOffer,
  searchOffers,
  removeOffer,
};
