"use strict";
const _ = require("underscore");
const invoice = require("../../core/models/invoice");

exports.toModel = (entity) => {
    const model = {
        id:entity._id,
        invoiceId:entity.invoiceId,
        userId: entity.userId,
        membershipId:entity.membershipId,
        membershipFrom:entity.membershipFrom,
        membershipTo:entity.membershipTo,
        price:entity.price,
        payment:entity.payment,
        status: entity.status,
        stripeSessionUrl:entity.stripeSessionUrl,
        createdAt:entity.createdAt,
        updatedAt:entity.updatedAt,
        stripeMembershipId: entity.stripeMembershipId
    };
    return model;
};

exports.toSearchModel = (entities) => {
    return _.map(entities, exports.toModel);
};
