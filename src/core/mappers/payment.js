"use strict";
const _ = require("underscore");

exports.toModel = (entity) => {
  const model = {
    id: entity._id,
    dispatchId: entity.dispatchId,
    invoiceId: entity.invoiceId,
    addressId: entity.addressId,
    orderId: entity.orderId,               // Reference to the order this payment belongs to
    paymentMethod: entity.paymentMethod,   // Payment method used (credit card, UPI, etc.)
    paymentStatus: entity.paymentStatus,                 // Current status of the payment
    paymentDate: entity.paymentDate,       // Date when the payment was made
    amount: entity.amount,  
    userId:entity.userId,
    createdBy: entity.createdBy || '', // Added with default empty string
    createdAt: entity.createdAt,
    updatedAt: entity.updatedAt,  
    dueDate: entity.dueDate,
    dueDays: entity.dueDays            // Payment amount
  };
  return model;
};

exports.toSearchModel = (entities) => {
  return _.map(entities, exports.toModel);
};
