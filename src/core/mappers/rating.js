"use strict";
const _ = require("underscore");

exports.toModel = (entity) => {
  const model = {
    id: entity._id,
    medicineId: entity.medicineId,
    userId: entity.userId,
    rating: entity.rating,
    review: entity.review,
    createdAt: entity.createdAt,
    updatedAt: entity.updatedAt,
   // createdBy: entity.createdBy,
  };
  return model;
};

exports.toSearchModel = (entities) => {
  return _.map(entities, exports.toModel);
};