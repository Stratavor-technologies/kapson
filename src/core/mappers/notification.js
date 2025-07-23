"use strict";
const _ = require("underscore");

exports.toModel = (entity) => {
  const model = {
      id: entity._id,
     userId: entity._id,
      validTill: entity.validTill,
      notificationHeading: entity.notificationHeading,
      notification: entity.notification
     
  };
  return model;
};

exports.toSearchModel = (entities) => {
  return _.map(entities, exports.toModel);
};
