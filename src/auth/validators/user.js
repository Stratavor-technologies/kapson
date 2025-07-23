const Joi = require("joi");
const {
  password,
  phone,
  objectId, 
  pageSchema,
} = require("../../../validators/common.validation");

const createUser = {
  body: Joi.object().keys({
    // Basic Info
    firstName: Joi.string(),
    lastName: Joi.string(),
    fullName: Joi.string(),
    username: Joi.string(),
    imgUrl: Joi.string().uri(),
    coverImgUrl: Joi.string().uri(),

    // Authentication & Account Info
    authMethod: Joi.string().optional().valid("email", "phone"),
    deviceId: Joi.string(),
    countryCode: Joi.string(),
    ISOCode: Joi.string(),
    phone: Joi.string().required(),
    email: Joi.string().required().email(),
    password: Joi.string().required().custom(password),
    status: Joi.string()
      .valid("pending", "active", "deleted", "blocked")
      .default("pending"),
    role: Joi.string()
      .required()
      .valid("ADMIN", "USER", "DEALER", "DISTRIBUTER"),
    distributerId: Joi.string().optional().custom(objectId),
    marginPercent: Joi.number().optional(),

    // Address Information
    address: Joi.string(),
    country: Joi.string(),
    state: Joi.string(),
    city: Joi.string(),
    area: Joi.string(),
    zipCode: Joi.string(),

    // Business Details
    firmName: Joi.string(),
    contactPerson: Joi.string(),
    gstNumber: Joi.string(),
    dealershipDetails: Joi.string(),

    // Financial Terms
    //discountPercentage: Joi.number().min(0).max(100),
    creditLimit: Joi.number().min(0),
    dueDays: Joi.number().min(0),

    // Device Details
    deviceType: Joi.string(),

    // Additional Business Info
    albumsCount: Joi.number(),
    connectionCount: Joi.number(),
    createdBy: Joi.string().optional().custom(objectId)
  }),
};

const updateUser = {
  params: Joi.object().keys({
    userId: Joi.string().custom(objectId),
  }),
  body: Joi.object()
    .keys({
      // Basic Info
      firstName: Joi.string(),
      lastName: Joi.string(),
      fullName: Joi.string(),
      username: Joi.string(),
      imgUrl: Joi.string().uri(),
      coverImgUrl: Joi.string().uri(),

      // Authentication & Account Info
      countryCode: Joi.string(),
      ISOCode: Joi.string(),
      phone: Joi.string(),
      email: Joi.string().email(),
      status: Joi.string().valid("pending", "active", "deleted", "blocked"),
      role: Joi.string().valid("ADMIN", "USER", "DEALER", "DISTRIBUTER"),
      

      // Address Information
      address: Joi.string(),
      country: Joi.string(),
      state: Joi.string(),
      city: Joi.string(),
      area: Joi.string(),
      zipCode: Joi.string(),

      // Business Details
      firmName: Joi.string(),
      contactPerson: Joi.string(),
      gstNumber: Joi.string(),
      dealershipDetails: Joi.string(),

      // Financial Terms
      discountPercentage: Joi.number().min(0).max(100),
      creditLimit: Joi.number().min(0),
      dueDays: Joi.number().min(0),

      // Additional Business Info
      albumsCount: Joi.number(),
      connectionCount: Joi.number(),
      stripeCustomerId: Joi.string()
    })
    .min(1),
};

const getUsers = {
  query: Joi.object().keys({
    search: Joi.string(),
    role:Joi.string().optional(),
    ...pageSchema
  }),
};

const getUser = {
  params: Joi.object().keys({
    userId: Joi.string().custom(objectId),
  }),
};

const deleteUser = {
  params: Joi.object().keys({
    userId: Joi.string().custom(objectId),
  }),
};

module.exports = {
  createUser,
  updateUser,
  getUser,
  getUsers,
  deleteUser,
};
