const mongoose = require("mongoose");

const paymentEntity = {
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "order", 
   // required: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user", 
  },
  dispatchId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "dispatch",
   // required: true,
  },
  invoiceId:{
    type: mongoose.Schema.Types.ObjectId,
    ref: "invoice",
    required:true
  },
  addressId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'address', // This should match your address model name
   
  },
  paymentMethod: {
    type: String,
  },
  paymentStatus: {
    type: String,
  },
  paymentDate: {
    type: Date,
    default: Date.now,
  },
  amount: {
    type: Number,
    required: true,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user", 
  },
  dueDate:{
    type: Date
},
dueDays:{
  type:Number
}
};

let paymentStatics = {};

paymentStatics.newEntity = async (body) => {
  const model = {
    userId:body.user,
    orderId: body.orderId,
    dispatchId: body.dispatchId,
    invoiceId: body.invoiceId,
    addressId: body.addressId,
    paymentMethod: body.paymentMethod,
    paymentStatus: body.paymentStatus || "pending",
    amount: body.amount,
    dueDate: body.dueDate,
    dueDays: body.dueDays
  };

  return model;
};

module.exports = {
  entity: paymentEntity,
  statics: paymentStatics,
};
