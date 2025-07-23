const Joi = require("joi");
const { objectId, pageSchema } = require("../../../validators/common.validation");

const createPrescription = {
  body: Joi.object().keys({
    userId: Joi.string().required().custom(objectId), // Assuming userId is ObjectId
    fileUrl: Joi.string().required().uri(),
    status: Joi.string().valid("pending", "verified", "rejected").default("pending"),
  }),
};

const updatePrescription = {
  body: Joi.object().keys({
    fileUrl: Joi.string().uri(),
    status: Joi.string().valid("pending", "verified", "rejected"),
  }),
};

const searchPrescriptions = {
  query: Joi.object().keys({
    status: Joi.string().valid("pending", "verified", "rejected"),
    search: Joi.string(),
    ...pageSchema, // Assuming pageSchema includes pagination parameters (limit, page, etc.)
  }),
};

const getPrescriptionById = {
  params: Joi.object().keys({
    id: Joi.string().required().custom(objectId), // Assuming id is ObjectId
  }),
};

const removePrescription = {
  params: Joi.object().keys({
    id: Joi.string().required().custom(objectId), // Assuming id is ObjectId
  }),
};

module.exports = {
  createPrescription,
  updatePrescription,
  searchPrescriptions,
  getPrescriptionById,
  removePrescription,
};
