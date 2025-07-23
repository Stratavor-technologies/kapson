const Joi = require("joi");
const { objectId, pageSchema } = require("../../../validators/common.validation");
const membership = require("../routes/membership");

const createMembership = {
  body: Joi.object().keys({
      membershipName: Joi.string().required(),
      membershipDuration:Joi.string().required(),
      membershipDescription: Joi.array().items(Joi.string().required()).required(),
      stripePriceId:Joi.string(),
      price:Joi.number().required(),
      //status: Joi.string()
  }),
};

  
const updateMembership = {
  body: Joi.object().keys({
    membershipName: Joi.string().optional(),
    membershipDuration:Joi.string().optional(),
    membershipDescription: Joi.array().items(Joi.string()).optional(),
    price:Joi.number().optional(),
    status: Joi.string().optional()
  }),
};

const searchMembership = {
  query: Joi.object().keys({
    search: Joi.string(),
    membershipId: Joi.string().regex(/^[0-9a-fA-F]{24}$/),
    ...pageSchema, // Assuming pageSchema includes pagination parameters
  }),
};



const removeMembership = {
  params: Joi.object().keys({
    id: Joi.string().required().custom(objectId),  // Assuming id is ObjectId
  }),
};

const getMembershipById = {
  params: Joi.object().keys({
    id: Joi.string().required().custom(objectId),  // Assuming id is ObjectId
  }),
};

module.exports = {
 getMembershipById,
  createMembership,
  updateMembership,
  searchMembership,
  removeMembership,
};
