const Joi = require("joi");
const { objectId, pageSchema } = require("../../../validators/common.validation");

const createDispatch = {
  body: Joi.object().keys({
    dispatchedFrom: Joi.string().default("Kapson Tools"),
    customerName: Joi.string().required(),
    orderId: Joi.string().required().custom(objectId),
   // margin: Joi.number().default(0),
    grNo: Joi.string().allow(null, ""),
    transport: Joi.string().allow(null, ""),
    vehicleNo: Joi.string().allow(null, ""),
    ewayBillNo: Joi.string().allow(null, ""),
    adPercent: Joi.number().default(0),
    cdPercent: Joi.number().default(0),
    privateMark: Joi.string().allow(null, ""),
    freightCharge: Joi.number().default(0),
    courierCharge: Joi.number().default(0),
    gstOnCourier: Joi.number().default(0),
    dueDays: Joi.number().required(),
    dueDate: Joi.date().required(),
      items: Joi.array().items(Joi.object({
          productId: Joi.string().required(),
          cartons: Joi.number().required(),
          bundles: Joi.number().required(),
          totalWeight: Joi.string().required()
        })).required(),
  }),
};

//module.exports = { createDispatch };


const updateDispatch = {
  body: Joi.object().keys({
    name: Joi.string().optional(),
    DispatchImage: Joi.string().optional(),
    //subDispatch: Joi.array().items(Joi.string().required().custom(objectId)).required(),

  }),
};

const searchDispatches = {
  query: Joi.object().keys({
    search: Joi.string(),
     role: Joi.string().optional(),
        type: Joi.string().optional(),
    ...pageSchema,  // Assuming pageSchema includes pagination parameters
  }),
};

const removeDispatch = {
  params: Joi.object().keys({
    id: Joi.string().required().custom(objectId),  // Assuming id is ObjectId
  }),
};


module.exports = {
  createDispatch,
  updateDispatch,
  searchDispatches,
  removeDispatch,
};
