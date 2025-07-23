const { number } = require("joi");
const mongoose = require("mongoose");

const companyEntity = {
  companyName: {
    type: String,
    required: true,
  },
  logo: {
    type: String,
  },
  revenue: {
    type: Number,
    default: 0,
  },
  numberOfProducts: {
    type: Number,
    default: 0,
  },
  customerRating: {
    type:Number,
    ref: "rating"
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  }
};

const companyStatics = {
  // Static method to create a new company entity
  newEntity(body) {
    return {
      companyName: body.companyName,
      logo: body.logo,
      revenue: body.revenue || 0,
      numberOfProducts: body.numberOfProducts || 0,
      customerRating: body.customerRating || null,
    };
  },
};

module.exports = {
  entity: companyEntity,
  statics: companyStatics,
};