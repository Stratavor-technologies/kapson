"use strict";
const _ = require("underscore");

exports.toModel = (entity) => {
  const model = {
    id: entity._id,
    hsnNumber:entity.hsnNumber,
    gstPercentage:entity.gstPercentage,   
    updatedAt: entity.updatedAt,  
  };
  return model;
};

exports.toSearchModel = (entities) => {
  return _.map(entities, exports.toModel);
};
