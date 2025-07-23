"use strict";
const _ = require("underscore");

exports.toModel = (entity) => {
    const model = {
        id:entity._id,
        titleBanner: entity.titleBanner,
        placement: entity.placement,
        description: entity.description,
        status: entity.status,
        type: entity.type,
        imageUrl: entity.imageUrl,
        createdAt: entity.createdAt,
        updatedAt: entity.updatedAt

    }
    return model;
}      
exports.toSearchModel = (entities) => {
    return _.map(entities, exports.toModel);
}   
