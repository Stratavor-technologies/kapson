"use strict";
const _ = require("underscore");

exports.toModel = (entity) => {
    const model = {
        id: entity.id || entity._id,
        items: entity.items,
        userId: entity.userId,
        totalAmount: entity.totalAmount,
        createdAt: entity.createdAt,
        //updatedAt: entity.updatedAt
    }
    return model;
}
exports.toSearchModel = (entities) => {
    return _.map(entities, exports.toModel);
}   
