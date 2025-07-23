const mongoose = require("mongoose");

const bannerEntity = {
  titleBanner: {
    type: String,
    required: true,
  },
  placement: {
    type: String,
    required: true,
    enum: [
      'homepage', 
      'sidebar', 
      'footer', 
      'popup',  
      'landing_page', 
      'category_page'
    ]
  },
  status: {
    type: String,
    required: true,
    enum: ['active', 'inactive'],
    default: 'inactive'
  },
  type: {
    type: String,
    required: true,
    enum: [
      'web','android','ios'
    ]
  },
  imageUrl: {
    type: String,
    required: false
  },
  description:{
    type: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
 
};

let bannerStatics = {};

// Static method to create a new banner entity
bannerStatics.newEntity = async (body) => {
  const model = {
    titleBanner: body.titleBanner,
    placement: body.placement,
    description:body.description,
    status: body.status || 'inactive',
    type: body.type,
    imageUrl: body.imageUrl,
    
  };
  return model;
};


module.exports = {
  statics: bannerStatics,
  entity: bannerEntity
};