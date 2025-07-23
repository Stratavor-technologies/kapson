"use strict";
const _ = require("underscore");

exports.toModel = (entity) => {
  const model = {
    id: entity._id,
    items: entity.items,
    addressId: entity.addressId,
    orderNumber: entity.orderNumber,
    totalAmount: entity.totalAmount,
    //partyDetails: entity.partyDetails,
   // orderAmount: entity.orderAmount,
    discount: entity.discount,
    status: entity.status,
    userId: entity.userId,
    createdAt: entity.createdAt
  };
  return model;
};

exports.toSearchModel = (entities) => {
  return _.map(entities, exports.toModel);
};
