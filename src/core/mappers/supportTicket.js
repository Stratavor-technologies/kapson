"use strict";
const _ = require("underscore");

exports.toModel = (entity) => {
  const model = {
    id: entity._id,                  // Unique ID for the support ticket
    userId: entity.userId,           // ID of the user who created the ticket
    supportStaffId: entity.supportStaffId, // ID of the support staff assigned, if any
    issue: entity.issue,             // The issue described in the ticket
    status: entity.status,           // Current status of the ticket (open, in_progress, resolved)
    createdAt: entity.createdAt,     // When the ticket was created
    updatedAt: entity.updatedAt,     // When the ticket was last updated
  };
  return model;
};

exports.toSearchModel = (entities) => {
  return _.map(entities, exports.toModel);
};
