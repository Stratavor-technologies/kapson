const Joi = require("joi");

const { password, phone } = require("../../../validators/common.validation");

// const registerViaEmailOrPhone = {
//   body: Joi.object().keys({
//     phone: Joi.string().required(),
//     authMethod: Joi.string().required().valid("email", "phone"),
//     firstName: Joi.string().required(),
//     lastName: Joi.string().required(),
//     fullName: Joi.string(),
//     email: Joi.when("authMethod", {
//       is: "email", // When authMethod is 'email'
//       then: Joi.string().email().required(), // email is required
//       otherwise: Joi.string().optional(), // optional if authMethod is 'phone'
//     }),
//     phone: Joi.when("authMethod", {
//       is: "phone", // When authMethod is 'phone'
//       then: Joi.string().required(), // phone is required
//       otherwise: Joi.string().optional(), // optional if authMethod is 'email'
//     }),
//     countryCode: Joi.string().optional(),
//     deviceId: Joi.string().required(),
//     deviceType: Joi.string().optional().valid("web", "android", "ios"),
//     password: Joi.string().required(),
//     role: Joi.string()
//       .required()
//       .valid("ADMIN", "SUB-ADMIN", "USER")
//       .default("USER"),
//   }),
// };

const registerViaEmailOrPhone = {
  body: Joi.object().keys({
    authMethod: Joi.string().required().valid("email", "phone"),
    firstName: Joi.string().required(),
    lastName: Joi.string().required(),
    fullName: Joi.string(),
    phone: Joi.string().required(), // Always required, regardless of authMethod
    email: Joi.when("authMethod", {
      is: "email",
      then: Joi.string().email().required(),
      otherwise: Joi.string().optional(),
    }),
    countryCode: Joi.string().optional(),
    deviceId: Joi.string().optional(),
    deviceType: Joi.string().optional().valid("web", "android", "ios"),
    password: Joi.string().required(),
    role: Joi.string()
      .required()
      .valid("ADMIN","USER")
      .default("USER"),
  }),
};

const registerViaPhone = {
  body: Joi.object().keys({
    firstName: Joi.string().required(),
    lastName: Joi.string().required(),
    authMethod: Joi.string().required().valid("phone"),
    countryCode: Joi.string().required(),
    ISOCode: Joi.string(),
    phone: Joi.string().required().custom(phone),
    deviceId: Joi.string().required(),

    deviceType: Joi.string().required().valid("web", "android", "ios"),
  }),
};

const verifyOTP = {
  body: Joi.object().keys({
    userId: Joi.string().required(),
    activationCode: Joi.string().required(),
    deviceId: Joi.string().optional(),
    deviceType: Joi.string().required().valid("web", "android", "ios"),
  }),
};

const login = (data) => {
  return Joi.object()
    .keys({
      username: Joi.string().when("authMethod", {
        is: "phone", // When authMethod is 'phone', username is optional
        then: Joi.optional(),
        otherwise: Joi.string().required(), // In other cases, username is required
      }),
      phone: Joi.string().when("authMethod", {
        is: "email", // When authMethod is 'email', phone is optional
        then: Joi.optional(),
        otherwise: Joi.string().required(), // In other cases, phone is required
      }),
      email: Joi.string().email().when("authMethod", {
        is: "phone", // When authMethod is 'phone', email is optional
        then: Joi.optional(),
        otherwise: Joi.string().email().required(), // In other cases, email is required
      }),
      password: Joi.string().when("verificationType", {
        is: "otp",
        then: Joi.optional(), // If verificationType is 'otp', password is optional
        otherwise: Joi.string().required(), // If verificationType is 'password', password is required
      }),
      authMethod: Joi.string().valid("phone", "both", "email").required(),
      verificationType: Joi.string().valid("otp", "password").required(),
      deviceId: Joi.string().optional(),
      deviceType: Joi.string().required().valid("web", "android", "ios"),
    })
    .or("phone", "username", "email") // At least one of phone, username, or email must be present
    .required()
    .validate(data); // Validate the passed data
};

const resendOtp = {
  body: Joi.object().keys({
    userId: Joi.string().required(),
    authMethod: Joi.string().required().valid("phone", "email"),
    deviceId: Joi.string().optional(),
    deviceType: Joi.string().required().valid("web", "android", "ios"),
  }),
};

const forgotPassword = {
  body: Joi.object().keys({
    verificationType: Joi.string().optional().valid("otp", "password"),
    authMethod: Joi.string().required().valid("phone", "email"),
    username: Joi.string().required(),
    deviceId: Joi.string().required(),
    deviceType: Joi.string().required().valid("web", "android", "ios"),
  }),
};

const updatePassword = {
  body: Joi.object().keys({
    password: Joi.string().required(), //.custom(password),
    newPassword: Joi.string().required(), //.custom(password)
  }),
};

const resetPassword = {
  body: Joi.object().keys({
    password: Joi.string().required(), //.custom(password),
  }),
};

module.exports = {
  registerViaEmailOrPhone,
  registerViaPhone,
  verifyOTP,
  login,
  resendOtp,
  forgotPassword,
  updatePassword,
  resetPassword,
};