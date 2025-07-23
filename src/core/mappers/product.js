"use strict";
const _ = require("underscore");

exports.toModel = (entity) => {
  const model = {
    id: entity._id,
    productName: entity.productName,
    productImage: entity.productImage,
    ArtNumber: entity.ArtNumber,
    category: entity.category,
    subCategory: entity.subCategory,
    hsnNumber: entity.hsnNumber,
    mrp: entity.mrp,
    stock: entity.stock,
    basicPrice: entity.basicPrice,
    productDescription: entity.productDescription,
    productFeature: entity.productFeature,
    applicationDetails: entity.applicationDetails,
    packagingDetails: entity.packagingDetails,
    updatedAt: entity.updatedAt,

  };
  return model;
};

exports.toSearchModel = (entities) => {
  return _.map(entities, exports.toModel);
};