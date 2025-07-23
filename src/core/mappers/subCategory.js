"use strict";
const _ = require("underscore");

exports.toModel = (entity) => {
  const model = {
    id: entity._id,
    name: entity.name,
    image: entity.image,
    category: entity.category,// Subcategory name
    // createdBy: entity.createdBy ? {  // User who created the subcategory
    //   id: entity.createdBy._id,
    //   name: entity.createdBy.name,
    // } : null,
    // createdAt: entity.createdAt,     // Date of subcategory creation
    updatedAt: entity.updatedAt,     // Date of the last update
  };
  return model;
};

exports.toSearchModel = (entities) => {
  return _.map(entities, exports.toModel);
};
