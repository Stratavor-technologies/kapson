const mongoose = require("mongoose");
const category = require("./category");

const subcategoryEntity = {
  name: {
    type: String,
    required: true,
    unique: true,  
  },
  category: {
     type: mongoose.Schema.Types.ObjectId,
    ref: "category"
  },
  image: {
    type: String,
  },
  // createdBy: {
  //   type: mongoose.Schema.Types.ObjectId,
  //   ref: "user",  // Reference to the user who created the subcategory

  // },
  // createdAt: {
  //   type: Date,
  //   default: Date.now,
  // },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
};

let subcategoryStatics = {};

// Static method to create a new subcategory entity
subcategoryStatics.newEntity = async (body) => {
  const model = {
    name: body.name,
    image: body.image,
    category: body.category,
    createdBy: body.createdBy,  // User who created the subcategory
  };
  return model;
};

module.exports = {
  entity: subcategoryEntity,
  statics: subcategoryStatics,
};
