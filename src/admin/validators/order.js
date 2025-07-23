const Joi = require("joi");
const {
  objectId,
  pageSchema,
} = require("../../../validators/common.validation");


const createOrder = {
  body: Joi.object().keys({
    items: Joi.array()
      .items(
        Joi.object({
          productId: Joi.string().required().custom(objectId),
          quantity:  Joi.number().required(),
          totalPrice: Joi.number(),
          cartons: Joi.number().optional(),
          bundles: Joi.number().optional(),
          totalWeight: Joi.string().optional()
        })
      )
      .optional(),
      totalAmount:Joi.number().optional(),

    orderAmount: Joi.object({
      discount: Joi.string(),
    }),

    userId: Joi.string().required().custom(objectId),

    status: Joi.string()
      .valid(
        "PENDING",
        "PROCESSING",
        "SHIPPED",
        "OUT FOR DELIVERY",
        "DELIVERED",
        "CANCELLED"
      )
      .default("PENDING"),
  }),
};

const updateOrder = {
  body: Joi.object().keys({
    items: Joi.array()
      .items(
        Joi.object({
          productId: Joi.string().optional().custom(objectId),
          quantity: Joi.number().optional(),
          price: Joi.number().optional(),
        })
      )
      .optional(),
    userId: Joi.string().optional().custom(objectId),
    totalAmount: Joi.number().optional(),
    status: Joi.string()
      .valid("PENDING", "PROCESSED", "SHIPPED", "DELIVERED", "CANCELLED")
      .optional(),
    isPayment: Joi.string().valid("true", "false").optional(),
    paymentId: Joi.string().optional(),
  }),
};

const searchOrder = {
  query: Joi.object().keys({
    search: Joi.string(),
    userId: Joi.string().regex(/^[0-9a-fA-F]{24}$/),
    status: Joi.string().allow("").optional(), // Allows empty string and makes it optional
    createdAt: Joi.string().allow("").optional(),
    startDate: Joi.string().allow("").optional(),
    endDate: Joi.string().allow("").optional(),
    role: Joi.string().optional(),
    type: Joi.string().optional(),
    
    ...pageSchema, // Assuming pageSchema includes pagination parameters
  }),
};

const getOrderById = {
  params: Joi.object().keys({
    id: Joi.string().required().custom(objectId),
    userId: Joi.string().regex(/^[0-9a-fA-F]{24}$/), // Assuming id is ObjectId
  }),
};

const removeOrder = {
  params: Joi.object().keys({
    id: Joi.string().required().custom(objectId), // Assuming id is ObjectId
  }),
};

module.exports = {
  createOrder,
  updateOrder,
  searchOrder,
  getOrderById,
  removeOrder,
};
