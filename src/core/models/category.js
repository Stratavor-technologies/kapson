const mongoose = require("mongoose");

const categoryEntity = {
  name: {
    type: String,
    required: true,
    unique: true,  // Ensures no duplicate category names
  },
  // subCategory: {
  //   type: [{
  //     type: mongoose.Schema.Types.ObjectId,
  //     ref: "subCategory"
  //   }]
  // },
  categoryImage:{
    type: String,
    //default:"https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTLmRNkmDCDQ5eQ0p0NWbP1MvUSFgkxzK0ZTw&s"
  },
 
  updatedAt: {
    type: Date,
    default: Date.now,
  },
};

let categoryStatics = {};

// Static method to create a new category entity
categoryStatics.newEntity = async (body) => {
  const model = {
    name: body.name,
     categoryImage: body. categoryImage,
    //subCategory: body.subCategory,
    createdBy: body.createdBy,  // User who created the category
  };
  
  return model;
};

module.exports = {
  entity: categoryEntity,
  statics: categoryStatics,
};
