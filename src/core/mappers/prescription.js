"use strict";
const _ = require("underscore");

exports.toModel = (entity) => {
  const model = {
    id: entity._id,
    userId: entity.userId,            // Reference to the user who uploaded the prescription
    fileUrl: entity.fileUrl,          // URL or path to the prescription file
    status: entity.status,            // Status of the prescription (pending, verified, rejected)
    uploadedAt: entity.uploadedAt,    // Date when the prescription was uploaded
    verifiedAt: entity.verifiedAt,    // Optional date when the prescription was verified
  };
  return model;
};

exports.toSearchModel = (entities) => {
  return _.map(entities, exports.toModel);
};
