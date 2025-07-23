"use strict";
const _ = require("underscore");

exports.toModel = (entity) => {
  const model = {
    id: entity._id,
    invoiceId:entity.invoiceId,
    userId:entity.userId,
    orderId:entity.orderId,
    paymentId:entity.paymentId, 
    invoiceType:entity.invoiceType,
    userMembership:entity.userMembership,    
    createdAt: entity.createdAt,      
    updatedAt: entity.updatedAt,  
    invoiceFrom:entity.invoiceFrom    
  };
  return model;
};

exports.toSearchModel = (entities) => {
  return _.map(entities, exports.toModel);
};
