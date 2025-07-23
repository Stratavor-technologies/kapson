const Joi = require("joi");
const { objectId, pageSchema } = require("../../../validators/common.validation");

const createNotification = {
  body: Joi.object().keys({
    name: Joi.string().required(),
    //subNotification: Joi.array().items(Joi.string().required().custom(objectId)).required(),
  }),
};

const updateNotification = {
  body: Joi.object().keys({
    name: Joi.string().optional(),
    NotificationImage: Joi.string().optional(),
    //subNotification: Joi.array().items(Joi.string().required().custom(objectId)).required(),

  }),
};

const searchNotifications = {
  query: Joi.object().keys({
    search: Joi.string(),
    ...pageSchema,  // Assuming pageSchema includes pagination parameters
  }),
};

const removeNotification = {
  params: Joi.object().keys({
    id: Joi.string().required().custom(objectId),  // Assuming id is ObjectId
  }),
};


module.exports = {
  createNotification,
  updateNotification,
  searchNotifications,
  removeNotification,
};
