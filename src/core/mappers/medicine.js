"use strict";
const _ = require("underscore");

exports.toModel = (entity) => {
  const model = {
    id: entity._id,
    medicineName: entity.medicineName,
    category: entity.category, 
    subCategory: entity.subCategory, // Changed to direct string instead of object
    stock: entity.stock,
    price: entity.price,
    image: entity.image || [], // Changed from uploadImage to image, with default empty array
    expireDate: entity.expireDate || '', // Added default empty string
    manufacturerDate: entity.manufacturerDate, // Added new field
    status: entity.status || 'AVAILABLE', // Added default value
    company: entity.company,
    medicineDetails: entity.medicineDetails || '', // Added default empty string
    createdBy: entity.createdBy || '', // Added with default empty string
    createdAt: entity.createdAt,
    updatedAt: entity.updatedAt,
    ratings: entity.ratings,
    averageRating:entity.averageRating,
    totalRatings:entity.totalRatings
  };
  return model;
};

exports.toSearchModel = (entities) => {
  return _.map(entities, exports.toModel);
};
