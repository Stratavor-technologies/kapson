"use strict";
const _ = require("underscore");
//const category = require("../models/category");

exports.toModel = (entity) => {
  const model = {
    id: entity._id,
    name: entity.name,               
    //subCategory: entity.subCategory,
    categoryImage: entity.categoryImage,     
    // createdBy: entity.createdBy ? {  
    //   id: entity.createdBy._id,
    //   name: entity.createdBy.name,
    // } : null,
    // createdAt: entity.createdAt,    
    updatedAt: entity.updatedAt,   
  };
  return model
};

exports.toSearchModel = (entities) => {
  return _.map(entities, exports.toModel);
};
