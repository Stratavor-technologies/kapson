const { number } = require("joi");
const mongoose = require("mongoose");

const entity = {
  productName: {
    type: String,
    required: true,
  },
  productImage: {
    type: [String], 
  },
  ArtNumber: {
    type: String,
  },
  category: {
     type: mongoose.Schema.Types.ObjectId,
     ref: 'category',
   },
   subCategory: {
     type: mongoose.Schema.Types.ObjectId,
     ref: 'subCategory',
  },
  hsnNumber: {
      type: mongoose.Schema.Types.ObjectId,
     ref: 'hsnNumber',
   },
  mrp: {
    type: Number
  },
  basicPrice: {
    type: Number,
  },
  stock: {
    type: Number
  },
  productDescription: {
    type: String
  },
  productFeature: {
    type:[String]
  },
  applicationDetails: {
    type: [String],
    enum: ['Automobile', 'Industries', 'Agriculture', 'Construction']
  },
  packagingDetails: {
    piecesInPack: {
      type: Number,
    },
    piecesInBox: {
      type: Number,
    }
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  }
};
let productStatics = {};
productStatics.newEntity = async (body) => {
  const model = {
    productName: body.productName,
    productImage: body.productImage,
    ArtNumber: body.ArtNumber,
    category: body.category,
    subCategory: body.subCategory,
    hsnNumber: body.hsnNumber,
    mrp: body.mrp,
    stock: body.stock,
    basicPrice: body.basicPrice,
    productDescription: body.productDescription,
    productFeature: body.productFeature,
    applicationDetails: body.applicationDetails,
    packagingDetails: body.packagingDetails,
  };
  return model;
};

module.exports = {
  statics: productStatics,
   entity
  ,
};