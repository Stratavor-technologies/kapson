const Joi = require("joi");
const { objectId, pageSchema } = require("../../../validators/common.validation");

const createMembership = {
  body: Joi.object().keys({
    membershipId: Joi.string().custom(objectId),
  }),
};


// const updateMembership = {
//   body: Joi.object().keys({
//     membershipName: Joi.string().optional(),
//     membershipDuration:Joi.string().optional(),
//     membershipDescription:Joi.string().optional(),
//     membershipType:Joi.string().optional(),
//     membershipFrom:Joi.string().optional(),
//     membershipTo:Joi.string().optional(),
//     price:Joi.number().optional(),
//   }),
// };

const searchMembership = {
  query: Joi.object().keys({
    search: Joi.string(),
    membershipId: Joi.string().regex(/^[0-9a-fA-F]{24}$/),
    userId: Joi.string().regex(/^[0-9a-fA-F]{24}$/),
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
  //updateMembership,
  searchMembership,
  removeMembership,
};
