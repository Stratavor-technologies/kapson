"use strict";
const _ = require("underscore");
const sessionMapper = require("./session");

exports.toModel = (entity) => {
  const model = {
    id: entity._id,
    firstName: entity.firstName,
    lastName: entity.lastName,
    fullName: entity.fullName,
    username: entity.username,
    imgUrl: entity.imgUrl,
    coverImgUrl: entity.coverImgUrl,

    // Authentication & Account Info
    deviceId: entity.deviceId,
    authMethod: entity.authMethod,
    countryCode: entity.countryCode,
    ISOCode: entity.ISOCode,
    phone: entity.phone,
    email: entity.email,
    status: entity.status,
    role: entity.role,
    distributerId: entity.distributerId,
    dealershipArea: entity.dealershipArea,
    marginPercent: entity.marginPercent,
    // Address Information
    address: entity.address,
    country: entity.country,
    state: entity.state,
    city: entity.city,
    area: entity.area,
    zipCode: entity.zipCode,

    // Business Details
    firmName: entity.firmName,
    contactPerson: entity.contactPerson,
    gstNumber: entity.gstNumber,
    dealershipDetails: entity.dealershipDetails,

    // Financial Terms
    discountPercentage: entity.discountPercentage,
    creditLimit: entity.creditLimit,
    dueDays: entity.dueDays,

    // Device & Verification Details
    deviceType: entity.deviceType,
    isEmailVerified: entity.isEmailVerified,
    isPhoneVerified: entity.isPhoneVerified,
    isProfileCompleted: entity.isProfileCompleted,
    isBlocked: entity.isBlocked,
    lastAccess: entity.lastAccess,

    // Additional Business Info
    albumsCount: entity.albumsCount,
    connectionCount: entity.connectionCount,
    createdBy: entity.createdBy,
  };
  return model;
};

exports.toSearchModel = (entities) => {
  return _.map(entities, exports.toModel);
};

exports.toAuthModel = (entity) => {
  let model = exports.toModel(entity);
  if (entity.session) {
    model.session = sessionMapper.toModel(entity.session);
  }
  return model;
};
