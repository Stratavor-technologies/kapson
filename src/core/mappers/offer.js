"use strict";
const _ = require("underscore");

exports.toModel = (entity) => {
  const model = {
      id: entity._id,
      userId: entity.userId,
      offerStartsOn: entity.offerStartsOn,
      offerEndsOn: entity.offerEndsOn,
      offerHeading: entity.offerHeading,
      offerDetails: entity.offerDetails
     
  };
  return model;
};

exports.toSearchModel = (entities) => {
  return _.map(entities, exports.toModel);
};
