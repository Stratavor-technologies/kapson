"use strict";
const _ = require("underscore");

exports.toModel = (entity) => {
    const model = {
        id:entity._id,
        status: entity.status,
        membershipName: entity.membershipName,
        membershipDescription:entity.membershipDescription,
        membershipDuration:entity.membershipDuration,
        stripePriceId:entity.stripePriceId,
        price:entity.price
    };
    return model;
};

exports.toSearchModel = (entities) => {
    return _.map(entities, exports.toModel);
};
