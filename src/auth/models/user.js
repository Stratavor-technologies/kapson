const crypto = require("../../../helpers/crypto");
const utils = require("../../../helpers/utils");
const authMethods = ["email", "google", "facebook", "apple", "github", "phone"];
const deviceTypes = ["web", "android", "ios"];
const mongoose = require("mongoose");

const entity = {
  // Personal Information
  firstName: {
    type: String,
  },
  lastName: {
    type: String,
  },
  fullName: {
    type: String,
  },
  username: {
    type: String,
  },
  imgUrl: {
    type: String,
    default:
      "https://th.bing.com/th/id/OIP.UJ2vACrcxBESNGI8HPeckQHaGv?w=212&h=193&c=7&r=0&o=5&dpr=1.3&pid=1.7",
  },
  coverImgUrl: {
    type: String,
  },

  // Authentication & Account Info
  deviceId: {
    type: String,
  },
  authMethod: {
    type: String,
    enum: authMethods,
    default: "email",
  },
  countryCode: {
    type: String,
  },
  ISOCode: {
    type: String,
  },
  phone: {
    type: String,
  },
  email: {
    type: String,
  },
  activationCode: {
    type: String,
  },
  uniqueCode: {
    type: String,
  },
  password: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ["pending", "active", "deleted", "blocked"],
    default: "pending",
  },
  role: {
    type: String,
    enum: ["ADMIN", "USER", "DEALER", "DISTRIBUTER"],
  },
  distributerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
  },
  dealershipArea:{
    type: String
  },
  marginPercent:{
    type:Number
  },

  // Address Information
  address: {
    type: String,
  },
  country: {
    type: String,
  },
  state: {
    type: String,
  },
  city: {
    type: String,
  },
  area: {
    type: String,
  },
  zipCode: {
    type: String,
  },

  // Business Details
  firmName: {
    type: String,
  },
  contactPerson: {
    type: String,
  },
  contactNumber: {
    type: String, // Changed from Number to String
  },
  gstNumber: {
    type: String,
  },
  dealershipDetails: {
    type: String,
  },

  // Financial Terms
  // discountPercentage: {
  //   type: Number,
  //   min: 0,
  //   max: 100,
  // },
  creditLimit: {
    type: Number,
    min: 0,
  },
  dueDays: {
    type: Number,
    min: 0,
  },

  // Device & Verification Details
  deviceType: {
    type: String,
    enum: deviceTypes,
  },
  isEmailVerified: {
    type: Boolean,
    default: false,
  },
  isPhoneVerified: {
    type: Boolean,
    default: false,
  },
  isProfileCompleted: {
    type: Boolean,
    default: false,
  },
  isBlocked: {
    type: Boolean,
    default: false,
  },
  lastAccess: {
    type: Date,
    default: null,
  },

  // Additional Business Info
  albumsCount: {
    type: Number,
  },
  connectionCount: {
    type: Number,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user", // Assuming your model name is 'user'
  },
  

  tokens: {},
};

let statics = {};

// The rest of the statics code remains unchanged
statics.newEntity = async (body, createdByAdmin = true) => {
  const model = {
    // Personal Information
    firstName: body.firstName,
    lastName: body.lastName,
    fullName: body.fullName,
    username: body.username,
    imgUrl: body.imgUrl,
    coverImgUrl: body.coverImgUrl,

    // Authentication & Account Info
    deviceId: body.deviceId,
    authMethod: body.authMethod,
    countryCode: body.countryCode,
    ISOCode: body.ISOCode,
    phone: body.phone,
    email: body.email,
    activationCode: body.activationCode,
    uniqueCode: body.uniqueCode,
    role: body.role,
    distributerId: body.distributerId,
    dealershipArea: body.dealershipArea,
    marginPercent: body.marginPercent,
    // Address Information
    address: body.address,
    country: body.country,
    state: body.state,
    city: body.city,
    area: body.area,
    zipCode: body.zipCode,

    // Business Details
    firmName: body.firmName,
    contactPerson: body.contactPerson,
    contactNumber: body.contactNumber,
    gstNumber: body.gstNumber,
    dealershipDetails: body.dealershipDetails,

    // Financial Terms
    //discountPercentage: body.discountPercentage,
    creditLimit: body.creditLimit,
    dueDays: body.dueDays,

    // Device & Verification Details
    deviceType: body.deviceType,

    // Additional Business Info
    albumsCount: body.albumsCount,
    connectionCount: body.connectionCount,
    createdBy: body.createdBy,

    tokens: body.tokens,
  };
  if (body.password) {
    model.password = await crypto.setPassword(body.password);
  }
  if (createdByAdmin) {
    model.isEmailVerified = body.authMethod === "email";
    model.isPhoneVerified = body.authMethod === "phone";
    model.status = "active";
  } else {
    model.activationCode = utils.randomPin();
  }
  return model;
};

// The rest of the statics methods remain unchanged
statics.isEmailTaken = async function (email) {
  return !!(await this.findOne({ email }));
};

statics.isPhoneTaken = async function (phone) {
  return !!(await this.findOne({ phone }));
};

statics.isPasswordMatch = async (user, password) => {
  return await crypto.comparePassword(password, user.password);
};

module.exports = {
  entity,
  statics,
};
