"use strict";
const _ = require("underscore");
const payment = require("../models/payment");

exports.toModel = (entity) => {
  const model = {
    id: entity._id,
    userId: entity.userId,
    invoiceId: entity.invoiceId,
    addressId: entity.addressId,
    paymentId: entity.paymentId,
    dispatchedFrom: entity.dispatchedFrom || "Kapson Tools",
    customerName: entity.customerName,
    orderId: entity.orderId,
    margin: entity.margin || 0,
    grNo: entity.grNo,
    transport: entity.transport,
    vehicleNo: entity.vehicleNo,
    ewayBillNo: entity.ewayBillNo,
    adPercent: entity.adPercent || 0,
    cdPercent: entity.cdPercent || 0,
    privateMark: entity.privateMark,
    freightCharge: entity.freightCharge || 0,
    courierCharge: entity.courierCharge || 0,
    gstOnCourier: entity.gstOnCourier || 0,
    grandTotal: entity.grandTotal || 0,
    updatedAt: entity.updatedAt,
    dueDate: entity.dueDate,
    dueDays: entity.dueDays,
     items: entity.items
  };
  return model;
};

exports.toSearchModel = (entities) => {
  return _.map(entities, exports.toModel);
};
