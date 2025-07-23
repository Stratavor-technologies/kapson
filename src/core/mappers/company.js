"use strict";
const _ = require("underscore");

exports.toModel = (entity) => {
  const model = {
    id: entity._id,
    companyName: entity.companyName,
    logo: entity.logo,
    revenue: entity.revenue,
    numberOfProducts: entity.numberOfProducts,
    customerRating: entity.customerRating,
    createdAt: entity.createdAt,
    updatedAt: entity.updatedAt
  };
  return model;
};

exports.toSearchModel = (entities) => {
  return _.map(entities, exports.toModel);
};