const mongoose = require("mongoose");

const ratingEntity = {
  medicineId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "medicine"
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5,
  },
  review: {
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
  // createdBy: {
  //   type: mongoose.Schema.Types.ObjectId,
  //   ref: "user",
  //   default:null
  // },
};

let ratingStatics = {};

// Static method to create a new rating entity
ratingStatics.newEntity = async (body) => {
  const model = {
    medicineId: body.medicineId,
    userId: body.userId,
    rating: body.rating,
    review: body.review,
    //createdBy: body.createdBy,
  };
  return model;
};

module.exports = {
  entity: ratingEntity,
  statics: ratingStatics,
};