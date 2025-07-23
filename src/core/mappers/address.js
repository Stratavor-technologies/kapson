"use strict";
const _ = require("underscore");

exports.toModel = (entity) => {
    const model = {
        _id: entity._id,
        partyDetails: entity.partyDetails,
        firstName:entity.firstName,
       lastName:entity.lastName,
       address:entity.address,
       country:entity.country,
       state:entity.state,
       city:entity.city,    
       zipCode:entity.zipCode,
       email:entity.email,
       phoneNumber:entity.phoneNumber,
       createdBy: entity.createdBy
    }
    return model;
}       
exports.toSearchModel = (entities) => {
    return _.map(entities, exports.toModel);
}   
